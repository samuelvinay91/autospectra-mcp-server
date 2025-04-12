# Import Path Updates Guide

After restructuring the repository, many import paths will need to be updated. This document provides a guide for the most common updates needed.

## Common Import Updates

### Source File Updates

1. **Server Imports**:
   - Old: `import { server } from './server'`
   - New: `import { server } from './server/index'`

2. **Utils Imports**:
   - No change needed as the utils directory structure is maintained

3. **Automation Imports**:
   - No change needed as the automation directory structure is maintained

4. **ComputerUse Imports**:
   - No change needed as the computerUse directory structure is maintained

### Test File Updates

The most significant changes will be in the test files that have been moved to the tests directory:

1. **Relative Path Updates**:
   - Old: `const { automationTools } = require('./src/automation/index')`
   - New: `const { automationTools } = require('../../src/automation/index')`

2. **Output Path Updates**:
   - Old: `const outputPath = path.join(__dirname, 'output')`
   - New: `const outputPath = path.join(__dirname, '../../output')`

3. **Config Path Updates**:
   - Old: `require('./src/utils/config')`
   - New: `require('../../src/utils/config')`

## Special Cases

### E2E Test Files

For end-to-end test files, the path changes will be deeper:

```javascript
// Old
const { automationTools } = require('./build/automation/index');
const { browserManager } = require('./build/automation/browserManager');
const { config } = require('./build/utils/config');

// New
const { automationTools } = require('../../build/automation/index');
const { browserManager } = require('../../build/automation/browserManager');
const { config } = require('../../build/utils/config');
```

### Script Files

For script files moved to the scripts directory:

```javascript
// Old
require('./src/utils/logger')

// New
require('../src/utils/logger') // For scripts/testing/
require('../src/utils/logger') // For scripts/deployment/
```

## Deployment File Updates

The CI/CD configuration files (like `.github/workflows/deploy.yml`) and deployment files (like `render.yaml`) might need updates to reflect the new paths:

```yaml
# Old
script: npm run test && node standalone-http-server.js

# New
script: npm run test && node scripts/deployment/standalone-http-server.js
```

## Path Resolution Strategy

To minimize the number of changes needed, consider using path aliases in TypeScript. Add this to your `tsconfig.json`:

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

Then use imports like:

```typescript
import { config } from '@/utils/config';
import { testHelper } from '@tests/helpers/testHelper';
```

This would require fewer updates when files are moved, as long as they stay within their respective top-level directories.

## Recommended Approach

1. Start by updating the server structure and main files
2. Update test imports next
3. Use a search tool to find any remaining references to old paths
4. Run the test suite to catch any missed import issues
5. Consider adding path aliases for future maintainability
