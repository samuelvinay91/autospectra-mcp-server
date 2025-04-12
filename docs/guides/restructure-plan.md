# Repository Restructuring Plan

The current repository structure is somewhat cluttered with tests, scripts, and documentation files scattered across the root directory. This plan outlines a more organized structure that will improve maintainability and discoverability.

## Current Issues

1. Test files are scattered in the root directory
2. Documentation files are mixed between root and docs directory
3. Utility scripts are in the root directory
4. Output files are saved directly in an output directory

## Proposed Directory Structure

```
autospectra-mcp-server/
├── .github/             # GitHub-specific files (unchanged)
├── assets/              # Assets like logos (unchanged)
├── docs/                # All documentation consolidated here
│   ├── guides/          # User and developer guides
│   ├── api/             # API documentation
│   └── examples/        # Example usage
├── scripts/             # Utility and helper scripts
│   ├── testing/         # Test-specific scripts
│   └── deployment/      # Deployment scripts
├── src/                 # Source code (reorganized)
│   ├── automation/      # Browser automation
│   ├── computerUse/     # Claude computer use integration
│   ├── frameworks/      # Test framework integration
│   ├── nlp/             # NLP functionality
│   ├── server/          # Server-specific code (moved from root)
│   └── utils/           # Utilities
├── tests/               # All test files consolidated here
│   ├── integration/     # Integration tests
│   ├── unit/            # Unit tests
│   ├── e2e/             # End-to-end tests
│   └── fixtures/        # Test fixtures
├── .env                 # Environment variables (unchanged)
├── .env.production      # Production environment variables (unchanged)
├── package.json         # Package configuration (unchanged)
└── README.md            # Project overview (unchanged)
```

## Migration Steps

1. Create new directories structure
2. Move test files to appropriate test directories
3. Consolidate documentation in docs directory
4. Move utility scripts to scripts directory
5. Update imports and file references
6. Update CI/CD pipeline if necessary

## Benefits

1. **Improved Discoverability**: Clear organization makes it easier to find files
2. **Better Maintainability**: Related files are grouped together
3. **Cleaner Root Directory**: Essential files only in the root
4. **Separation of Concerns**: Tests, docs, scripts, and source are clearly separated
5. **Easier Onboarding**: New developers can understand the project structure faster
