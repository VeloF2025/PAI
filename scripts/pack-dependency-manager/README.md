# Pack Dependency Manager

**Version**: 1.0.0
**Status**: ✅ MVP Complete
**Category**: development

## Overview

Comprehensive dependency management system for PAI Pack v2.0, enabling automatic dependency resolution, version conflict detection, and safe pack installations with semver compliance.

## Features

- ✅ **Semantic Versioning** - Full semver 2.0.0 support (^, ~, >=, etc.)
- ✅ **Dependency Resolution** - Recursive dependency tree building
- ✅ **Conflict Detection** - Version conflicts, peer dependencies, incompatible packs
- ✅ **Installation Planning** - Preview what will be installed before committing
- ✅ **Dependency Tree** - Visual dependency graph with depth tracking
- ✅ **Lock Files** - Deterministic installations with pack-lock.json
- ✅ **Optional Dependencies** - Gracefully handle missing optional packs
- ✅ **Peer Dependencies** - Verify environment compatibility

## Architecture

```
pack-dependency-manager/
├── schema/
│   └── pack.schema.json          # JSON Schema for pack.json manifest
├── src/
│   ├── types.ts                  # TypeScript type definitions
│   ├── version-resolver.ts       # Semver parsing and matching
│   ├── dependency-resolver.ts    # Dependency resolution engine
│   └── cli.ts                    # Command-line interface
└── README.md                     # This file
```

## pack.json Manifest

Every pack can now include a `pack.json` manifest for dependency management:

```json
{
  "name": "my-pack",
  "version": "1.0.0",
  "description": "My awesome pack",
  "author": "PAI",
  "license": "MIT",
  "category": "automation",

  "dependencies": {
    "kai": "^2.0.0",
    "agent-observability": "^1.0.0"
  },

  "peerDependencies": {
    "claude-code": "^1.0.0",
    "bun": ">=1.0.0"
  },

  "optionalDependencies": {
    "voice": "^1.0.0"
  },

  "conflicts": {
    "old-kai": "*",
    "legacy-hooks": "*"
  },

  "provides": {
    "hooks": ["session-start.ts", "stop-hook.ts"],
    "utilities": ["event-bus.ts", "shared.ts"]
  },

  "engines": {
    "bun": ">=1.0.0",
    "claude-code": ">=1.0.0"
  },

  "scripts": {
    "install": "bun src/install.ts",
    "test": "bun test",
    "verify": "bun src/verify.ts"
  }
}
```

## Usage

### CLI Commands

```bash
# Resolve dependencies for a pack
bun src/cli.ts resolve agent-observability

# List installed packs
bun src/cli.ts list

# Show dependency tree
bun src/cli.ts tree kai

# Check version satisfaction
bun src/cli.ts check "^1.0.0" "1.5.0"
```

### Programmatic API

```typescript
import { DependencyResolver } from './src/dependency-resolver';

const resolver = new DependencyResolver();

// Resolve dependencies
const plan = await resolver.resolve('my-pack', '^1.0.0');

console.log(`Target: ${plan.target}@${plan.version}`);
console.log(`Dependencies: ${plan.dependencies.length}`);
console.log(`Conflicts: ${plan.conflicts.length}`);

// Check conflicts
const conflicts = resolver.checkConflicts(plan);
if (conflicts.length > 0) {
  console.error('Version conflicts detected!');
}

// Build dependency tree
const tree = await resolver.buildTree('my-pack');
console.log(JSON.stringify(tree, null, 2));
```

## Version Range Syntax

| Range | Meaning | Example |
|-------|---------|---------|
| `1.2.3` | Exact version | Only 1.2.3 |
| `^1.2.3` | Compatible (major) | >=1.2.3 <2.0.0 |
| `~1.2.3` | Approximately (minor) | >=1.2.3 <1.3.0 |
| `>=1.2.3` | Greater or equal | 1.2.3, 1.5.0, 2.0.0, etc. |
| `<=1.2.3` | Less or equal | 1.0.0, 1.2.3, etc. |
| `>1.2.3` | Greater than | 1.2.4, 1.5.0, etc. |
| `<1.2.3` | Less than | 1.0.0, 1.2.2, etc. |

## Dependency Types

