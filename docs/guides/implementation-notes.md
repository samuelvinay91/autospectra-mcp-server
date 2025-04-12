# Implementation Notes and Known Issues

This document tracks known issues and implementation details that need to be addressed after the repository restructuring.

## Build Issues Resolution

The TypeScript compilation errors have been resolved by:

1. **Removing the Duplicate Server Implementation**: The `src/server/index.ts` file (renamed to `src/server/index.ts.bak`) was causing conflicts with the original `src/index.ts` implementation.

2. **Keeping the Original Implementation**: We chose to keep the original implementation which uses the correct MCP SDK methods (`setRequestHandler` instead of `setToolHandler`).

## Current Structure

After the restructuring and fixes:

1. **Main Entry Point**: `src/index.ts` remains the main entry point with the MCP server implementation
2. **HTTP Server**: `src/server.ts` contains the Express HTTP server for cloud deployment
3. **Directory Structure**: The overall directory structure has been reorganized as planned:
   - Tests moved to `tests/` directory (integration, e2e)
   - Documentation organized in `docs/guides/` and `docs/api/`
   - Scripts moved to `scripts/deployment/` and `scripts/testing/`

## Path Aliases

The TypeScript configuration has been updated to support path aliases:

```json
"paths": {
  "@/*": ["src/*"],
  "@tests/*": ["tests/*"],
  "@scripts/*": ["scripts/*"]
}
```

These can be used in future development for cleaner imports.

## Future Improvements

For future releases, consider these improvements:

1. **Proper Server Separation**: Properly refactor the server implementation to separate MCP protocol handling from HTTP server functionality
2. **Function Name Alignment**: Ensure function names match between server code and implementations
3. **Test Framework Updates**: Update the frameworks module to provide missing functions or rename references
4. **Documentation Updates**: Update documentation to reflect the current implementation structure

## Visible Browser Support

The repository now includes support for visible browser mode in all browser automation tools:

1. `navigate` with `visible: true` parameter
2. `click` with `visible: true` parameter
3. `type` with `visible: true` parameter
4. `extract` with `visible: true` parameter
5. `screenshot` with `visible: true` parameter
6. `checkAccessibility` with `visible: true` parameter

This allows for easier debugging and demonstration of browser automation steps.
