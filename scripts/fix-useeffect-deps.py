#!/usr/bin/env python3
"""
Fix useEffect hook dependencies - add missing load/fetch functions
"""
import re
from pathlib import Path

def fix_useeffect_with_functions(content: str) -> tuple[str, int]:
    """Fix useEffect hooks that call functions but don't include them in deps"""
    fixes = 0
    
    # Pattern: Find useEffect blocks
    # Match multiline useEffect with empty or incomplete dependency array
    pattern = r'useEffect\(\s*\(\s*\)\s*=>\s*\{([^}]*)\},\s*\[([^\]]*)\]\s*\)'
    
    def replacer(match):
        nonlocal fixes
        body = match.group(1)
        current_deps = match.group(2).strip()
        
        # Find all function calls in the effect body
        func_calls = re.findall(r'\b(load\w+|fetch\w+)\s*\(', body)
        
        if not func_calls:
            return match.group(0)
        
        # Parse current dependencies
        if current_deps:
            deps_list = [d.strip() for d in current_deps.split(',')]
        else:
            deps_list = []
        
        # Add missing function dependencies
        added = False
        for func in set(func_calls):
            if func not in deps_list and func not in current_deps:
                deps_list.append(func)
                added = True
        
        if not added:
            return match.group(0)
        
        # Reconstruct with new dependencies
        new_deps = ', '.join(deps_list)
        fixes += 1
        return match.group(0).replace('[' + current_deps + ']', '[' + new_deps + ']')
    
    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    return new_content, fixes

def fix_useeffect_with_state(content: str) -> tuple[str, int]:
    """Fix useEffect hooks that reference state but don't include in deps"""
    fixes = 0
    
    # Pattern for useEffect with state access
    pattern = r'useEffect\(\s*\(\s*\)\s*=>\s*\{([^}]*)\},\s*\[\s*\]\s*\)'
    
    def replacer(match):
        nonlocal fixes
        body = match.group(1)
        
        # Find state setters being referenced
        setters = re.findall(r'\b(set[A-Z]\w+)\s*\(', body)
        
        # Find regular state variables being referenced (not setters)
        state_vars = re.findall(r'\b([a-z]\w+)\s*\.', body)
        state_vars = [v for v in state_vars if v not in ['console', 'window', 'document']]
        
        deps_to_add = list(set(setters + state_vars))
        
        if not deps_to_add:
            return match.group(0)
        
        # Add dependencies
        new_deps = ', '.join(deps_to_add)
        fixes += 1
        return match.group(0).replace('[], )', '[' + new_deps + '], )')
    
    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    return new_content, fixes

def fix_unnecessary_deps(content: str) -> tuple[str, int]:
    """Remove unnecessary dependencies like setTimeout, setError from outer scope"""
    fixes = 0
    
    # Remove setTimeout from deps
    if 'setTimeout' in content:
        pattern = r'(,\s*)?setTimeout(,\s*)?'
        if re.search(r'\[\s*[^,\]]*setTimeout', content):
            content = re.sub(r',\s*setTimeout\s*\]', ']', content)
            content = re.sub(r'\[\s*setTimeout\s*,', '[', content)
            content = re.sub(r'\[\s*setTimeout\s*\]', '[]', content)
            fixes += 1
    
    # Remove setError if it's from outer scope
    if 'setError' in content and 'Outer scope values' in content:
        content = re.sub(r',\s*setError\s*\]', ']', content)
        content = re.sub(r'\[\s*setError\s*,', '[', content)
        content = re.sub(r'\[\s*setError\s*\]', '[]', content)
        if fixes == 0:
            fixes += 1
    
    return content, fixes

def fix_file(file_path: Path) -> int:
    """Fix a single file"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original = content
        total = 0
        
        content, f1 = fix_useeffect_with_functions(content)
        total += f1
        
        # Only apply state fix if no function fixes were made
        if f1 == 0:
            content, f2 = fix_useeffect_with_state(content)
            total += f2
        
        content, f3 = fix_unnecessary_deps(content)
        total += f3
        
        if content != original:
            file_path.write_text(content, encoding='utf-8')
            if total > 0:
                print(f"✅ {file_path.name}: {total} fixes")
            return total
        return 0
    except Exception as e:
        print(f"❌ {file_path}: {e}")
        return 0

def main():
    web_dir = Path("/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app")
    
    print("🔧 Fixing useEffect Dependencies")
    print("=" * 50)
    
    total = 0
    files = 0
    
    for tsx in web_dir.rglob("*.tsx"):
        fixed = fix_file(tsx)
        if fixed > 0:
            files += 1
            total += fixed
    
    print(f"\n🎉 Fixed {total} warnings in {files} files")

if __name__ == "__main__":
    main()
