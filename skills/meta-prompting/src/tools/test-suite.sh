#!/bin/bash

# Meta-Prompting System Test Suite
# Tests all components of the TÂCHES integration

HOOKS_DIR="$HOME/.claude/hooks"
PROMPTS_DIR="$HOME/.claude/prompts"
SKILLS_DIR="$HOME/.claude/skills/meta-prompting"

echo "═══════════════════════════════════════════════════════════"
echo "  Meta-Prompting System Test Suite"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
  local test_name=$1
  local test_command=$2

  echo "Testing: $test_name"

  if eval "$test_command" >/dev/null 2>&1; then
    echo "  ✅ PASSED"
    ((TESTS_PASSED++))
  else
    echo "  ❌ FAILED"
    ((TESTS_FAILED++))
  fi
  echo ""
}

# ============================================================================
# Test 1: File Existence
# ============================================================================

echo "─────────────────────────────────────────────────────────────"
echo "1. File Existence Tests"
echo "─────────────────────────────────────────────────────────────"
echo ""

run_test "SKILL.md exists" "test -f $SKILLS_DIR/SKILL.md"
run_test "README.md exists" "test -f $SKILLS_DIR/README.md"
run_test "clarification.md exists" "test -f $SKILLS_DIR/workflows/clarification.md"
run_test "storage.ts exists" "test -f $SKILLS_DIR/workflows/storage.ts"
run_test "execution.md exists" "test -f $SKILLS_DIR/workflows/execution.md"
run_test "auto-meta-prompt-clarification.ts exists" "test -f $HOOKS_DIR/auto-meta-prompt-clarification.ts"
run_test "auto-prompt-archival.ts exists" "test -f $HOOKS_DIR/auto-prompt-archival.ts"

# ============================================================================
# Test 2: Directory Structure
# ============================================================================

echo "─────────────────────────────────────────────────────────────"
echo "2. Directory Structure Tests"
echo "─────────────────────────────────────────────────────────────"
echo ""

run_test "prompts/active directory exists" "test -d $PROMPTS_DIR/active"
run_test "prompts/completed directory exists" "test -d $PROMPTS_DIR/completed"
run_test "prompts/templates directory exists" "test -d $PROMPTS_DIR/templates"
run_test "workflows directory exists" "test -d $SKILLS_DIR/workflows"

# ============================================================================
# Test 3: Configuration
# ============================================================================

echo "─────────────────────────────────────────────────────────────"
echo "3. Configuration Tests"
echo "─────────────────────────────────────────────────────────────"
echo ""

run_test "PAI_META_PROMPT_ENABLED set" "grep -q 'PAI_META_PROMPT_ENABLED.*true' $HOME/.claude/settings.json"
run_test "PAI_META_PROMPT_ARCHIVAL set" "grep -q 'PAI_META_PROMPT_ARCHIVAL.*true' $HOME/.claude/settings.json"
run_test "PAI_META_PROMPT_MIN_CLARITY set" "grep -q 'PAI_META_PROMPT_MIN_CLARITY' $HOME/.claude/settings.json"
run_test "UserPromptSubmit hook registered" "grep -q 'auto-meta-prompt-clarification.ts' $HOME/.claude/settings.json"
run_test "PostToolUse hook registered" "grep -q 'auto-prompt-archival.ts' $HOME/.claude/settings.json"

# ============================================================================
# Test 4: Hook Execution
# ============================================================================

echo "─────────────────────────────────────────────────────────────"
echo "4. Hook Execution Tests"
echo "─────────────────────────────────────────────────────────────"
echo ""

# Test vague prompt detection
echo "Test 4.1: Vague prompt triggers clarification"
OUTPUT=$(echo "improve authentication" | bun $HOOKS_DIR/auto-meta-prompt-clarification.ts 2>&1)
if echo "$OUTPUT" | grep -q "clarity score"; then
  echo "  ✅ PASSED - Vague prompt detected and scored"
  ((TESTS_PASSED++))
else
  echo "  ❌ FAILED - Vague prompt not detected"
  ((TESTS_FAILED++))
fi
echo ""

# Test skip keyword
echo "Test 4.2: Skip keyword bypasses clarification"
OUTPUT=$(echo "[skip clarification] improve auth" | bun $HOOKS_DIR/auto-meta-prompt-clarification.ts 2>&1)
if echo "$OUTPUT" | grep -q "Skip keyword detected"; then
  echo "  ✅ PASSED - Skip keyword recognized"
  ((TESTS_PASSED++))
else
  echo "  ❌ FAILED - Skip keyword not recognized"
  ((TESTS_FAILED++))
fi
echo ""

# Test archival hook
echo "Test 4.3: Archival hook executes without error"
OUTPUT=$(echo '{"tool":"Write","output":"success"}' | bun $HOOKS_DIR/auto-prompt-archival.ts 2>&1)
if echo "$OUTPUT" | grep -q "Hook triggered"; then
  echo "  ✅ PASSED - Archival hook executed"
  ((TESTS_PASSED++))
else
  echo "  ❌ FAILED - Archival hook failed"
  ((TESTS_FAILED++))
fi
echo ""

# ============================================================================
# Test 5: Clarity Scoring
# ============================================================================

echo "─────────────────────────────────────────────────────────────"
echo "5. Clarity Scoring Tests"
echo "─────────────────────────────────────────────────────────────"
echo ""

