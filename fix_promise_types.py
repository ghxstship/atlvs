#!/usr/bin/env python3
"""
Fix Promise generic type syntax errors in TypeScript files.
Handles patterns like: Promise<PaginatedResponse<Dashboard> {
Should be: Promise<PaginatedResponse<Dashboard>> {
"""

import os
import re
from pathlib import Path

def fix_promise_generics(content):
    """Fix Promise<Type<T> { patterns to Promise<Type<T>> {"""
    
    # Pattern 1: Promise<PaginatedResponse<T> { -> Promise<PaginatedResponse<T>> {
    content = re.sub(
        r'Promise<PaginatedResponse<([^>]+)>\s*\{',
        r'Promise<PaginatedResponse<\1>> {',
        content
    )
    
    # Pattern 2: Promise<PostgrestResponse<T> { -> Promise<PostgrestResponse<T>> {
    content = re.sub(
        r'Promise<PostgrestResponse<([^>]+)>\s*\{',
        r'Promise<PostgrestResponse<\1>> {',
        content
    )
    
    # Pattern 3: Promise<Result<T> { -> Promise<Result<T>> {
    content = re.sub(
        r'Promise<Result<([^>]+)>\s*\{',
        r'Promise<Result<\1>> {',
        content
    )
    
    # Pattern 4: Promise<Response<T> { -> Promise<Response<T>> {
    content = re.sub(
        r'Promise<Response<([^>]+)>\s*\{',
        r'Promise<Response<\1>> {',
        content
    )
    
    # Pattern 5: Promise<ApiResponse<T> { -> Promise<ApiResponse<T>> {
    content = re.sub(
        r'Promise<ApiResponse<([^>]+)>\s*\{',
        r'Promise<ApiResponse<\1>> {',
        content
    )
    
    return content

def process_file(filepath):
    """Process a single TypeScript file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        content = fix_promise_generics(content)
        
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
    
    print("🔧 Fixing Promise generic type syntax errors...")
    
    fixed_count = 0
    for ext in ['*.ts', '*.tsx']:
        for filepath in web_dir.rglob(ext):
            if process_file(filepath):
                fixed_count += 1
                print(f"  ✓ Fixed: {filepath}")
    
    print(f"\n✅ Fixed {fixed_count} files!")

if __name__ == '__main__':
    main()
