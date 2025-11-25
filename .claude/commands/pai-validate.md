Run the unified PAI validation system that checks all validation protocols:

1. **NLNH Protocol** - Truth enforcement & confidence scoring
2. **DGTS Anti-Gaming** - Gaming pattern detection (40+ patterns)
3. **Zero Tolerance** - Quality gates (console.log, errors, bundle size)
4. **Documentation-Driven TDD** - Tests from documentation verification
5. **AntiHall Validator** - Code existence verification
6. **TypeScript/ESLint** - Static analysis (auto-discovered)
7. **Unit Tests** - Vitest/Jest/Pytest (auto-discovered)
8. **E2E Tests** - Playwright end-to-end testing (if UI project)

Execute the comprehensive validation:

```bash
node scripts/validation/pai-orchestrator.js --verbose
```

This command will:
- Run all validation layers in sequence
- Auto-discover project tools (TypeScript, ESLint, test frameworks)
- Execute E2E tests if UI project detected
- Provide colored terminal output with pass/fail status
- Exit with code 0 if all pass, 1 if any fail

**Options**:
- `--verbose` or `-v`: Show detailed output from each validation
- `--skip-e2e`: Skip Layer 3 E2E tests

**Expected Output**: Validation summary showing passed/failed/warned/skipped checks with total duration.
