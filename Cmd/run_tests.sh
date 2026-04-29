#!/bin/bash

# Script to run all tests for AI Scientist project
set -e  # Exit on any error

cd "$(dirname "$0")/.."

echo "Running AI Scientist tests..."

# Run all tests with coverage
python3 -m pytest tests/ -v --cov=Code/Backend/app --cov-report=term-missing

echo "Tests completed!"