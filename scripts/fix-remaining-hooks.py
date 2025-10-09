#!/usr/bin/env python3
"""
Fix remaining React Hook warnings - improved patterns
"""
import re
from pathlib import Path

def fix_callback_deps(content: str) -> tuple[str, int]:
    """Fix useCallback missing dependencies - more aggressive pattern matching"""
    fixes = 0
    lines = content.split('\n')
    result = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Look for useCallback
        if 'useCallback' in line:
            # Capture the entire useCallback block
            block_start = i
            brace_count = 0
            in_callback = False
            callback_block = []
            
            for j in range(i, min(i + 50, len(lines))):
                callback_block.append(lines[j])
                for char in lines[j]:
                    if char == '(':
                        brace_count += 1
                        in_callback = True
                    elif char == ')' and in_callback:
                        brace_count -= 1
                        if brace_count == 0:
                            # Found the end of useCallback
                            block_text = '\n'.join(callback_block)
                            
                            # Find setState calls
                            setters = re.findall(r'\b(set[A-Z]\w+)\(', block_text)
                            
                            # Find dependency array
                            deps_match = re.search(r'},\s*\[([^\]]*)\]\s*\)', block_text)
                            if deps_match and setters:
                                current_deps = deps_match.group(1).strip()
                                deps_list = [d.strip() for d in current_deps.split(',') if d.strip()]
                                
                                # Add missing setters
                                added = []
                                for setter in set(setters):
                                    if setter not in deps_list:
                                        deps_list.append(setter)
                                        added.append(setter)
                                
                                if added:
                                    new_deps = ', '.join(deps_list)
                                    new_block = block_text.replace(
                                        '}, [' + current_deps + '])',
                                        '}, [' + new_deps + '])'
                                    )
                                    result.extend(new_block.split('\n'))
                                    fixes += 1
                                    i = j + 1
                                    break
                            
                            # No fix needed, add as-is
                            result.extend(callback_block)
                            i = j + 1
                            break
                if brace_count == 0 and in_callback:
                    break
            else:
                # Couldn't find end, just add the line
                result.append(line)
                i += 1
        else:
            result.append(line)
            i += 1
    
    return '\n'.join(result), fixes

def fix_effect_deps(content: str) -> tuple[str, int]:
    """Fix useEffect missing function dependencies"""
    fixes = 0
    
    # Pattern: useEffect with function calls missing from deps
    pattern = r'useEffect\(\s*\(\s*\)\s*=>\s*\{[^}]*(load\w+|fetch\w+)\(\)[^}]*\},\s*\[\s*\]\s*\)'
    
    def replacer(match):
        nonlocal fixes
        # Find all function calls
        funcs = re.findall(r'\b(load\w+|fetch\w+)\(', match.group(0))
        if funcs:
            func_name = funcs[0]
            result = match.group(0).replace('], )', ', ' + func_name + '], )')
            fixes += 1
            return result
        return match.group(0)
    
    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    return new_content, fixes

def fix_file(file_path: Path) -> int:
    """Fix a single file"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original = content
        total = 0
        
        content, f1 = fix_callback_deps(content)
        total += f1
        
        content, f2 = fix_effect_deps(content)
        total += f2
        
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
    
    print("🔧 Fixing Remaining React Hook Warnings")
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
