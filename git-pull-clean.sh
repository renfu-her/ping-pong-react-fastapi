#!/bin/bash
# Safe git pull that handles __pycache__ conflicts on production server

echo "Step 1: Cleaning local __pycache__ directories..."
find backend/app -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

echo "Step 2: Removing __pycache__ from git index..."
git rm -r --cached backend/app/__pycache__ 2>/dev/null || true
git rm -r --cached backend/app/*/__pycache__ 2>/dev/null || true
git rm -r --cached backend/app/*/*/__pycache__ 2>/dev/null || true

echo "Step 3: Pulling latest changes..."
git pull

echo "Done! __pycache__ files will be regenerated automatically when Python runs."
