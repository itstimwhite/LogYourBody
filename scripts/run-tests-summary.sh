#!/bin/bash

echo "Running all tests for new features..."
echo "======================================="

# Run date utilities tests (these should pass)
echo -e "\n1. Running Date Utilities tests..."
npm test -- src/utils/__tests__/date-utils.test.ts --silent --passWithNoTests 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Date Utilities tests passed"
else
    echo "❌ Date Utilities tests failed"
fi

# Run component tests (jsdom environment)
echo -e "\n2. Running Weight Logging UI tests..."
npm test -- src/app/log/__tests__/weight-logging.test.tsx --silent --passWithNoTests 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Weight Logging UI tests passed"
else
    echo "❌ Weight Logging UI tests failed"
fi

echo -e "\n3. Running ProfileSetupStepV2 tests..."
npm test -- src/app/onboarding/components/__tests__/ProfileSetupStepV2.test.tsx --silent --passWithNoTests 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ ProfileSetupStepV2 tests passed"
else
    echo "❌ ProfileSetupStepV2 tests failed"
fi

echo -e "\n4. Running MultiScanConfirmationStep tests..."
npm test -- src/app/onboarding/components/__tests__/MultiScanConfirmationStep.test.tsx --silent --passWithNoTests 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ MultiScanConfirmationStep tests passed"
else
    echo "❌ MultiScanConfirmationStep tests failed"
fi

# Run API tests (node environment)
echo -e "\n5. Running PDF Parsing API tests..."
npx jest --config jest.config.node.js src/app/api/parse-pdf/__tests__/parse-pdf.node.test.ts --silent --passWithNoTests 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ PDF Parsing API tests passed"
else
    echo "❌ PDF Parsing API tests failed"
fi

echo -e "\n======================================="
echo "Test summary complete!"
echo ""
echo "To see detailed test output, run:"
echo "./scripts/run-all-tests.sh"