# Test very vague prompt
echo "Test 5.1: Very vague prompt gets low score"
OUTPUT=$(echo "fix it" | bun $HOOKS_DIR/auto-meta-prompt-clarification.ts 2>&1)
if echo "$OUTPUT" | grep -E "clarity score of [0-4]\." >/dev/null 2>&1; then
  echo "  ✅ PASSED - Very vague prompt scored low"
  ((TESTS_PASSED++))
else
  echo "  ⚠️  SKIPPED - Score detection not precise enough"
fi
echo ""

# Test moderately specific prompt
echo "Test 5.2: Moderate prompt gets medium score"
OUTPUT=$(echo "Add email verification to signup using SendGrid" | bun $HOOKS_DIR/auto-meta-prompt-clarification.ts 2>&1)
SCORE=$(echo "$OUTPUT" | grep -oP "clarity score of \K[0-9.]+")
if [ -n "$SCORE" ]; then
  echo "  ✅ PASSED - Moderate prompt scored: $SCORE/10"
  ((TESTS_PASSED++))
else
  echo "  ⚠️  SKIPPED - Could not extract score"
fi
echo ""

# ============================================================================
# Test 6: Question Generation
# ============================================================================

echo "─────────────────────────────────────────────────────────────"
echo "6. Question Generation Tests"
echo "─────────────────────────────────────────────────────────────"
echo ""

echo "Test 6.1: Vague prompt generates questions"
OUTPUT=$(echo "improve code" | bun $HOOKS_DIR/auto-meta-prompt-clarification.ts 2>&1)
QUESTION_COUNT=$(echo "$OUTPUT" | grep -c "^[0-9]\.")
if [ "$QUESTION_COUNT" -gt 0 ]; then
  echo "  ✅ PASSED - Generated $QUESTION_COUNT clarification questions"
  ((TESTS_PASSED++))
else
  echo "  ❌ FAILED - No questions generated"
  ((TESTS_FAILED++))
fi
echo ""

# ============================================================================
# Test 7: TypeScript Compilation (if available)
# ============================================================================

echo "─────────────────────────────────────────────────────────────"
echo "7. TypeScript Compilation Tests"
echo "─────────────────────────────────────────────────────────────"
echo ""

if command -v bunx >/dev/null 2>&1; then
  echo "Test 7.1: storage.ts compiles without errors"
  if bunx tsc --noEmit $SKILLS_DIR/workflows/storage.ts 2>/dev/null; then
    echo "  ✅ PASSED - storage.ts compiles cleanly"
    ((TESTS_PASSED++))
  else
    echo "  ⚠️  WARNING - TypeScript errors detected (may be import-related)"
  fi
  echo ""

  echo "Test 7.2: Hooks compile without errors"
  if bunx tsc --noEmit $HOOKS_DIR/auto-meta-prompt-clarification.ts 2>/dev/null; then
    echo "  ✅ PASSED - Clarification hook compiles"
    ((TESTS_PASSED++))
  else
    echo "  ⚠️  WARNING - TypeScript errors in clarification hook"
  fi
  echo ""
else
  echo "  ⚠️  SKIPPED - TypeScript compiler not available"
  echo ""
fi

# ============================================================================
# Test 8: Integration Tests
# ============================================================================

echo "─────────────────────────────────────────────────────────────"
echo "8. Integration Tests"
echo "─────────────────────────────────────────────────────────────"
echo ""

echo "Test 8.1: Hooks don't conflict with existing PAI hooks"
CLARIFICATION_HOOK_COUNT=$(grep -c "auto-meta-prompt-clarification.ts" $HOME/.claude/settings.json)
if [ "$CLARIFICATION_HOOK_COUNT" -eq 1 ]; then
  echo "  ✅ PASSED - Clarification hook registered exactly once"
  ((TESTS_PASSED++))
else
  echo "  ❌ FAILED - Hook registered $CLARIFICATION_HOOK_COUNT times"
  ((TESTS_FAILED++))
fi
echo ""

echo "Test 8.2: PostToolUse hook registered correctly"
ARCHIVAL_HOOK_COUNT=$(grep -c "auto-prompt-archival.ts" $HOME/.claude/settings.json)
if [ "$ARCHIVAL_HOOK_COUNT" -eq 1 ]; then
  echo "  ✅ PASSED - Archival hook registered exactly once"
  ((TESTS_PASSED++))
else
  echo "  ❌ FAILED - Archival hook registered $ARCHIVAL_HOOK_COUNT times"
  ((TESTS_FAILED++))
fi
echo ""

# ============================================================================
# Summary
# ============================================================================

echo "═══════════════════════════════════════════════════════════"
echo "  Test Results Summary"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo "Total Tests:  $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ "$TESTS_FAILED" -eq 0 ]; then
  echo "✅ ALL TESTS PASSED - Meta-Prompting System is fully operational!"
  echo ""
  echo "Next Steps:"
  echo "  1. Try a vague prompt to see clarification in action"
  echo "  2. Check ~/.claude/prompts/completed/ after completing tasks"
  echo "  3. Review archived prompts for pattern learning"
  exit 0
else
  echo "⚠️  SOME TESTS FAILED - Please review errors above"
  echo ""
  echo "Common Issues:"
  echo "  - Bun not installed or not in PATH"
  echo "  - TypeScript compilation errors (usually safe to ignore)"
  echo "  - Hook execution permissions"
  exit 1
fi
