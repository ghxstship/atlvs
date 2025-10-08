#!/bin/bash

# Fix unescaped entities in JSX files

echo "Fixing unescaped entities in JSX files..."

# Fix apostrophes in text content
find app -type f \( -name "*.tsx" -o -name "*.jsx" \) -exec sed -i '' \
  -e "s/\([^{]\)don't\([^}]\)/\1don\&apos;t\2/g" \
  -e "s/\([^{]\)doesn't\([^}]\)/\1doesn\&apos;t\2/g" \
  -e "s/\([^{]\)won't\([^}]\)/\1won\&apos;t\2/g" \
  -e "s/\([^{]\)can't\([^}]\)/\1can\&apos;t\2/g" \
  -e "s/\([^{]\)it's\([^}]\)/\1it\&apos;s\2/g" \
  -e "s/\([^{]\)that's\([^}]\)/\1that\&apos;s\2/g" \
  -e "s/\([^{]\)you're\([^}]\)/\1you\&apos;re\2/g" \
  -e "s/\([^{]\)we're\([^}]\)/\1we\&apos;re\2/g" \
  -e "s/\([^{]\)they're\([^}]\)/\1they\&apos;re\2/g" \
  -e "s/\([^{]\)I'm\([^}]\)/\1I\&apos;m\2/g" \
  -e "s/\([^{]\)you'll\([^}]\)/\1you\&apos;ll\2/g" \
  -e "s/\([^{]\)we'll\([^}]\)/\1we\&apos;ll\2/g" \
  {} \;

echo "Fixed unescaped entities!"
