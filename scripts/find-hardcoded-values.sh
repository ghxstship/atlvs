#!/bin/bash

# Simple script to find and fix hardcoded values in GHXSTSHIP codebase

echo "🔍 GHXSTSHIP Hardcoded Values Detection"
echo "======================================"
echo ""

ROOT_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"

# Define colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Searching for hardcoded padding values...${NC}"
find "$ROOT_DIR" -name "*.css" -not -path "*/node_modules/*" -exec grep -Hn "padding: [0-9]" {} \; 2>/dev/null

echo ""
echo -e "${BLUE}📋 Searching for hardcoded margin values...${NC}"
find "$ROOT_DIR" -name "*.css" -not -path "*/node_modules/*" -exec grep -Hn "margin: [0-9]" {} \; 2>/dev/null

echo ""
echo -e "${BLUE}📋 Searching for hardcoded width values...${NC}"
find "$ROOT_DIR" -name "*.css" -not -path "*/node_modules/*" -exec grep -Hn "width: [0-9]" {} \; 2>/dev/null | head -10

echo ""
echo -e "${BLUE}📋 Searching for hardcoded height values...${NC}"
find "$ROOT_DIR" -name "*.css" -not -path "*/node_modules/*" -exec grep -Hn "height: [0-9]" {} \; 2>/dev/null | head -10

echo ""
echo -e "${BLUE}📋 Searching for hardcoded font-size values...${NC}"
find "$ROOT_DIR" -name "*.css" -not -path "*/node_modules/*" -exec grep -Hn "font-size: [0-9]" {} \; 2>/dev/null | head -10

echo ""
echo -e "${BLUE}📋 Searching for hardcoded color values...${NC}"
find "$ROOT_DIR" -name "*.css" -not -path "*/node_modules/*" -exec grep -Hn "#[0-9a-fA-F]\{3,6\}" {} \; 2>/dev/null | head -10

echo ""
echo -e "${GREEN}📊 Counting semantic tokens...${NC}"
SEMANTIC_COUNT=$(find "$ROOT_DIR" -name "*.css" -not -path "*/node_modules/*" -exec grep -h "var(--" {} \; 2>/dev/null | wc -l)
echo "Total semantic tokens found: $SEMANTIC_COUNT"

echo ""
echo "======================================"
