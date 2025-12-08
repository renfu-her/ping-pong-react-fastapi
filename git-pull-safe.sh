#!/bin/bash
# Safe git pull script that handles __pycache__ conflicts

echo "Cleaning local __pycache__ directories..."
find backend/app -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

echo "Removing __pycache__ from git index if tracked..."
git rm -r --cached backend/app/__pycache__ 2>/dev/null || true
git rm -r --cached backend/app/*/__pycache__ 2>/dev/null || true

echo "Pulling latest changes..."
git pull

echo "Done!"

