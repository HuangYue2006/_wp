#!/usr/bin/env bash
set -e

if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is required but not installed."
    exit 1
fi

python3 -c "import fastapi" 2>/dev/null || {
    echo "Installing dependencies..."
    pip install -r "$(dirname "$0")/requirements.txt"
}

cd "$(dirname "$0")/backend"
echo "Starting TypeRush at http://localhost:8000"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
