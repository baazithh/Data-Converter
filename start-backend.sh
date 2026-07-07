#!/usr/bin/env bash
# Start the FastAPI backend using system Python (all deps pre-installed)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

echo "Starting FastAPI on http://localhost:8000"
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
