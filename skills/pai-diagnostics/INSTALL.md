# PAI Diagnostics - Installation Guide

## Prerequisites

```bash
# Check Bun is installed
bun --version
# Should output: 1.0.0 or higher

# Check PAI_DIR is set
echo $PAI_DIR
# Should output: C:/Users/YourName/.claude or similar
```

## Pack v2.0 Source Files

This pack follows Dan Miesler's Pack v2.0 structure with real code files in `src/`:

**Diagnostic Tools** (`src/tools/`):
- `check-pai-state.ts` - Main diagnostic script (TypeScript)

These files are referenced in the installation steps below.

## Installation Steps

### Step 1: Copy Files

The diagnostic tool is already in your PAI installation at:
```
$PAI_DIR/skills/pai-diagnostics/
├── src/
│   └── tools/
│       └── check-pai-state.ts  # Main diagnostic script
├── SKILL.md                    # Skill documentation
├── README.md                   # This pack's overview
├── INSTALL.md                  # This file
└── VERIFY.md                   # Verification checklist
```

No file copying needed - files are already in place.

### Step 2: Make Executable (Unix/Mac)

```bash
chmod +x $PAI_DIR/skills/pai-diagnostics/src/tools/check-pai-state.ts
```

**Windows**: No action needed - Bun handles execution.

### Step 3: Test Installation

Run the diagnostic:

```bash
bun $PAI_DIR/skills/pai-diagnostics/src/tools/check-pai-state.ts
```

**Expected Output**: Health report with status indicators

### Step 4: Add Alias (Optional)

Add to your shell profile for quick access:

```bash
# ~/.bashrc or ~/.zshrc
alias pai-status="bun $PAI_DIR/skills/pai-diagnostics/src/tools/check-pai-state.ts --verbose"
```

**Windows PowerShell** (`$PROFILE`):
```powershell
function pai-status {
    bun "$env:PAI_DIR/skills/pai-diagnostics/src/tools/check-pai-state.ts" --verbose
}
```

## Usage

### Quick Check
```bash
bun $PAI_DIR/skills/pai-diagnostics/src/tools/check-pai-state.ts
```

### Verbose Output
```bash
bun $PAI_DIR/skills/pai-diagnostics/src/tools/check-pai-state.ts --verbose
```

### JSON Output
```bash
bun $PAI_DIR/skills/pai-diagnostics/src/tools/check-pai-state.ts --json
```

## Troubleshooting

### Error: "PAI directory not found"
**Symptom**: Script can't find PAI_DIR
**Solution**:
```bash
export PAI_DIR="/path/to/.claude"  # Unix/Mac
$env:PAI_DIR = "C:/Users/YourName/.claude"  # Windows
```

### Error: "bun: command not found"
**Symptom**: Bun runtime not installed
**Solution**: Install Bun from https://bun.sh

## Next Steps

Proceed to `VERIFY.md` to confirm everything is working.
