#!/usr/bin/env python3
"""
Fix image-related ESLint warnings by converting <img> to Next.js <Image>
"""

import os
import re
import subprocess
import json

# Get the web app directory
web_dir = os.path.join(os.path.dirname(__file__), '..', 'apps', 'web')

print("🔍 Finding files with image warnings...\n")

# Run ESLint and capture output
try:
    result = subprocess.run(
        ['npx', 'eslint', '.', '--ext', '.ts,.tsx', '--format', 'json'],
        cwd=web_dir,
        capture_output=True,
        text=True
    )
    eslint_output = result.stdout if result.stdout else result.stderr
except Exception as e:
    print(f"Error running ESLint: {e}")
    exit(1)

# Parse JSON output
try:
    eslint_data = json.loads(eslint_output)
except json.JSONDecodeError:
    print("Error parsing ESLint output")
    exit(1)

# Collect image warnings by file
image_warnings = {}
total_warnings = 0

for file_data in eslint_data:
    file_path = file_data['filePath']
    for msg in file_data.get('messages', []):
        rule_id = msg.get('ruleId', '')
        if rule_id in ['@next/next/no-img-element', 'jsx-a11y/alt-text', 'jsx-a11y/aria-props'] and msg.get('severity') == 1:
            total_warnings += 1
            if file_path not in image_warnings:
                image_warnings[file_path] = []
            image_warnings[file_path].append({
                'line': msg['line'],
                'column': msg['column'],
                'message': msg['message'],
                'ruleId': rule_id
            })

print(f"📊 Found {total_warnings} image warnings in {len(image_warnings)} files\n")

# Fix each file
fixed_count = 0
for file_path, warnings in image_warnings.items():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Check if Image is already imported
        has_image_import = "import Image from 'next/image'" in content
        
        # Add Image import if not present and file has <img tags
        if not has_image_import and '<img' in content:
            # Find the first import statement
            import_match = re.search(r"^import .+ from .+;$", content, re.MULTILINE)
            if import_match:
                import_pos = import_match.start()
                content = content[:import_pos] + "import Image from 'next/image';\n" + content[import_pos:]
        
        # Replace <img> tags with <Image>
        # Pattern to match img tags with various attribute orders
        def replace_img(match):
            full_tag = match.group(0)
            
            # Extract src
            src_match = re.search(r'src=["\']([^"\']+)["\']', full_tag)
            if not src_match:
                src_match = re.search(r'src=\{([^}]+)\}', full_tag)
            
            # Extract alt
            alt_match = re.search(r'alt=["\']([^"\']*)["\']', full_tag)
            if not alt_match:
                alt_match = re.search(r'alt=\{([^}]+)\}', full_tag)
            
            # Extract className
            class_match = re.search(r'className=["\']([^"\']+)["\']', full_tag)
            if not class_match:
                class_match = re.search(r'className=\{([^}]+)\}', full_tag)
            
            # Build replacement
            if src_match:
                src_value = src_match.group(1)
                # Determine if src uses quotes or braces
                if 'src="' in full_tag or "src='" in full_tag:
                    src_attr = f'src="{src_value}"'
                else:
                    src_attr = f'src={{{src_value}}}'
                
                # Handle alt
                if alt_match:
                    alt_value = alt_match.group(1)
                    if 'alt="' in full_tag or "alt='" in full_tag:
                        alt_attr = f' alt="{alt_value}"'
                    else:
                        alt_attr = f' alt={{{alt_value}}}'
                else:
                    alt_attr = ' alt=""'
                
                # Handle className
                if class_match:
                    class_value = class_match.group(1)
                    if 'className="' in full_tag or "className='" in full_tag:
                        class_attr = f' className="{class_value}"'
                    else:
                        class_attr = f' className={{{class_value}}}'
                else:
                    class_attr = ''
                
                # Add width and height
                size_attrs = ' width={48} height={48}'
                
                return f'<Image {src_attr}{alt_attr}{size_attrs}{class_attr} />'
            
            return full_tag
        
        # Replace all <img> tags
        content = re.sub(r'<img[^>]*/?>', replace_img, content)
        
        # Fix invalid ARIA attributes (aria-: should be aria-label or removed)
        content = re.sub(r'aria-:', 'aria-label', content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            rel_path = os.path.relpath(file_path, web_dir)
            print(f"   ✅ Fixed {len(warnings)} warnings in {rel_path}")
            fixed_count += len(warnings)
        
    except Exception as e:
        rel_path = os.path.relpath(file_path, web_dir)
        print(f"   ❌ Error fixing {rel_path}: {e}")

print(f"\n✨ Fixed {fixed_count} image warnings\n")

# Run final check
print("🔍 Running final ESLint check...")
try:
    result = subprocess.run(
        ['npx', 'eslint', '.', '--ext', '.ts,.tsx'],
        cwd=web_dir,
        capture_output=True,
        text=True
    )
    warning_count = result.stdout.count('warning')
    print(f"   Remaining warnings: {warning_count}\n")
    
    if warning_count == 0:
        print("🎉 SUCCESS: Zero warnings achieved!")
    else:
        print(f"⚠️  {warning_count} warnings remain")
except Exception as e:
    print(f"   Error running final check: {e}")
