#!/bin/bash

# GHXSTSHIP GitHub Push Script
# Run this after creating the repository on GitHub

echo "🚀 Pushing GHXSTSHIP to GitHub..."

# Add the remote origin (replace YOUR_USERNAME with your GitHub username)
/usr/bin/git remote add origin https://github.com/YOUR_USERNAME/ghxstship-saas.git

# Set the default branch to main
/usr/bin/git branch -M main

# Push to GitHub
/usr/bin/git push -u origin main

echo "✅ GHXSTSHIP successfully pushed to GitHub!"
echo "🌐 Repository URL: https://github.com/YOUR_USERNAME/ghxstship-saas"
