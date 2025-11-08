#!/bin/bash

# Paper Film PWA Test Script
# This script builds and serves the PWA for testing

echo "🎬 Paper Film PWA Test Script"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build
echo -e "${BLUE}📦 Building production bundle...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful!${NC}"
    echo ""
else
    echo -e "${YELLOW}✗ Build failed. Please fix errors and try again.${NC}"
    exit 1
fi

# Step 2: Show bundle size
echo -e "${BLUE}📊 Bundle analysis:${NC}"
ls -lh dist/assets/*.js | awk '{print $9, $5}'
echo ""

# Step 3: Preview
echo -e "${BLUE}🚀 Starting preview server...${NC}"
echo -e "${YELLOW}To test PWA features:${NC}"
echo "1. Open the URL below in your browser"
echo "2. Open DevTools (F12)"
echo "3. Go to Application tab"
echo "4. Check Service Workers and Manifest"
echo "5. Test offline mode (Network tab > Offline)"
echo "6. Try installing the app"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop the server${NC}"
echo ""

npm run preview
