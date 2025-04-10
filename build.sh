#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist

# Install dependencies
npm install

# Build CSS
npm run build:css

# Copy static files to dist
cp src/js/app.js dist/
cp favicon.svg dist/
cp src/js/*.js dist/
cp *.html dist/

# Copy other HTML files to dist
for file in markets.html transactions.html settings.html; do
    if [ -f "$file" ]; then
        cp "$file" dist/
    fi
done

echo "Build completed! Production files are in the dist directory."
echo "To serve the production build:"
echo "cd dist && python3 -m http.server 8000"
