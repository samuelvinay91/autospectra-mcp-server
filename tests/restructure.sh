#!/bin/bash
# Script to restructure the repository according to the plan

echo "Starting repository restructuring..."

# Move test files to tests directory
echo "Moving test files..."
mv test-accessibility.js tests/integration/
mv test-api-key.js tests/integration/
mv test-autospectra.js tests/integration/
mv test-browser-navigation.js tests/integration/
mv test-claude-integration.js tests/integration/
mv test-computer-use.js tests/integration/
mv test-run-test.js tests/integration/
mv test-visible-browser.js tests/e2e/
mv visible-browser-test.js tests/e2e/

# Move script files to scripts directory
echo "Moving script files..."
mv test-computer-use.sh scripts/testing/
mv launch-visible-browser.js scripts/testing/
mv standalone-http-server.js scripts/deployment/
mv run-server.bat scripts/deployment/

# Create output subdirectories
echo "Creating output subdirectories..."
mkdir -p output/screenshots output/reports

# Move server files to src/server
echo "Moving server files..."
cp src/server.ts src/server/index.ts
# We'll keep the original for now until imports are updated

# Organize documentation
echo "Organizing documentation..."
mkdir -p docs/guides/browser docs/guides/computer-use docs/api/tools

# Browser guides
mv docs/DESKTOP_VS_API_BROWSER.md docs/guides/browser/
mv docs/VISIBLE_BROWSER_INTEGRATION.md docs/guides/browser/
mv docs/CLINE_BROWSER_INTEGRATION.md docs/guides/browser/
mv docs/CURRENT_BROWSER_SETUP.md docs/guides/browser/

# Computer use guides
mv docs/COMPUTER_USE.md docs/guides/computer-use/
mv docs/COMPUTER_USE_INTEGRATION.md docs/guides/computer-use/

# API documentation
mv docs/QUICK_REFERENCE.md docs/api/
mv docs/USAGE_GUIDE.md docs/api/tools/

# Other docs
mv docs/CLOUD_DEPLOYMENT.md docs/guides/deployment/
mv docs/smithery-integration.md docs/guides/deployment/

# Reorganize root MD files
mv TESTING_GUIDE.md docs/guides/
mv integration-test-results.md docs/guides/computer-use/
mv api-key-test-report.md docs/guides/computer-use/
mv FINDINGS_SUMMARY.md docs/guides/computer-use/

# Update imports (this is just a placeholder - would need more complex scripting for this)
echo "NOTE: You'll need to update imports manually where files have been moved."
echo "Restructuring complete! Please check and resolve any import issues."
