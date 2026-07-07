#!/usr/bin/env bash
# Start the FastAPI backend using the project virtual environment
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

if [ ! -d ".venv" ]; then
  echo "Virtual environment not found. Creating one..."
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt -q
else
  source .venv/bin/activate
fi

echo "Starting FastAPI on http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
