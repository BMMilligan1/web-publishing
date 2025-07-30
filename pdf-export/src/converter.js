import puppeteer from 'puppeteer';
import { glob } from 'glob';
import { readFile, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import { HTMLPreprocessor } from './preprocessor.js';
import { StyleManager } from './styler.js';
import { 
  Logger, 
  ensureDirectory, 
  getDocumentType, 
  generateOutputPath, 
  shouldExclude,
  delay,
  formatBytes,
  formatDuration
} from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PDFConverter {
  constructor(options = {}) {
    this.distDir = options.distDir || join(__dirname, '..', '..', 'dist');
    this.outputDir = options.outputDir || join(__dirname, '..', 'output');
    this.configPath = options.configPath || join(__dirname, '..', 'config', 'config.json');
    
    this.preprocessor = new HTMLPreprocessor();
    this.styleManager = new StyleManager();
    this.logger = new Logger(options.verbose !== false);
    
    this.config = null;
    this.browser = null;
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      startTime: Date.now()
    };
  }

  async init() {
    try {
      // Load configuration
      const configContent = await readFile(this.configPath, 'utf8');
      this.config = JSON.parse(configContent);
      
      // Ensure output directory exists
      await ensureDirectory(this.outputDir);
      
      this.logger.info('PDF Converter initialized');
      this.logger.info(`Input directory: ${this.distDir}`);
      this.logger.info(`Output directory: ${this.outputDir}`);
      
    } catch (error) {
      this.logger.error(`Failed to initialize: ${error.message}`);
      throw error;
    }
  }

  async findHTMLFiles() {
    const pattern = join(this.distDir, '**/*.html');
    const files = await glob(pattern);
    
    // Filter out excluded files
    const filteredFiles = files.filter(file => 
      !shouldExclude(file, this.config.excludeFiles)
    );
    
    this.logger.info(`Found ${filteredFiles.length} HTML files to convert`);
    return filteredFiles;
  }

  getPageConfig(filePath) {
    const documentType = getDocumentType(filePath);
    const specificConfig = this.config.documents[documentType] || {};
    
    return {
      ...this.config.defaults,
      ...specificConfig
    };
  }

  async convertFile(filePath) {
    const startTime = Date.now();
    let page;
    
    try {
      this.logger.info(`Converting: ${filePath}`);
      
      // Create new page
      page = await this.browser.newPage();
      
      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 2
      });
      
      // Get configuration first
      const documentType = getDocumentType(filePath);
      const pageConfig = this.getPageConfig(filePath);
      
      // Navigate to the file URL to properly load all resources and execute JavaScript
      const fileUrl = `file://${filePath}`;
      await page.goto(fileUrl, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: pageConfig.timeout || 30000
      });
      
      // Inject custom styles after page load
      const styles = await this.styleManager.loadStyles();
      await page.addStyleTag({ content: styles });
      
      // Apply page-specific styles if needed
      if (pageConfig) {
        const pageStyles = this.styleManager.generatePageStyles(pageConfig);
        if (pageStyles) {
          await page.addStyleTag({ content: pageStyles });
        }
      }
      
      // Wait for Observable Framework to finish rendering
      await page.waitForFunction(() => {
        // Check if Observable loading indicators are gone
        const loadingElements = document.querySelectorAll('observablehq-loading');
        if (loadingElements.length > 0) return false;
        
        // Check if SVGs have been rendered (they should have content)
        const svgs = document.querySelectorAll('svg');
        if (svgs.length === 0) {
          // If no SVGs yet, check if there are Observable cell placeholders
          const cells = document.querySelectorAll('[id^="cell-"]');
          return cells.length === 0 || Array.from(cells).every(cell => cell.children.length > 0);
        }
        
        return Array.from(svgs).every(svg => svg.children.length > 0);
      }, { timeout: 30000 }).catch(() => {
        this.logger.warn(`Observable render timeout for ${filePath}`);
      });
      
      // Log visualization count for debugging
      const svgCount = await page.evaluate(() => document.querySelectorAll('svg').length);
      if (svgCount > 0) {
        this.logger.info(`Found ${svgCount} SVG visualization(s)`);
      }
      
      // Wait for any async content
      if (this.config.waitConditions) {
        const { waitForSVGs, waitForImages, additionalWaitTime } = this.config.waitConditions;
        
        if (waitForSVGs) {
          await page.waitForFunction(() => {
            const svgs = document.querySelectorAll('svg');
            return Array.from(svgs).every(svg => 
              svg.children.length > 0 || svg.hasAttribute('data-rendered')
            );
          }, { timeout: 10000 }).catch(() => {
            this.logger.warn(`SVG wait timeout for ${filePath}`);
          });
        }
        
        if (waitForImages) {
          await page.waitForFunction(() => {
            const images = document.querySelectorAll('img');
            return Array.from(images).every(img => img.complete);
          }, { timeout: 10000 }).catch(() => {
            this.logger.warn(`Image wait timeout for ${filePath}`);
          });
        }
        
        if (additionalWaitTime) {
          await delay(additionalWaitTime);
        }
      }
      
      // Generate output path
      const outputPath = generateOutputPath(filePath, this.distDir, this.outputDir);
      await ensureDirectory(dirname(outputPath));
      
      // Generate PDF
      await page.pdf({
        path: outputPath,
        format: pageConfig.format,
        landscape: pageConfig.landscape,
        margin: pageConfig.margin,
        printBackground: pageConfig.printBackground,
        preferCSSPageSize: pageConfig.preferCSSPageSize,
        displayHeaderFooter: pageConfig.displayHeaderFooter
      });
      
      // Get file size for reporting
      const stats = await stat(outputPath);
      const duration = Date.now() - startTime;
      
      this.logger.success(`Generated: ${outputPath} (${formatBytes(stats.size)}) in ${formatDuration(duration)}`);
      this.stats.successful++;
      
    } catch (error) {
      this.logger.error(`Failed to convert ${filePath}: ${error.message}`);
      this.stats.failed++;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async convertAll(options = {}) {
    try {
      await this.init();
      
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--font-render-hinting=none'
        ]
      });
      
      // Find all HTML files
      const htmlFiles = await this.findHTMLFiles();
      this.stats.total = htmlFiles.length;
      
      if (htmlFiles.length === 0) {
        this.logger.warn('No HTML files found to convert');
        return;
      }
      
      // Convert files
      if (options.parallel && options.parallel > 1) {
        // Parallel processing
        const chunks = [];
        for (let i = 0; i < htmlFiles.length; i += options.parallel) {
          chunks.push(htmlFiles.slice(i, i + options.parallel));
        }
        
        for (const chunk of chunks) {
          await Promise.all(chunk.map(file => this.convertFile(file)));
        }
      } else {
        // Sequential processing
        for (let i = 0; i < htmlFiles.length; i++) {
          this.logger.progress(i + 1, htmlFiles.length, `Processing files...`);
          await this.convertFile(htmlFiles[i]);
        }
      }
      
      // Report results
      const totalDuration = Date.now() - this.stats.startTime;
      this.logger.info('');
      this.logger.info('Conversion complete:');
      this.logger.success(`✓ ${this.stats.successful} files converted successfully`);
      if (this.stats.failed > 0) {
        this.logger.error(`✗ ${this.stats.failed} files failed`);
      }
      this.logger.info(`Total time: ${formatDuration(totalDuration)}`);
      
    } catch (error) {
      this.logger.error(`Fatal error: ${error.message}`);
      process.exit(1);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async convertSingle(filePath, options = {}) {
    try {
      await this.init();
      
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--font-render-hinting=none'
        ]
      });
      
      this.stats.total = 1;
      await this.convertFile(filePath);
      
    } catch (error) {
      this.logger.error(`Fatal error: ${error.message}`);
      process.exit(1);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  program
    .name('pdf-export')
    .description('Convert Observable Framework HTML output to PDF')
    .version('1.0.0')
    .option('-i, --input <dir>', 'Input directory (dist folder)', '../dist')
    .option('-o, --output <dir>', 'Output directory for PDFs', './output')
    .option('-c, --config <path>', 'Configuration file path', './config/config.json')
    .option('-f, --file <path>', 'Convert a single file')
    .option('-p, --parallel <number>', 'Number of parallel conversions', parseInt, 1)
    .option('-v, --verbose', 'Verbose output', true)
    .option('-q, --quiet', 'Quiet mode (minimal output)', false)
    .parse();

  const options = program.opts();
  
  const converter = new PDFConverter({
    distDir: join(dirname(fileURLToPath(import.meta.url)), '..', options.input),
    outputDir: join(dirname(fileURLToPath(import.meta.url)), '..', options.output),
    configPath: join(dirname(fileURLToPath(import.meta.url)), '..', options.config),
    verbose: !options.quiet
  });

  if (options.file) {
    converter.convertSingle(options.file, { parallel: options.parallel });
  } else {
    converter.convertAll({ parallel: options.parallel });
  }
}