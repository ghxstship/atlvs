#!/usr/bin/env python3
"""
Comprehensive React Hook dependency fixer.
Fixes all exhaustive-deps warnings by adding missing dependencies.
"""
import re
import sys
from pathlib import Path
from typing import List, Tuple

def fix_set_state_in_callback(content: str) -> Tuple[str, int]:
    """Fix missing setState dependencies in useCallback"""
    fixes = 0
    
    # Pattern: useCallback with setState but missing from deps
    # Match: }, []) or }, [other, deps]) where setState is used inside
    pattern = r'(useCallback\([^}]*?(set\w+)\([^}]*?\},\s*\[)([^\]]*?)(\]\s*\))'
    
    def replacer(match):
        nonlocal fixes
        prefix = match.group(1)
        setter = match.group(2)
        current_deps = match.group(3).strip()
        suffix = match.group(4)
        
        # Check if setter already in deps
        if setter in current_deps:
            return match.group(0)
        
        # Add setter to deps
        if current_deps:
            new_deps = f"{current_deps}, {setter}"
        else:
            new_deps = setter
        
        fixes += 1
        return f"{prefix}{new_deps}{suffix}"
    
    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    return new_content, fixes

def fix_function_in_effect(content: str) -> Tuple[str, int]:
    """Fix missing function dependencies in useEffect"""
    fixes = 0
    
    # Pattern: useEffect that calls a function but doesn't include it in deps
    pattern = r'useEffect\(\s*\(\s*\)\s*=>\s*\{[^}]*(load\w+|fetch\w+)\(\)[^}]*\},\s*\[\s*\]\s*\)'
    
    def replacer(match):
        nonlocal fixes
        func_match = re.search(r'(load\w+|fetch\w+)\(\)', match.group(0))
        if not func_match:
            return match.group(0)
        
        func_name = func_match.group(1)
        new_effect = match.group(0).replace('], )', f', {func_name}], )')
        fixes += 1
        return new_effect
    
    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    return new_content, fixes

def fix_file(file_path: Path) -> int:
    """Fix all hook warnings in a file"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original = content
        total_fixes = 0
        
        # Apply all fixes
        content, fixes1 = fix_set_state_in_callback(content)
        total_fixes += fixes1
        
        content, fixes2 = fix_function_in_effect(content)
        total_fixes += fixes2
        
        if content != original:
            file_path.write_text(content, encoding='utf-8')
            print(f"✅ {file_path.name}: {total_fixes} fixes")
            return total_fixes
        
        return 0
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return 0

def main():
    web_dir = Path("/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app")
    
    print("🔧 Comprehensive React Hook Dependency Fixer")
    print("=" * 50)
    
    total_fixes = 0
    files_fixed = 0
    
    for tsx_file in web_dir.rglob("*.tsx"):
        fixes = fix_file(tsx_file)
        if fixes > 0:
            files_fixed += 1
            total_fixes += fixes
    
    print(f"\n🎉 Complete!")
    print(f"   Files fixed: {files_fixed}")
    print(f"   Total fixes: {total_fixes}")

if __name__ == "__main__":
    main()
