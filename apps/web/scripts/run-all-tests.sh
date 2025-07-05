#!/bin/bash

echo "Running all tests for new features..."
echo "======================================="

# Run date utilities tests (these should pass)
echo -e "\n1. Running Date Utilities tests..."
npm test -- src/utils/__tests__/date-utils.test.ts --verbose

# Run component tests (jsdom environment)
echo -e "\n2. Running Weight Logging UI tests..."
npm test -- src/app/log/__tests__/weight-logging.test.tsx --verbose

echo -e "\n3. Running ProfileSetupStepV2 tests..."
npm test -- src/app/onboarding/components/__tests__/ProfileSetupStepV2.test.tsx --verbose

echo -e "\n4. Running MultiScanConfirmationStep tests..."
npm test -- src/app/onboarding/components/__tests__/MultiScanConfirmationStep.test.tsx --verbose

# Run API tests (node environment)
echo -e "\n5. Running PDF Parsing API tests..."
npx jest --config jest.config.node.js src/app/api/parse-pdf/__tests__/parse-pdf.node.test.ts --verbose

echo -e "\n======================================="
echo "Test run complete!"