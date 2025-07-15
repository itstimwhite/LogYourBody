#!/bin/bash
# SwiftLint Build Phase Script
# This script runs SwiftLint during Xcode builds

# Check if SwiftLint is installed
if which swiftlint >/dev/null; then
    # Run SwiftLint
    echo "Running SwiftLint..."
    
    # In CI environments, fail the build on any violation
    if [ "${CI}" = "true" ] || [ "${GITHUB_ACTIONS}" = "true" ]; then
        swiftlint lint --strict --config "${SRCROOT}/.swiftlint.yml"
    else
        # In local development, just warn
        swiftlint lint --config "${SRCROOT}/.swiftlint.yml"
    fi
else
    echo "warning: SwiftLint not installed, download from https://github.com/realm/SwiftLint"
    
    # In CI, fail if SwiftLint is not installed
    if [ "${CI}" = "true" ] || [ "${GITHUB_ACTIONS}" = "true" ]; then
        echo "error: SwiftLint is required in CI environments"
        exit 1
    fi
fi