#!/usr/bin/env bash
#
# Validation Runner - Run all PAI quality gates
#
# Usage: bash validation-runner.sh <project-dir> <story-id>
# Exit code: 0 if all gates pass, 1 if any fail
#

set -e

PROJECT_DIR="${1:-.}"
STORY_ID="$2"

# Change to project directory
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Track results
GATES_PASSED=0
GATES_FAILED=0

# Helper function to run gate
run_gate() {
    local gate_name="$1"
    local gate_number="$2"
    local gate_command="$3"

    echo -e "${BLUE}  ${gate_number} ${gate_name}:${NC} Running..."

    if eval "$gate_command" >/dev/null 2>&1; then
        echo -e "${GREEN}  ${gate_number} ${gate_name}: ✅ PASS${NC}"
        GATES_PASSED=$((GATES_PASSED + 1))
        return 0
    else
        echo -e "${RED}  ${gate_number} ${gate_name}: ❌ FAIL${NC}"
        GATES_FAILED=$((GATES_FAILED + 1))
        return 1
    fi
}

echo "Running validation gates for story: $STORY_ID"
echo ""

# Gate 1: TypeScript compilation
if [ -f "package.json" ] && grep -q "typescript" "package.json"; then
    run_gate "TypeScript" "1️⃣ " "npx tsc --noEmit" || true
else
    echo -e "${YELLOW}  1️⃣  TypeScript: ⏭️  SKIP (not a TypeScript project)${NC}"
fi

# Gate 2: ESLint
if [ -f "package.json" ] && grep -q "eslint" "package.json"; then
    if [ -d "node_modules" ] && [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || [ -f "eslint.config.js" ]; then
        run_gate "ESLint" "2️⃣ " "npx eslint . --max-warnings 0" || true
    else
        echo -e "${YELLOW}  2️⃣  ESLint: ⏭️  SKIP (node_modules or .eslintrc not found - run npm install)${NC}"
    fi
else
    echo -e "${YELLOW}  2️⃣  ESLint: ⏭️  SKIP (ESLint not configured)${NC}"
fi

# Gate 3: Zero Tolerance
if [ -f "$HOME/.claude/scripts/validators/zero-tolerance-validator.py" ]; then
    run_gate "Zero Tolerance" "3️⃣ " "python \"$HOME/.claude/scripts/validators/zero-tolerance-validator.py\" ." || true
elif [ -f "scripts/validation/zero-tolerance-validator.py" ]; then
    run_gate "Zero Tolerance" "3️⃣ " "python scripts/validation/zero-tolerance-validator.py ." || true
else
    echo -e "${YELLOW}  3️⃣  Zero Tolerance: ⏭️  SKIP (validator not found)${NC}"
fi

# Gate 4: DGTS Gaming Detection
if [ -f "$HOME/.claude/scripts/validators/dgts-validator.py" ]; then
    run_gate "DGTS" "4️⃣ " "python \"$HOME/.claude/scripts/validators/dgts-validator.py\" . --threshold 0.5" || true
elif [ -f "scripts/validation/dgts-validator.py" ]; then
    run_gate "DGTS" "4️⃣ " "python scripts/validation/dgts-validator.py . --threshold 0.5" || true
else
    echo -e "${YELLOW}  4️⃣  DGTS: ⏭️  SKIP (validator not found)${NC}"
fi

# Gate 5: Automated Tests
if [ -f "package.json" ]; then
    if grep -q "\"test\":" "package.json"; then
        run_gate "Tests" "5️⃣ " "npm test" || true
    else
        echo -e "${YELLOW}  5️⃣  Tests: ⏭️  SKIP (no test script)${NC}"
    fi
fi

# Gate 6: Chrome Extension Visual Validation (for UI changes)
# Check if story affects UI components
PRD_FILE="$PROJECT_DIR/prd.json"
COMPONENTS=$(jq -r ".user_stories[] | select(.id == \"$STORY_ID\") | .components_affected | join(\",\")" "$PRD_FILE" 2>/dev/null || echo "")

if echo "$COMPONENTS" | grep -qi "ui\|component\|page"; then
    # Check for UI file changes
    if git diff --name-only HEAD 2>/dev/null | grep -E "(components|pages|app)/.*\.(tsx|jsx)" >/dev/null; then
        echo -e "${BLUE}  6️⃣  Chrome Extension: 🖥️  UI changes detected${NC}"
        echo -e "${YELLOW}     Manual validation required in Chrome browser${NC}"
        echo -e "${YELLOW}     Start with: claude --chrome${NC}"
        echo -e "${YELLOW}     Validate the UI changes and confirm (y/n): ${NC}"

        # For autonomous mode, we'll skip manual validation
        # In future, could integrate with automated screenshot comparison
        echo -e "${YELLOW}  6️⃣  Chrome Extension: ⏭️  SKIP (manual validation - run 'claude --chrome' separately)${NC}"
    else
        echo -e "${YELLOW}  6️⃣  Chrome Extension: ⏭️  SKIP (no UI changes detected)${NC}"
    fi
else
    echo -e "${YELLOW}  6️⃣  Chrome Extension: ⏭️  SKIP (not a UI story)${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}Gates passed: $GATES_PASSED${NC}"
echo -e "${RED}Gates failed: $GATES_FAILED${NC}"
echo "========================================"

# Exit with failure if any gate failed
if [ $GATES_FAILED -gt 0 ]; then
    exit 1
fi

exit 0
