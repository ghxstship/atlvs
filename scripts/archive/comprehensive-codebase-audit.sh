#!/bin/bash

# GHXSTSHIP Comprehensive Codebase Audit Script
# Complete file-by-file analysis for hardcoded values and semantic token adoption

echo "🔍 GHXSTSHIP COMPREHENSIVE CODEBASE AUDIT"
echo "=========================================="
echo ""

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Define the root directory
ROOT_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"

# Audit counters
TOTAL_FILES=0
AUDITED_FILES=0
FILES_WITH_HARDCODED=0
TOTAL_HARDCODED_VALUES=0
TOTAL_SEMANTIC_TOKENS=0

# Arrays to store findings
declare -a HARDCODED_FILES=()
declare -a CLEAN_FILES=()
declare -a ERROR_FILES=()

echo -e "${BLUE}📊 PHASE 1: COMPLETE FILE INVENTORY${NC}"
echo "=================================="
echo ""

# Function to audit a single file
audit_file() {
    local file="$1"
    local relative_path="${file#$ROOT_DIR/}"
    
    TOTAL_FILES=$((TOTAL_FILES + 1))
    
    # Skip binary files and certain extensions
    if [[ "$file" =~ \.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|otf|eot|pdf|zip|tar|gz|node_modules)$ ]]; then
        echo -e "  ${CYAN}⏭️${NC}  $relative_path (binary/excluded)"
        return
    fi
    
    # Skip node_modules and .git directories
    if [[ "$file" =~ (node_modules|\.git|\.next|dist|build)/ ]]; then
        echo -e "  ${CYAN}⏭️${NC}  $relative_path (excluded directory)"
        return
    fi
    
    AUDITED_FILES=$((AUDITED_FILES + 1))
    
    # Check if file exists and is readable
    if [[ ! -f "$file" || ! -r "$file" ]]; then
        ERROR_FILES+=("$relative_path")
        echo -e "  ${RED}❌${NC} $relative_path (not readable)"
        return
    fi
    
    # Count hardcoded values in this file
    local hardcoded_count=0
    local semantic_count=0
    local issues=()
    
    # Check for hardcoded spacing values
    local hardcoded_padding=$(grep -c "padding: [0-9]" "$file" 2>/dev/null || echo "0")
    local hardcoded_margin=$(grep -c "margin: [0-9]" "$file" 2>/dev/null || echo "0")
    local hardcoded_width=$(grep -c "width: [0-9]" "$file" 2>/dev/null || echo "0")
    local hardcoded_height=$(grep -c "height: [0-9]" "$file" 2>/dev/null || echo "0")
    local hardcoded_font_size=$(grep -c "font-size: [0-9]" "$file" 2>/dev/null || echo "0")
    local hardcoded_border_radius=$(grep -c "border-radius: [0-9]" "$file" 2>/dev/null || echo "0")
    local hardcoded_colors=$(grep -c "#[0-9a-fA-F]\{3,6\}" "$file" 2>/dev/null || echo "0")
    
    # Count semantic tokens
    semantic_count=$(grep -c "var(--" "$file" 2>/dev/null || echo "0")
    
    # Calculate total hardcoded values for this file
    hardcoded_count=$((hardcoded_padding + hardcoded_margin + hardcoded_width + hardcoded_height + hardcoded_font_size + hardcoded_border_radius + hardcoded_colors))
    
    # Add to global counters
    TOTAL_HARDCODED_VALUES=$((TOTAL_HARDCODED_VALUES + hardcoded_count))
    TOTAL_SEMANTIC_TOKENS=$((TOTAL_SEMANTIC_TOKENS + semantic_count))
    
    # Build issues array
    [[ $hardcoded_padding -gt 0 ]] && issues+=("${hardcoded_padding} hardcoded padding")
    [[ $hardcoded_margin -gt 0 ]] && issues+=("${hardcoded_margin} hardcoded margin")
    [[ $hardcoded_width -gt 0 ]] && issues+=("${hardcoded_width} hardcoded width")
    [[ $hardcoded_height -gt 0 ]] && issues+=("${hardcoded_height} hardcoded height")
    [[ $hardcoded_font_size -gt 0 ]] && issues+=("${hardcoded_font_size} hardcoded font-size")
    [[ $hardcoded_border_radius -gt 0 ]] && issues+=("${hardcoded_border_radius} hardcoded border-radius")
    [[ $hardcoded_colors -gt 0 ]] && issues+=("${hardcoded_colors} hardcoded colors")
    
    # Determine file status
    if [[ $hardcoded_count -gt 0 ]]; then
        FILES_WITH_HARDCODED=$((FILES_WITH_HARDCODED + 1))
        HARDCODED_FILES+=("$relative_path")
        local issues_str=$(IFS=', '; echo "${issues[*]}")
        echo -e "  ${RED}⚠️${NC}  $relative_path (${hardcoded_count} hardcoded, ${semantic_count} semantic) - ${issues_str}"
    else
        CLEAN_FILES+=("$relative_path")
        if [[ $semantic_count -gt 0 ]]; then
            echo -e "  ${GREEN}✅${NC} $relative_path (${semantic_count} semantic tokens, 0 hardcoded)"
        else
            echo -e "  ${YELLOW}📄${NC} $relative_path (no styling)"
        fi
    fi
}

