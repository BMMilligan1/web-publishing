#!/bin/bash
# Script to add .env secrets to GitHub (requires gh CLI)

# First install GitHub CLI if needed:
# brew install gh

# Authenticate with GitHub
# gh auth login

# Add secrets from .env file
source .env

echo "Adding ZENODO_TOKEN to GitHub Secrets..."
gh secret set ZENODO_TOKEN --body="$ZENODO_TOKEN"

echo "Adding NETLIFY_AUTH_TOKEN to GitHub Secrets..."
gh secret set NETLIFY_AUTH_TOKEN --body="$NETLIFY_AUTH_TOKEN"

echo "Done! Secrets have been added to your repository."