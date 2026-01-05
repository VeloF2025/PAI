# Verification Checklist - input-leap-manager

Use this checklist to verify the skill is properly installed and working.

## Installation Verification

### 1. File Structure

- [ ] `README.md` exists and is readable
- [ ] `INSTALL.md` exists (installation guide)
- [ ] `VERIFY.md` exists (this file)
- [ ] `src/` directory exists
- [ ] `src/` contains code files (.ts, .js, .py, or .json)

```bash
cd ~/.claude/skills/input-leap-manager
ls -la README.md INSTALL.md VERIFY.md src/
```

### 2. Dependencies

- [ ] All dependencies installed successfully
- [ ] No dependency conflicts or errors

```bash
cd ~/.claude/skills/input-leap-manager/src
# For Node.js/TypeScript:
npm list --depth=0
# or
bun pm ls

# For Python:
pip list | grep -i input-leap-manager
```

### 3. Configuration

- [ ] Environment variables configured (if required)
- [ ] Configuration files created (if required)
- [ ] API keys added to `.env` (if required)

```bash
# Check .env file (sensitive - don't share output)
cat ~/.claude/.env | grep -i input-leap-manager
```

### 4. Code Verification

- [ ] CLI tool runs without errors
- [ ] Help command shows usage information
- [ ] Basic functionality works

```bash
cd ~/.claude/skills/input-leap-manager/src

# Test CLI (TypeScript):
./cli.ts --help

# Test CLI (Python):
python cli.py --help

# Test basic functionality:
./cli.ts --version
# or
python cli.py --version
```

## Functional Verification

### 5. Basic Functionality

Test the core features of the skill:

- [ ] Skill can be invoked via Claude Code
- [ ] Basic operations complete successfully
- [ ] Error handling works correctly
- [ ] Output is formatted properly

### 6. Integration Testing

- [ ] Skill integrates with Claude Code CLI
- [ ] Environment variables load correctly
- [ ] File paths resolve correctly
- [ ] Permissions are correct (read/write access)

### 7. Edge Cases

- [ ] Handles missing input gracefully
- [ ] Handles invalid input with clear error messages
- [ ] Doesn't crash on unexpected data
- [ ] Provides helpful error messages

## Troubleshooting

If any verification steps fail, see `INSTALL.md` troubleshooting section or:

1. Re-run installation steps
2. Check error messages carefully
3. Verify environment variables are set
4. Check file permissions
5. Restart Claude Code CLI

## Success Criteria

✅ **Skill is ready** when ALL boxes above are checked.

If you encounter issues, see:
- `README.md` - Skill documentation
- `INSTALL.md` - Installation instructions
- GitHub Issues - Report problems

---

**Verification Checklist Version**: 1.0
**Skill**: input-leap-manager
**Format**: Pack v2.0
