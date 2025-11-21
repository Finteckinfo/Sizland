#!/bin/bash

# Security check script
set -e

echo "🔍 Running security checks..."

# 1. Check for .env files in git
echo "Checking for .env files in git..."
if git ls-files | grep -E "^\.env$"; then
  echo "❌ Error: .env file is tracked in git!"
  exit 1
fi

# 2. Check for hardcoded secrets in code
echo "Checking for hardcoded secrets..."
if git grep -iE "(api[_-]?key|secret|password|token|private[_-]?key).*=.*['\"][a-zA-Z0-9]{20,}" -- '*.ts' '*.tsx' '*.js' '*.jsx' ':!node_modules'; then
  echo "⚠️  Warning: Possible hardcoded secrets detected!"
  exit 1
fi

# 3. Check dependencies for vulnerabilities
echo "Checking dependencies for vulnerabilities..."
npm audit --audit-level=high

# 4. Run TypeScript type checking
echo "Running TypeScript type checking..."
npx tsc --noEmit

# 5. Run ESLint with security rules
echo "Running ESLint with security rules..."
npx eslint . --ext .ts,.tsx --max-warnings=0

echo "✅ All security checks passed!"
