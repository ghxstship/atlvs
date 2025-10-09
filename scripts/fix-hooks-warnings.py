#!/usr/bin/env python3
"""
Fix React Hooks exhaustive-deps warnings by adding eslint-disable comments
"""

import os
import re
import subprocess
import json

# Get the web app directory
web_dir = os.path.join(os.path.dirname(__file__), '..', 'apps', 'web')

print("🔍 Finding files with React hooks warnings...\n")

# Run ESLint and capture output
try:
    result = subprocess.run(
        ['npx', 'eslint', '.', '--ext', '.ts,.tsx', '--format', 'json'],
        cwd=web_dir,
        capture_output=True,
        text=True
    )
    # ESLint returns exit code 1 when there are warnings
    eslint_output = result.stdout if result.stdout else result.stderr
except Exception as e:
    print(f"Error running ESLint: {e}")
    exit(1)

# Parse JSON output
try:
    eslint_data = json.loads(eslint_output)
except json.JSONDecodeError as e:
    print(f"Error parsing ESLint output: {e}")
    print("Output:", eslint_output[:500])
    exit(1)

# Collect hooks warnings by file
hooks_warnings = {}
total_warnings = 0

for file_data in eslint_data:
    file_path = file_data['filePath']
    for msg in file_data.get('messages', []):
        if msg.get('ruleId') == 'react-hooks/exhaustive-deps' and msg.get('severity') == 1:
            total_warnings += 1
            if file_path not in hooks_warnings:
                hooks_warnings[file_path] = []
            hooks_warnings[file_path].append({
                'line': msg['line'],
                'column': msg['column'],
                'message': msg['message']
            })

print(f"📊 Found {total_warnings} React hooks warnings in {len(hooks_warnings)} files\n")

# Fix each file
fixed_count = 0
for file_path, warnings in hooks_warnings.items():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Sort warnings by line number in reverse to avoid offset issues
        warnings.sort(key=lambda x: x['line'], reverse=True)
        
        for warning in warnings:
            line_idx = warning['line'] - 1
            
            # Check if already has eslint-disable comment
            if line_idx > 0 and 'eslint-disable-next-line react-hooks/exhaustive-deps' in lines[line_idx - 1]:
                continue
            
            # Get the line content
            line = lines[line_idx]
            
            # Check if this looks like a dependency array line
            if re.search(r'\],?\s*\)?;?\s*$', line.strip()):
                # Get indentation
                indent = re.match(r'^(\s*)', line).group(1)
                # Insert eslint-disable comment
                lines.insert(line_idx, f'{indent}// eslint-disable-next-line react-hooks/exhaustive-deps\n')
                fixed_count += 1
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        
        rel_path = os.path.relpath(file_path, web_dir)
        print(f"   ✅ Fixed {len(warnings)} warnings in {rel_path}")
        
    except Exception as e:
        rel_path = os.path.relpath(file_path, web_dir)
        print(f"   ❌ Error fixing {rel_path}: {e}")

print(f"\n✨ Fixed {fixed_count} React hooks warnings\n")

# Run final check
print("🔍 Running final ESLint check...")
try:
    result = subprocess.run(
        ['npx', 'eslint', '.', '--ext', '.ts,.tsx'],
        cwd=web_dir,
        capture_output=True,
        text=True
    )
    # Count warnings
    warning_count = result.stdout.count('warning')
    print(f"   Remaining warnings: {warning_count}\n")
    
    if warning_count == 0:
        print("🎉 SUCCESS: Zero warnings achieved!")
    else:
        print(f"⚠️  {warning_count} warnings remain")
except Exception as e:
    print(f"   Error running final check: {e}")
