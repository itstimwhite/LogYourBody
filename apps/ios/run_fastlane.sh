#!/bin/bash

# Run Fastlane commands without bundle exec if not available
# This script provides a fallback for running Fastlane

set -e

# Change to iOS directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Check if bundler is available
if command -v bundle &> /dev/null; then
    echo "Running with bundler..."
    bundle exec fastlane "$@"
elif command -v fastlane &> /dev/null; then
    echo "Running with system fastlane..."
    fastlane "$@"
else
    echo "Error: Fastlane not found. Please install it using:"
    echo "  gem install fastlane"
    echo "or"
    echo "  bundle install"
    exit 1
fi