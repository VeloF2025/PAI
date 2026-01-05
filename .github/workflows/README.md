# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the PAI (Personal AI Infrastructure) repository.

## Available Workflows

### Pack v2.0 Validation (`pack-v2-validation.yml`)

Automatically validates that all skills meet Pack v2.0 compliance requirements on every push and pull request.

#### What It Does

**3 Jobs Running in Parallel:**

1. **validate-pack-v2** - Batch validation
   - Runs `check-pack-v2-status.cjs` to validate all skills
   - Fails the build if any skill doesn't meet Pack v2.0 requirements
   - Uploads validation report as artifact

2. **run-skill-tests** - Individual skill testing (Matrix)
   - Runs validation tests for each of the 11 skills in parallel
   - Checks for required files (README.md, INSTALL.md, VERIFY.md)
   - Verifies src/ directory exists with code files
   - Runs skill-specific test suites if they exist

3. **quality-check** - Quality assurance
   - Checks for legacy PACK_* files that should be renamed
   - Verifies all 11 expected skills are present
   - Generates comprehensive validation summary
   - Uploads summary as artifact (90-day retention)

#### Triggers

- **Push** to `master` or `main` branches (when skills/ or validation scripts change)
- **Pull Requests** to `master` or `main` branches (same path filters)

#### Requirements

- Node.js 20
- All skills must pass 12/12 Pack v2.0 validation tests
- Required structure:
  ```
  skill-name/
  ├── README.md
  ├── INSTALL.md
  ├── VERIFY.md
  └── src/
      └── [code files]
  ```

#### Artifacts

- **pack-v2-validation-report** (30-day retention)
  - Contains PACK_V2_REVALIDATION_SUMMARY.md
- **validation-summary** (90-day retention)
  - Generated summary with current validation results

#### Status Badge

Add this to your README.md to show validation status:

```markdown
[![Pack v2.0 Validation](https://github.com/Heinvv10/PAI/actions/workflows/pack-v2-validation.yml/badge.svg)](https://github.com/Heinvv10/PAI/actions/workflows/pack-v2-validation.yml)
```

## Local Testing

Before pushing, you can run the validation locally:

```bash
# Batch validation (all skills)
node docs/check-pack-v2-status.cjs

# Individual skill validation
cd skills/[skill-name]
vitest run tests/pack-v2.test.ts
```

## Troubleshooting

### Workflow Fails on "Run Pack v2.0 Validation"

- Check that all 11 skills have:
  - README.md, INSTALL.md, VERIFY.md (NOT PACK_*)
  - src/ directory with real code files
- Run `node docs/check-pack-v2-status.cjs` locally to identify failing skills

### Skill Test Fails on "Verify skill structure"

- Ensure the skill has all required files
- Verify src/ directory contains at least one code file (.ts, .js, .py, .json, .yaml, .yml)

### Quality Check Warning: Legacy PACK_* Files

- Rename PACK_README.md → README.md
- Rename PACK_INSTALL.md → INSTALL.md
- Rename PACK_VERIFY.md → VERIFY.md

## Adding New Skills

When adding a new skill:

1. Create the skill following Pack v2.0 structure
2. Add skill name to the `matrix.skill` list in `pack-v2-validation.yml`
3. Update expected skill count in quality-check job (currently 11)
4. Optionally create `tests/pack-v2.test.ts` using the template from `docs/pack-v2-validation-template.test.ts`

## Reference

- Pack v2.0 Specification: Based on Dan Miesler's specification
- Validation Test Template: `docs/pack-v2-validation-template.test.ts`
- Batch Validator: `docs/check-pack-v2-status.cjs`
- Re-validation Summary: `docs/PACK_V2_REVALIDATION_SUMMARY.md`
