# AutoSpectra MCP Repository Restructuring - Implementation Guide

This guide provides step-by-step instructions for implementing the repository restructuring plan. All necessary files have been prepared and are ready for implementation.

## Files Prepared

1. `restructure-plan.md` - Overall strategy and directory structure plan
2. `restructure.sh` - Shell script to move files to their new locations
3. `package.json.updated` - Updated package.json with new script paths
4. `Dockerfile.updated` - Improved Dockerfile with better caching
5. `README.md.updated` - Updated README reflecting new structure
6. `import-updates.md` - Guide for updating import paths after restructuring

## Directory Structure Created

The following new directory structure has been created:

```
autospectra-mcp-server/
├── tests/               # Test files
│   ├── integration/     # Integration tests
│   ├── unit/            # Unit tests
│   ├── e2e/             # End-to-end tests
│   └── fixtures/        # Test fixtures
├── scripts/             # Utility scripts
│   ├── testing/         # Test-specific scripts
│   └── deployment/      # Deployment scripts
├── docs/                # Documentation reorganized
│   ├── guides/          # User and developer guides
│   │   ├── browser/     # Browser automation guides
│   │   ├── computer-use/# Computer use guides
│   │   └── deployment/  # Deployment guides
│   ├── api/             # API documentation
│   │   └── tools/       # Tool documentation
│   └── examples/        # Example usage
├── src/                 # Source code (with server/ subdirectory added)
│   └── server/          # Server-specific code
└── output/              # Restructured output directories
    ├── screenshots/     # Screenshot output
    └── reports/         # Test reports
```

## Implementation Instructions

### Step 1: Backup the Repository (Optional)

```bash
# Create a backup branch
git checkout -b backup-before-restructure
git add .
git commit -m "Backup before repository restructuring"
git checkout main
```

### Step 2: Execute the Restructuring Script

```bash
# Make the script executable
chmod +x restructure.sh

# Run the script
./restructure.sh
```

### Step 3: Update Configuration Files

```bash
# Update package.json
mv package.json.updated package.json

# Update Dockerfile
mv Dockerfile.updated Dockerfile

# Update README
mv README.md.updated README.md
```

### Step 4: Update Import Paths

Follow the guidelines in `import-updates.md` to update import paths in files that have been moved. This will involve:

1. Updating relative paths in test files to point to the correct source files
2. Updating any scripts that refer to moved files
3. Checking for any other path references that need to be updated

### Step 5: Update TypeScript Configuration (Optional)

Add path aliases to `tsconfig.json` to simplify imports:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@tests/*": ["tests/*"],
      "@scripts/*": ["scripts/*"]
    }
  }
}
```

### Step 6: Test the Changes

```bash
# Build the project with the new structure
npm run build

# Run tests to verify everything still works
npm run test:all
```

### Step 7: Commit the Changes

```bash
git add .
git commit -m "Restructured repository for better organization"
```

## Potential Issues and Solutions

### Import Path Issues

If you encounter import path errors, refer to `import-updates.md` for guidance on updating specific types of imports.

### Script Execution Paths

Make sure any scripts that rely on relative paths are updated to account for their new location.

### CI/CD Pipeline

Check `.github/workflows/` files to ensure CI/CD pipelines are updated to reference the new file paths.

## Next Steps

After restructuring:

1. Update documentation to reflect the new structure
2. Consider adding better code organization within each directory
3. Implement improved testing patterns within the new structure
4. Consider adding path aliases for easier imports
5. Update contributing guidelines to explain the new structure

## Conclusion

This restructuring will significantly improve the organization, maintainability, and discoverability of the AutoSpectra MCP repository. Although it requires initial effort to implement, the long-term benefits for development and maintenance will be substantial.