# Find all files in the codebase
echo "Scanning all files in codebase..."
echo ""

# Use find to get all files, excluding certain directories
while IFS= read -r -d '' file; do
    audit_file "$file"
done < <(find "$ROOT_DIR" -type f \( ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" ! -path "*/dist/*" ! -path "*/build/*" \) -print0)

echo ""
echo "=================================="
echo -e "${BLUE}📊 PHASE 2: DETAILED HARDCODED VALUE ANALYSIS${NC}"
echo "============================================="
echo ""

if [[ ${#HARDCODED_FILES[@]} -gt 0 ]]; then
    echo -e "${RED}🚨 FILES WITH HARDCODED VALUES (${#HARDCODED_FILES[@]} files):${NC}"
    echo ""
    
    for file in "${HARDCODED_FILES[@]}"; do
        echo -e "${RED}📄 $file${NC}"
        
        # Show specific hardcoded values found
        local full_path="$ROOT_DIR/$file"
        
        # Padding issues
        local padding_lines=$(grep -n "padding: [0-9]" "$full_path" 2>/dev/null || true)
        if [[ -n "$padding_lines" ]]; then
            echo -e "   ${YELLOW}• Hardcoded padding:${NC}"
            echo "$padding_lines" | while read -r line; do
                echo -e "     ${CYAN}Line ${line%%:*}:${NC} ${line#*:}"
            done
        fi
        
        # Margin issues
        local margin_lines=$(grep -n "margin: [0-9]" "$full_path" 2>/dev/null || true)
        if [[ -n "$margin_lines" ]]; then
            echo -e "   ${YELLOW}• Hardcoded margin:${NC}"
            echo "$margin_lines" | while read -r line; do
                echo -e "     ${CYAN}Line ${line%%:*}:${NC} ${line#*:}"
            done
        fi
        
        # Color issues
        local color_lines=$(grep -n "#[0-9a-fA-F]\{3,6\}" "$full_path" 2>/dev/null || true)
        if [[ -n "$color_lines" ]]; then
            echo -e "   ${YELLOW}• Hardcoded colors:${NC}"
            echo "$color_lines" | head -5 | while read -r line; do
                echo -e "     ${CYAN}Line ${line%%:*}:${NC} ${line#*:}"
            done
            local color_count=$(echo "$color_lines" | wc -l)
            if [[ $color_count -gt 5 ]]; then
                echo -e "     ${YELLOW}... and $((color_count - 5)) more${NC}"
            fi
        fi
        
        echo ""
    done
else
    echo -e "${GREEN}🎉 NO FILES WITH HARDCODED VALUES FOUND!${NC}"
    echo ""
fi

echo "============================================="
echo -e "${BLUE}📊 PHASE 3: COMPREHENSIVE STATISTICS${NC}"
echo "============================================="
echo ""

# Calculate percentages
local clean_percentage=0
local hardcoded_percentage=0
if [[ $AUDITED_FILES -gt 0 ]]; then
    clean_percentage=$(( (AUDITED_FILES - FILES_WITH_HARDCODED) * 100 / AUDITED_FILES ))
    hardcoded_percentage=$(( FILES_WITH_HARDCODED * 100 / AUDITED_FILES ))
fi

echo -e "${BLUE}📈 FILE STATISTICS:${NC}"
echo -e "   Total files found: ${CYAN}$TOTAL_FILES${NC}"
echo -e "   Files audited: ${CYAN}$AUDITED_FILES${NC}"
echo -e "   Clean files: ${GREEN}$((AUDITED_FILES - FILES_WITH_HARDCODED))${NC} (${clean_percentage}%)"
echo -e "   Files with hardcoded values: ${RED}$FILES_WITH_HARDCODED${NC} (${hardcoded_percentage}%)"
echo -e "   Error/unreadable files: ${YELLOW}${#ERROR_FILES[@]}${NC}"
echo ""

echo -e "${BLUE}📊 TOKEN ADOPTION STATISTICS:${NC}"
echo -e "   Total semantic tokens: ${GREEN}$TOTAL_SEMANTIC_TOKENS${NC}"
echo -e "   Total hardcoded values: ${RED}$TOTAL_HARDCODED_VALUES${NC}"

if [[ $((TOTAL_SEMANTIC_TOKENS + TOTAL_HARDCODED_VALUES)) -gt 0 ]]; then
    local semantic_percentage=$(( TOTAL_SEMANTIC_TOKENS * 100 / (TOTAL_SEMANTIC_TOKENS + TOTAL_HARDCODED_VALUES) ))
    echo -e "   Semantic token adoption: ${GREEN}${semantic_percentage}%${NC}"
else
    echo -e "   Semantic token adoption: ${GREEN}100%${NC} (no styling values found)"
fi

echo ""

# File type breakdown
echo -e "${BLUE}📋 FILE TYPE BREAKDOWN:${NC}"
declare -A file_types
for file in "${CLEAN_FILES[@]}" "${HARDCODED_FILES[@]}"; do
    local ext="${file##*.}"
    [[ "$ext" == "$file" ]] && ext="(no extension)"
    file_types["$ext"]=$((${file_types["$ext"]} + 1))
done

for ext in $(printf '%s\n' "${!file_types[@]}" | sort); do
    echo -e "   .${ext}: ${CYAN}${file_types[$ext]}${NC} files"
done

echo ""
echo "============================================="
echo -e "${BLUE}📊 FINAL AUDIT RESULT${NC}"
echo "============================================="
echo ""

# Determine overall result
if [[ $FILES_WITH_HARDCODED -eq 0 ]]; then
    echo -e "${GREEN}🎉 AUDIT RESULT: PERFECT${NC}"
    echo -e "${GREEN}✅ 100% semantic token adoption achieved!${NC}"
    echo -e "${GREEN}✅ Zero hardcoded values found across entire codebase${NC}"
    echo -e "${GREEN}✅ Enterprise-ready design system implementation${NC}"
    echo ""
    echo -e "${GREEN}🚀 CODEBASE STATUS: PRODUCTION READY${NC}"
elif [[ $FILES_WITH_HARDCODED -le 5 && $TOTAL_HARDCODED_VALUES -le 20 ]]; then
    echo -e "${YELLOW}⚠️  AUDIT RESULT: EXCELLENT (Minor Issues)${NC}"
    echo -e "${YELLOW}✅ High semantic token adoption (${semantic_percentage}%)${NC}"
    echo -e "${YELLOW}⚠️  ${TOTAL_HARDCODED_VALUES} hardcoded values in ${FILES_WITH_HARDCODED} files${NC}"
    echo -e "${YELLOW}🔧 Minor cleanup required for 100% compliance${NC}"
    echo ""
    echo -e "${YELLOW}🎯 CODEBASE STATUS: NEARLY PERFECT${NC}"
elif [[ $hardcoded_percentage -le 10 ]]; then
    echo -e "${YELLOW}⚠️  AUDIT RESULT: GOOD${NC}"
    echo -e "${YELLOW}✅ Good semantic token adoption (${semantic_percentage}%)${NC}"
    echo -e "${YELLOW}⚠️  ${TOTAL_HARDCODED_VALUES} hardcoded values need attention${NC}"
    echo -e "${YELLOW}🔧 Moderate cleanup required${NC}"
    echo ""
    echo -e "${YELLOW}🔄 CODEBASE STATUS: NEEDS MINOR IMPROVEMENTS${NC}"
else
    echo -e "${RED}❌ AUDIT RESULT: NEEDS IMPROVEMENT${NC}"
    echo -e "${RED}⚠️  Significant hardcoded values found${NC}"
    echo -e "${RED}🚨 ${TOTAL_HARDCODED_VALUES} hardcoded values in ${FILES_WITH_HARDCODED} files${NC}"
    echo -e "${RED}🔧 Major cleanup required for semantic token adoption${NC}"
    echo ""
    echo -e "${RED}🚨 CODEBASE STATUS: REQUIRES IMMEDIATE ATTENTION${NC}"
fi

echo ""
echo "============================================="
echo -e "${BLUE}📖 RECOMMENDATIONS${NC}"
echo "============================================="
echo ""

if [[ $FILES_WITH_HARDCODED -gt 0 ]]; then
    echo -e "${BLUE}🔧 IMMEDIATE ACTIONS REQUIRED:${NC}"
    echo ""
    echo "1. Replace hardcoded padding/margin with semantic spacing tokens:"
    echo -e "   ${YELLOW}padding: 16px${NC} → ${GREEN}padding: var(--spacing-lg)${NC}"
    echo ""
    echo "2. Replace hardcoded colors with semantic color tokens:"
    echo -e "   ${YELLOW}color: #000000${NC} → ${GREEN}color: hsl(var(--color-foreground))${NC}"
    echo ""
    echo "3. Replace hardcoded font sizes with fluid typography:"
    echo -e "   ${YELLOW}font-size: 18px${NC} → ${GREEN}font-size: var(--font-size-lg)${NC}"
    echo ""
    echo "4. Use semantic border radius tokens:"
    echo -e "   ${YELLOW}border-radius: 8px${NC} → ${GREEN}border-radius: var(--radius-md)${NC}"
    echo ""
else
    echo -e "${GREEN}🎉 CONGRATULATIONS!${NC}"
    echo ""
    echo -e "${GREEN}✅ Your codebase has achieved 100% semantic token adoption${NC}"
    echo -e "${GREEN}✅ Zero hardcoded values detected${NC}"
    echo -e "${GREEN}✅ Enterprise-ready design system implementation${NC}"
    echo -e "${GREEN}✅ Future-proof and maintainable styling architecture${NC}"
    echo ""
fi

echo "============================================="
echo -e "${BLUE}For detailed token documentation, see:${NC}"
echo -e "${BLUE}📖 docs/UI_SYSTEM_2026_UPGRADE.md${NC}"
echo -e "${BLUE}📖 packages/ui/src/styles/unified-design-system.css${NC}"
echo "============================================="

# Exit with appropriate code
if [[ $FILES_WITH_HARDCODED -eq 0 ]]; then
    exit 0
elif [[ $FILES_WITH_HARDCODED -le 5 && $TOTAL_HARDCODED_VALUES -le 20 ]]; then
    exit 1
else
    exit 2
fi