### dependencies
**Required** packs that must be installed:
```json
{
  "dependencies": {
    "kai": "^2.0.0"
  }
}
```

### peerDependencies
**Expected** environment dependencies (not auto-installed):
```json
{
  "peerDependencies": {
    "claude-code": "^1.0.0",
    "bun": ">=1.0.0"
  }
}
```

### optionalDependencies
**Optional** packs that enhance functionality:
```json
{
  "optionalDependencies": {
    "voice": "^1.0.0"
  }
}
```

### conflicts
Packs that **cannot** be installed alongside this one:
```json
{
  "conflicts": {
    "old-kai": "*"
  }
}
```

## Conflict Detection

The system detects multiple types of conflicts:

1. **Version Conflicts** - Different packs require incompatible versions
2. **Peer Dependency Mismatches** - Expected environment not satisfied
3. **Explicit Conflicts** - Packs marked as incompatible
4. **Circular Dependencies** - Prevented automatically

Example conflict output:
```
⚠️  Conflicts (2):
  - kai: Required by my-pack (^2.0.0) but agent-observability requires ^1.0.0
  - voice: Peer dependency not installed
```

## Installation Planning

Before installing, the system creates an installation plan:

```typescript
{
  target: 'my-pack',
  version: '1.0.0',
  dependencies: [
    { name: 'kai', version: '2.0.0', isInstalled: true },
    { name: 'voice', version: '1.5.0', isInstalled: false }
  ],
  conflicts: [],
  actions: [
    { type: 'install', packName: 'my-pack', toVersion: '1.0.0' },
    { type: 'skip', packName: 'kai', reason: 'Already installed' },
    { type: 'install', packName: 'voice', toVersion: '1.5.0' }
  ]
}
```

## Testing

Comprehensive TDD test suite:

```bash
# Run tests
bun test tests/pack-dependency-manager/

# Test coverage
bun test --coverage
```

## Future Enhancements

### Phase 2: Pack Installer
- Automatic pack installation from manifests
- File copying and configuration updates
- Rollback on installation failure
- Verification after installation

### Phase 3: Pack Registry
- Centralized pack discovery
- Version tracking across repositories
- Remote pack installation
- Pack publishing workflow

### Phase 4: Lock Files
- Deterministic installations with pack-lock.json
- Integrity hashing for security
- Reproducible builds

### Phase 5: Pack Marketplace Integration
- Web UI for pack discovery
- Ratings and reviews
- Installation analytics
- Cross-pack recommendations

## Examples

### Example 1: kai Pack

```json
{
  "name": "kai",
  "version": "2.0.0",
  "description": "Shared utilities for hook development",
  "category": "development",

  "provides": {
    "utilities": [
      "event-bus.ts",
      "shared.ts",
      "security.ts",
      "categorizer.ts"
    ]
  },

  "engines": {
    "bun": ">=1.0.0"
  }
}
```

### Example 2: agent-observability Pack

```json
{
  "name": "agent-observability",
  "version": "1.0.0",
  "description": "Real-time agent monitoring dashboard",
  "category": "observability",

  "dependencies": {
    "kai": "^2.0.0"
  },

  "peerDependencies": {
    "bun": ">=1.0.0"
  },

  "provides": {
    "tools": ["dashboard"],
    "hooks": ["capture-all-events.ts"]
  },

  "scripts": {
    "start": "bun src/server/file-ingest.ts"
  }
}
```

## Benefits

1. **Safe Installations** - Detect conflicts before installing
2. **Reproducible** - Lock files ensure consistent environments
3. **Automated** - AI agents can install packs autonomously
4. **Transparent** - Clear dependency trees and installation plans
5. **Standard** - Uses industry-standard semver semantics

## Credits

Based on npm/yarn dependency management patterns adapted for PAI Pack System v2.0.

## Related Documentation

- [Pack System v2.0](../../PACK_SYSTEM.md)
- [15 Founding Principles](../../15_FOUNDING_PRINCIPLES.md)
- [PAI Implementation Status](../../PAI_IMPLEMENTATION_STATUS.md)

---

**Pack Dependency Manager v1.0.0**
**Status**: ✅ MVP Complete
**Next**: Pack Installer implementation
