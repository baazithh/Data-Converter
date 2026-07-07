#!/usr/bin/env bash
# Start the Next.js frontend dev server
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/frontend"

echo "Starting Next.js on http://localhost:3000"
npm run dev
