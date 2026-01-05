# Installation - xlsx

## Prerequisites

- Claude Code CLI installed
- Node.js 20+ or Bun runtime
- Python 3.8+ (if using Python tools)

## Installation Steps

### 1. Verify Skill Files

Check that all required files are present:

```bash
cd ~/.claude/skills/xlsx
ls -la
```

You should see:
- `README.md` - Skill documentation
- `INSTALL.md` - This file
- `VERIFY.md` - Verification checklist
- `src/` - Source code directory

### 2. Install Dependencies

If the skill has a `package.json`:

```bash
cd ~/.claude/skills/xlsx/src
npm install
# or
bun install
```

If the skill has a `requirements.txt`:

```bash
cd ~/.claude/skills/xlsx/src
pip install -r requirements.txt
# or
python -m pip install -r requirements.txt
```

### 3. Configure Environment Variables

If the skill requires API keys or configuration:

1. Copy the example configuration:
   ```bash
   cp ~/.claude/skills/xlsx/src/config/example.env ~/.claude/.env
   ```

2. Edit `~/.claude/.env` and add your credentials

3. See README.md for required environment variables

### 4. Test the Skill

```bash
# Test the skill is accessible
claude --help | grep xlsx

# Or test directly
cd ~/.claude/skills/xlsx/src
./cli.ts --help
# or
python cli.py --help
```

## Troubleshooting

### Skill not found

If Claude Code doesn't recognize the skill:

1. Check skill is in `~/.claude/skills/`
2. Restart Claude Code CLI
3. Check `~/.claude/settings.json` for skill configuration

### Dependencies not installing

- Ensure Node.js 20+ or Python 3.8+ is installed
- Check for permission issues
- Try using `sudo` or run as administrator (Windows)

### Environment variables not loading

- Check `.env` file exists in `~/.claude/`
- Verify variable names match those in README.md
- Restart Claude Code after editing `.env`

## Next Steps

After installation, see `VERIFY.md` for verification checklist.

---

**Installation Guide Version**: 1.0
**Skill**: xlsx
**Format**: Pack v2.0
