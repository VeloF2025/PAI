#!/bin/bash
# PAI/KAI System-Wide Launcher
# Triggers: @pai, @kai
# - First call: Initialize PAI + scan codebase + run validators
# - Subsequent calls: Refresh/resume PAI session

set -e

PAI_DIR="${PAI_DIR:-$HOME/Workspace/PAI}"
CLAUDE_DIR="$HOME/.claude"
PROJECT_MARKER=".pai-initialized"
VALIDATORS_DIR="$PAI_DIR/scripts/validators"

# Colors
GREEN='\033[0;32m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Determine mode from argument
MODE="${1:-pai}"
WORK_DIR="${2:-$(pwd)}"

echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}  PAI SYSTEM ACTIVATION${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"

# Check if Claude Code is available
if ! command -v claude &> /dev/null; then
    echo -e "${RED}ERROR: Claude Code CLI not found${NC}"
    exit 1
fi

# Check if global .claude directory exists, if not set it up
if [[ ! -d "$CLAUDE_DIR" ]]; then
    echo -e "${YELLOW}[INIT] Setting up global PAI structure...${NC}"
    cp -r "$PAI_DIR/.claude" "$CLAUDE_DIR"
    echo -e "${GREEN}[DONE] Global PAI installed at ~/.claude${NC}"
fi

cd "$WORK_DIR"

# Function to run validators and capture output
run_validators() {
    local validation_report=""

    echo -e "${YELLOW}[VALIDATE] Running PAI validators...${NC}"

    # Run DGTS validator
    if [[ -f "$VALIDATORS_DIR/dgts-validator.py" ]]; then
        echo -e "  ${GREEN}→${NC} DGTS validation..."
        dgts_result=$(python3 "$VALIDATORS_DIR/dgts-validator.py" . --quiet 2>/dev/null || echo "ERROR")
        if [[ "$dgts_result" == "ERROR" ]]; then
            validation_report+="DGTS: Could not run validator\n"
        else
            validation_report+="DGTS Score: $dgts_result (threshold: 0.3)\n"
        fi
    fi

    # Run Zero Tolerance validator
    if [[ -f "$VALIDATORS_DIR/zero-tolerance-validator.py" ]]; then
        echo -e "  ${GREEN}→${NC} Zero Tolerance validation..."
        zt_result=$(python3 "$VALIDATORS_DIR/zero-tolerance-validator.py" . --quiet 2>/dev/null || echo "FAIL")
        validation_report+="Zero Tolerance: $zt_result\n"
    fi

    echo "$validation_report"
}

# Build the PAI initialization prompt
build_init_prompt() {
    local validation_results="$1"

    cat << EOFPROMPT
@PAI ACTIVATED

**PROTOCOLS ENGAGED:**
- NLNH (No Lies, No Hallucinations) - Say "I don't know" when uncertain
- DGTS (Don't Game The System) - No fake tests, no mocked implementations
- Zero Tolerance Quality - No console.log, proper error handling, 100% type coverage

**PRE-VALIDATION RESULTS:**
$validation_results

**INITIALIZATION TASKS:**
1. Scan this codebase structure using Glob/Read tools
2. Identify the tech stack (check package.json, requirements.txt, etc.)
3. Check for existing tests, CI/CD config, linting setup
4. If validation found issues, list them

**REPORT FORMAT:**
\`\`\`
[PROJECT] Name and type
[STACK] Languages, frameworks, key dependencies
[STRUCTURE] Main directories (src/, tests/, etc.)
[QUALITY] Linting, tests, CI/CD status
[VALIDATION] PAI validator results
[STATUS] Ready for instructions
\`\`\`

Begin scanning now.
EOFPROMPT
}

PAI_REFRESH_PROMPT='@PAI REFRESHED

**PROTOCOLS RE-ENGAGED:**
- NLNH | DGTS | Zero Tolerance Quality

**TASK:** Quick status check:
1. What were we working on?
2. Any pending tasks from todo list?
3. Ready for next instruction.

Keep response brief.'

# Check if this is a new project or existing PAI session
if [[ -f "$PROJECT_MARKER" ]]; then
    # Existing project - refresh/resume
    echo -e "${GREEN}[MODE]${NC} REFRESH - Resuming PAI session"
    echo -e "${GREEN}[DIR]${NC} $WORK_DIR"
    echo ""

    if [[ "$MODE" == "kai" ]]; then
        claude --continue -p "$PAI_REFRESH_PROMPT

KAI AUTONOMOUS MODE: Proceed without confirmation on routine tasks."
    else
        claude --continue -p "$PAI_REFRESH_PROMPT"
    fi
else
    # New project - initialize
    echo -e "${YELLOW}[MODE]${NC} INIT - New project setup"
    echo -e "${GREEN}[DIR]${NC} $WORK_DIR"
    echo ""

    # Run validators first
    VALIDATION_RESULTS=$(run_validators)
    echo -e "${GREEN}[VALIDATED]${NC} Pre-scan complete"
    echo ""

    # Create project marker with metadata
    cat > "$PROJECT_MARKER" << EOFMARKER
PAI initialized: $(date)
Directory: $WORK_DIR
Mode: $MODE
PAI_DIR: $PAI_DIR
EOFMARKER
    echo -e "${GREEN}[MARKER]${NC} .pai-initialized created"

    # Check for project-local .claude directory
    if [[ ! -d ".claude" ]]; then
        mkdir -p .claude
    fi

    # Create CLAUDE.md if not exists
    if [[ ! -f "CLAUDE.md" ]]; then
        cat > CLAUDE.md << 'EOFCLAUDE'
# Project Configuration

## PAI Integration
This project uses PAI (Personal AI Infrastructure) protocols.

**Active Protocols:**
- NLNH (No Lies, No Hallucinations) - Truthfulness enforcement
- DGTS (Don't Game The System) - Anti-gaming validation
- Zero Tolerance Quality - Strict code quality standards

**Validators:**
```bash
# Run DGTS validation
python "$PAI_DIR/scripts/validators/dgts-validator.py" .

# Run Zero Tolerance validation
python "$PAI_DIR/scripts/validators/zero-tolerance-validator.py" .
```

**Invoke:** Type `@pai` to refresh context.
EOFCLAUDE
        echo -e "${GREEN}[CREATED]${NC} CLAUDE.md"
    fi

    echo ""

    # Build prompt with validation results
    INIT_PROMPT=$(build_init_prompt "$VALIDATION_RESULTS")

    # Start new session with full initialization
    if [[ "$MODE" == "kai" ]]; then
        claude -p "$INIT_PROMPT

**KAI AUTONOMOUS MODE:** You have permission to make changes, run commands, and proceed without asking for confirmation on routine tasks. Use your judgment for destructive operations."
    else
        claude -p "$INIT_PROMPT"
    fi
fi
