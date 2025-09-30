#!/usr/bin/env python3
"""
Fix Array generic type syntax errors in TypeScript files.
Handles patterns like: Array<() => Promise<unknown> = []
Should be: Array<() => Promise<unknown>> = []
"""

import os
import re
from pathlib import Path

def fix_array_generics(content):
    """Fix Array<...> = patterns to Array<...>> ="""
    
    # Pattern 1: Array<() => Promise<unknown> = [] -> Array<() => Promise<unknown>> = []
    content = re.sub(
        r'Array<\(\) => Promise<unknown>\s*=\s*\[',
        r'Array<() => Promise<unknown>> = [',
        content
    )
    
    # Pattern 2: Array<() => Promise<any> = [] -> Array<() => Promise<any>> = []
    content = re.sub(
        r'Array<\(\) => Promise<any>\s*=\s*\[',
        r'Array<() => Promise<any>> = [',
        content
    )
    
    # Pattern 3: Array<(arg: Type) => Promise<unknown> = [] -> Array<(arg: Type) => Promise<unknown>> = []
    content = re.sub(
        r'Array<\([^)]+\) => Promise<[^>]+>\s*=\s*\[',
        lambda m: m.group(0).replace(' =', '> ='),
        content
    )
    
    # Pattern 4: More general - Array<...function...> = where > is missing before =
    # This catches: Array<(anything) => ReturnType = 
    content = re.sub(
        r'(Array<[^=]+)\s*=\s*\[',
        lambda m: m.group(1).rstrip() + '> = [' if not m.group(1).endswith('>') else m.group(0),
        content
    )
    
    return content

def process_file(filepath):
    """Process a single TypeScript file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        content = fix_array_generics(content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    return False

def main():
    """Main function to process all TypeScript files."""
    web_dir = Path('apps/web')
    
    if not web_dir.exists():
        print("Error: apps/web directory not found")
        return
    
    print("🔧 Fixing Array generic type syntax errors...")
    
    fixed_count = 0
    for ext in ['*.ts', '*.tsx']:
        for filepath in web_dir.rglob(ext):
            if process_file(filepath):
                fixed_count += 1
                print(f"  ✓ Fixed: {filepath}")
    
    print(f"\n✅ Fixed {fixed_count} files!")

if __name__ == '__main__':
    main()
