#!/usr/bin/env python3
"""
Fix React Hook dependency warnings by adding missing setState dependencies.
This is safe because setState functions from useState are stable and don't change.
"""
import re
import sys
from pathlib import Path

def fix_file(file_path: Path) -> int:
    """Fix hook dependencies in a single file. Returns number of fixes made."""
    content = file_path.read_text()
    original_content = content
    fixes = 0
    
    # Pattern to find useCallback with missing setState dependency
    # Matches: useCallback(..., [deps]) where there's a setState call inside
    patterns = [
        # setSelectedXxx dependencies
        (r'(useCallback\([^}]*\bsetSelected(\w+)\([^}]*\},\s*\[)([^\]]*)\]', 
         lambda m: f"{m.group(1)}{m.group(3)}{', ' if m.group(3).strip() else ''}setSelected{m.group(2)}]"),
        
        # setFormErrors dependencies  
        (r'(useCallback\([^}]*\bsetFormErrors\([^}]*\},\s*\[)([^\]]*)\]',
         lambda m: f"{m.group(1)}{m.group(2)}{', ' if m.group(2).strip() else ''}setFormErrors]"),
        
        # setFilters dependencies
        (r'(useCallback\([^}]*\bsetFilters\([^}]*\},\s*\[)([^\]]*)\]',
         lambda m: f"{m.group(1)}{m.group(2)}{', ' if m.group(2).strip() else ''}setFilters]"),
    ]
    
    for pattern, replacement in patterns:
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            fixes += 1
            content = new_content
    
    if content != original_content:
        file_path.write_text(content)
        print(f"✅ Fixed {fixes} issues in {file_path}")
        return fixes
    
    return 0

def main():
    web_dir = Path("/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app")
    
    total_fixes = 0
    for tsx_file in web_dir.rglob("*.tsx"):
        total_fixes += fix_file(tsx_file)
    
    print(f"\n🎉 Total fixes applied: {total_fixes}")

if __name__ == "__main__":
    main()
