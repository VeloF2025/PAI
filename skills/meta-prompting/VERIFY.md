# Meta-Prompting Verification Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-04
**Test Coverage**: 15 scenarios, 47 verification points

---

## Table of Contents

1. [Quick Verification](#quick-verification)
2. [Component Tests](#component-tests)
3. [Integration Tests](#integration-tests)
4. [Performance Tests](#performance-tests)
5. [Edge Case Tests](#edge-case-tests)
6. [Regression Tests](#regression-tests)
7. [Automated Test Suite](#automated-test-suite)

---

## Quick Verification

**Time**: ~5 minutes
**Purpose**: Verify basic installation and core functionality

### Test 1: Directory Structure

```bash
# Run directory check
test -d ~/.claude/skills/meta-prompting && \
test -d ~/.claude/prompts/vague && \
test -d ~/.claude/prompts/clarified && \
test -d ~/.claude/prompts/completed && \
test -d ~/.claude/prompts/archived && \
test -d ~/.claude/prompts/templates && \
test -d ~/.claude/logs/meta-prompting && \
echo "✅ All directories exist" || echo "❌ Missing directories"
```

**Expected**: `✅ All directories exist`

---

### Test 2: Hook Registration

```bash
# Check UserPromptSubmit hook
grep -q "auto-meta-prompt-clarification.ts" ~/.claude/settings.json && \
echo "✅ UserPromptSubmit hook registered" || \
echo "❌ UserPromptSubmit hook missing"

# Check PostToolUse hook
grep -q "auto-prompt-archival.ts" ~/.claude/settings.json && \
echo "✅ PostToolUse hook registered" || \
echo "❌ PostToolUse hook missing"
```

**Expected**:
```
✅ UserPromptSubmit hook registered
✅ PostToolUse hook registered
```

---

### Test 3: MCP Server Connection

**Steps**:
1. Start Claude Code session: `claude-code`
2. Run MCP status command: `/mcp`

**Expected Output**:
```
Connected MCP Servers:
✅ claude-prompts - Connected
✅ memory - Connected (if installed)
```

**Pass Criteria**: `claude-prompts` shows as Connected

---

### Test 4: Vague Prompt Detection (Basic)

**Test Prompt** (in Claude Code session):
```
"Can you help me build something?"
```

**Expected Behavior**:
1. Hook detects vague prompt (< 50 words, contains "something")
2. Meta-prompting activates Phase 1 (Clarification)
3. Claude responds with clarification questions about:
   - What "something" refers to (objective)
   - Technical requirements
   - Scope and constraints

**Pass Criteria**: Claude asks at least 3 clarification questions without executing immediately

---

### Test 5: Auto-Bypass for Clear Prompts (Basic)

**Test Prompt** (in Claude Code session):
```
"Create a TypeScript function named `calculateSum` that takes an array of numbers and returns the sum. Use Array.reduce(), add JSDoc comments, handle empty arrays by returning 0, and export as default."
```

**Expected Behavior**:
1. Hook calculates clarity score >= 8
2. Meta-prompting bypasses Phase 1 (no clarification)
3. Executes directly (may use PAI enhancement tools)
4. Creates the function without asking questions

**Pass Criteria**: Claude proceeds directly to implementation without clarification questions

---

## Component Tests

**Time**: ~20 minutes
**Purpose**: Verify individual components function correctly

### Test 6: 10-Point Clarity Assessment

**Objective**: Verify clarity scoring algorithm works correctly

**Test Cases**:

#### Case A: Extremely Vague Prompt
```
"Do something with React"
```

**Expected Dimensions (Score 0-10 each)**:
- Objective Clarity: 1-2 (weighted 1.2x) - "Do something" is undefined
- Technical Specificity: 2-3 (weighted 1.3x) - Only "React" mentioned
- Scope Definition: 1-2 (weighted 1.0x) - No boundaries
- Context Completeness: 1-2 (weighted 1.1x) - No background
- Quality Standards: 0-1 (weighted 1.2x) - No criteria

**Expected Overall Score**: 1.5-2.5 (triggers clarification)

**Verification**:
```
Ask Claude: "Analyze the clarity of this prompt: 'Do something with React'"
```

**Pass Criteria**: Overall score < 4, at least 5 dimensions score < 5

---

#### Case B: Moderately Clear Prompt
```
"Create a React component that displays a user profile with name, email, and avatar. Use TypeScript and fetch data from an API."
```

**Expected Dimensions**:
- Objective Clarity: 7-8 - Clear goal stated
- Technical Specificity: 6-7 - React, TypeScript, API mentioned
- Scope Definition: 5-6 - Component scope defined
- Context Completeness: 4-5 - Some context missing (API details)
- Input/Output Definition: 5-6 - Data structure partially defined

**Expected Overall Score**: 5.5-6.5 (may trigger clarification depending on threshold)

**Pass Criteria**: Overall score 5-7, execution may ask 1-2 clarification questions

---

#### Case C: Specification-Grade Prompt
```
"Create a TypeScript React functional component named UserProfile that:
1. Fetches user data from GET /api/users/:id endpoint
2. Displays: avatar (150x150 CircleAvatar), full name (h2), email (mailto link), bio (p), join date (formatted as 'Member since MMM YYYY')
3. Shows loading spinner (Spinner component from @/components/ui) while fetching
4. Shows error message (Alert component) if fetch fails
5. Uses React Query's useQuery hook with 5-minute staleTime
6. Implements retry logic (3 attempts with exponential backoff)
7. Style with TailwindCSS: card with shadow-lg, p-6, rounded-lg
8. Add PropTypes validation for userId prop (number, required)
9. Export as default, place in src/components/UserProfile.tsx
10. Write unit tests in UserProfile.test.tsx using Vitest and React Testing Library"
```

**Expected Dimensions**:
- All dimensions: 9-10
- Technical Specificity: 10 (specific tech stack, libraries, file paths)
- Quality Standards: 9-10 (testing requirements, error handling)
- Input/Output Definition: 9-10 (data structure, API endpoint fully defined)

**Expected Overall Score**: 9.0-9.5 (auto-bypass, direct execution)

**Pass Criteria**: Overall score >= 9, no clarification questions, immediate execution

---

### Test 7: PAI Enhancement Tools Integration

**Objective**: Verify MCP tool invocations work correctly

**Test Scenarios**:

#### Scenario A: Research Task Enhancement
```
"Find the latest best practices for React Server Components in Next.js 14"
```

**Expected Tool Invocation**:
```typescript
mcp__claude-prompts__enhance_research_prompt({
  original_prompt: "Find the latest best practices...",
  domain: "web_development",
  depth: "comprehensive"
})
```

**Expected Enhancement**:
- Adds source credibility requirements (official Next.js docs, Vercel blog, RFC)
- Adds recency filter (2024-2025 only)
- Adds citation requirements
- Structures output (Executive Summary, Detailed Findings, Code Examples, References)

**Verification**:
```
In Claude Code session:
"Can you show me the enhanced prompt you're using for research?"
```

**Pass Criteria**: Enhanced prompt includes source requirements, recency filters, structured output

---

#### Scenario B: Coding Task Enhancement
```
"Write a function to validate email addresses"
```

**Expected Tool Invocation**:
```typescript
mcp__claude-prompts__enhance_coding_prompt({
  original_prompt: "Write a function to validate email addresses",
  language: "typescript", // inferred
  complexity: "simple"
})
```

**Expected Enhancement**:
- Adds TypeScript type annotations
- Adds error handling requirements
- Adds test coverage requirements
- Adds code comments and JSDoc
- Specifies edge cases (empty string, null, invalid formats)

**Pass Criteria**: Enhanced prompt includes types, tests, error handling, edge cases

---

#### Scenario C: Complex Task with Chain-of-Thought
```
"Design a caching strategy for a high-traffic API that needs to balance freshness and performance"
```

**Expected Tool Invocation**:
```typescript
mcp__claude-prompts__add_chain_of_thought({
  prompt: "Design a caching strategy...",
  complexity: "high",
  reasoning_depth: "deep"
})
```

**Expected Enhancement**:
- Adds "Let's think through this step-by-step:"
- Adds constraint analysis section
- Adds trade-off evaluation section
- Adds decision-making framework

**Pass Criteria**: Enhanced prompt includes structured reasoning steps

---

### Test 8: Execution Strategy Selection

**Objective**: Verify correct execution strategy is chosen based on prompt characteristics

**Test Matrix**:

| Clarity Score | Complexity | Scope | Expected Strategy | Test Prompt |
|--------------|-----------|-------|-------------------|-------------|
| 9 | Simple | Single file | Single Agent (Haiku) | "Add a console.log to line 42 of app.ts" |
| 8 | Moderate | Multiple files | Single Agent (Sonnet) | "Refactor UserService to use dependency injection" |
| 7 | Complex | Architecture | Sequential Multi-Agent | "Implement authentication with JWT tokens, refresh logic, and middleware" |
| 5 | Complex | Underspecified | Parallel Multi-Agent | "Build a dashboard for our app" (vague scope) |

#### Test Case: Single Agent (Haiku)
```
"Add error logging to the fetchUser function in src/api/users.ts"
```

**Expected**:
- Strategy: Single agent
- Model: Haiku (simple task)
- No planning phase

**Verification**: Check Task tool invocation has `model: "haiku"`

**Pass Criteria**: Uses single agent with Haiku model

---

#### Test Case: Sequential Multi-Agent
```
"Implement a feature flag system with:
1. Database schema for flags (Drizzle ORM)
2. API endpoints (GET, POST, PUT, DELETE)
3. React admin UI for managing flags
4. Hook for checking flags in components
5. Unit tests and E2E tests"
```

**Expected**:
- Strategy: Sequential multi-agent
- Step 1: Plan agent (analyzes and creates implementation plan)
- Step 2: Execution agent (implements based on plan)

**Verification**: Check for two Task tool invocations (Plan → Execute)

**Pass Criteria**: Uses Plan agent first, then execution agent

---

#### Test Case: Parallel Multi-Agent
```
"Our app is slow, make it faster"
```

**Expected**:
- Strategy: Parallel multi-agent (underspecified)
- Phase 1: Clarification (required)
- Phase 2a: Multiple Explore agents in parallel:
  - Explore agent 1: Frontend performance analysis
  - Explore agent 2: API/Backend performance analysis
  - Explore agent 3: Database query optimization
  - Explore agent 4: Bundle size and loading analysis
- Phase 2b: Consolidation agent synthesizes findings

**Verification**: Check for multiple parallel Task tool invocations (Explore agents)

**Pass Criteria**: Triggers clarification first, then spawns 3+ Explore agents in parallel

---

### Test 9: Prompt Archival System

**Objective**: Verify successful prompts are archived correctly

**Test Steps**:

1. **Execute a successful task**:
   ```
   "Create a simple Hello World component in React TypeScript"
   ```

2. **Wait for completion** (task should succeed)

3. **Check archival**:
   ```bash
   # Find latest archived prompt
   ls -lt ~/.claude/prompts/completed/ | head -5

   # Read archived file
   cat ~/.claude/prompts/completed/$(ls -t ~/.claude/prompts/completed/ | head -1)
   ```

4. **Verify JSON structure**:
   ```json
   {
     "timestamp": "2026-01-04T07:30:15.123Z",
     "original_prompt": "Create a simple Hello World component...",
     "enhanced_prompt": "Create a TypeScript React functional component...",
     "clarity_score": 7.5,
     "execution_strategy": "single_agent",
     "success": true,
     "model_used": "sonnet",
     "tools_invoked": ["enhance_coding_prompt", "optimize_for_claude"],
     "metadata": {
       "phase": "execution",
       "clarification_questions": 0
     }
   }
   ```

**Pass Criteria**:
- File exists in `completed/` directory
- JSON contains all required fields
- `success: true`
- Timestamp is recent (within last 5 minutes)

---

### Test 10: Auto-Cleanup Mechanism

**Objective**: Verify old prompts are auto-archived after configured days

**Setup**:
```bash
# Set short archive period for testing
export META_PROMPT_ARCHIVE_DAYS=0  # Archive immediately

# Create test prompt files with old timestamps
touch -t 202512010000 ~/.claude/prompts/completed/test-old-prompt.json
echo '{"test": true}' > ~/.claude/prompts/completed/test-old-prompt.json
```

**Trigger Cleanup**:
```bash
# End Claude Code session (triggers SessionEnd hook)
exit
```

**Verify**:
```bash
# Check if old file moved to archived/
test -f ~/.claude/prompts/archived/test-old-prompt.json && \
echo "✅ Auto-cleanup working" || \
echo "❌ Auto-cleanup failed"

# Check if file removed from completed/
test ! -f ~/.claude/prompts/completed/test-old-prompt.json && \
echo "✅ File moved" || \
echo "❌ File still in completed/"
```

**Pass Criteria**: Old file moved from `completed/` to `archived/`

**Cleanup**:
```bash
# Reset to default
export META_PROMPT_ARCHIVE_DAYS=30
rm ~/.claude/prompts/archived/test-old-prompt.json
```

---

## Integration Tests

**Time**: ~30 minutes
**Purpose**: Verify components work together correctly in realistic scenarios

### Test 11: End-to-End Vague → Clear → Execute Flow

**Scenario**: User starts with vague request, provides clarification, system executes

**Steps**:

1. **User submits vague prompt**:
   ```
   "I need a form for my website"
   ```

2. **Expected: Phase 1 Clarification Triggered**
   - System detects vague prompt
   - Calculates clarity score (expected: 2-3)
   - Generates clarification questions

3. **Expected Clarification Questions** (at least 3 of these):
   - "What type of data will this form collect?" (Input/Output Definition)
   - "What framework are you using for your website?" (Technical Specificity)
   - "What should happen when the form is submitted?" (Execution Strategy)
   - "Are there any validation requirements?" (Quality Standards)
   - "Who is the target audience/user of this form?" (Context)

4. **User provides clarification**:
   ```
   "It's a contact form for a Next.js 14 website using React Hook Form and Zod validation. Fields: name (required), email (required, valid email), message (required, min 10 chars). On submit, POST to /api/contact endpoint, show success toast, reset form. Use TailwindCSS for styling."
   ```

5. **Expected: Enhanced Prompt Created**
   - System combines original + clarification
   - Applies PAI enhancement (`enhance_coding_prompt`)
   - Applies `optimize_for_claude`
   - Calculates new clarity score (expected: 8-9)

6. **Expected: Phase 2 Execution**
   - Spawns fresh execution context (Task tool)
   - Uses single-agent strategy (clear + moderate complexity)
   - Creates component with all requirements

7. **Expected: Archival**
   - Saves enhanced prompt to `completed/`
   - Records success metadata

**Verification Points**:

```bash
# Check clarified prompt was saved
ls ~/.claude/prompts/clarified/ | grep -q "$(date +%Y-%m-%d)" && \
echo "✅ Clarified prompt saved"

# Check completed prompt was archived
ls ~/.claude/prompts/completed/ | grep -q "$(date +%Y-%m-%d)" && \
echo "✅ Execution archived"

# Verify JSON metadata
cat ~/.claude/prompts/completed/$(ls -t ~/.claude/prompts/completed/ | head -1) | \
jq '.clarity_score >= 8 and .success == true'
# Expected: true
```

**Pass Criteria**:
- ✅ Clarification questions asked (3+)
- ✅ Enhanced prompt created
- ✅ Execution successful
- ✅ Archived with metadata
- ✅ Final clarity score >= 8

---

### Test 12: Bypass Flow for Clear Prompts

**Scenario**: User submits specification-grade prompt, system bypasses clarification

**Steps**:

1. **User submits clear prompt**:
   ```
   "Create a Next.js 14 App Router API route at /api/users/[id]/route.ts that:
   - Handles GET requests to fetch a user by ID from PostgreSQL using Drizzle ORM
   - Returns 404 if user not found
   - Returns 500 if database error occurs
   - Uses Zod schema for response validation
   - Implements caching with Next.js unstable_cache (5-minute TTL)
   - Returns JSON with proper Content-Type header
   - Includes TypeScript types for params and return value
   - Add error logging with winston logger"
   ```

2. **Expected: Auto-Bypass Triggered**
   - Hook calculates clarity score (expected: 9-10)
   - Bypasses Phase 1 (no clarification questions)
   - Proceeds directly to Phase 2

3. **Expected: PAI Enhancement (Minimal)**
   - Applies `optimize_for_claude` only (score already high)
   - Does NOT ask clarification questions

4. **Expected: Direct Execution**
   - Spawns single execution agent
   - Creates API route with all requirements
   - No intermediate clarification step

**Verification Points**:

```bash
# Check NO clarified prompt saved (bypass occurred)
CLARIFIED_COUNT=$(ls ~/.claude/prompts/clarified/ 2>/dev/null | wc -l)
echo "Clarified prompts today: $CLARIFIED_COUNT (should be 0 for bypass)"

# Check execution was direct (metadata should show phase: "execution", no clarification)
cat ~/.claude/prompts/completed/$(ls -t ~/.claude/prompts/completed/ | head -1) | \
jq '.metadata.clarification_questions == 0'
# Expected: true
```

**Pass Criteria**:
- ✅ No clarification questions asked
- ✅ Direct execution
- ✅ No clarified prompt saved
- ✅ Metadata shows 0 clarification questions
- ✅ Clarity score >= 9

---

### Test 13: Complex Multi-Phase Task with Parallel Exploration

**Scenario**: Underspecified complex task requires parallel exploration

**Steps**:

1. **User submits underspecified request**:
   ```
   "Our authentication system has security issues, fix them"
   ```

2. **Expected: Phase 1 Clarification**
   - Detects vague prompt + high complexity
   - Asks clarification questions about:
     - Current authentication method
     - Known security issues
     - Tech stack
     - Compliance requirements

3. **User provides partial clarification**:
   ```
   "We use JWT tokens with Express.js and PostgreSQL. Not sure what the specific issues are, but users are complaining about session timeouts and security warnings."
   ```

4. **Expected: Parallel Exploration Strategy**
   - Spawns multiple Explore agents in parallel:
     - Agent 1: JWT implementation analysis
     - Agent 2: Token storage security review
     - Agent 3: Session management investigation
     - Agent 4: PostgreSQL security audit
   - Each agent explores independently

5. **Expected: Consolidation Phase**
   - Consolidation agent synthesizes findings
   - Creates unified implementation plan
   - Executes fixes based on consolidated knowledge

**Verification Points**:

```bash
# Check for parallel Task tool invocations in logs
grep "Task tool.*Explore" ~/.claude/logs/meta-prompting/debug.log | wc -l
# Expected: >= 3 (multiple parallel agents)

# Check execution strategy in metadata
cat ~/.claude/prompts/completed/$(ls -t ~/.claude/prompts/completed/ | head -1) | \
jq '.execution_strategy == "parallel_multi_agent"'
# Expected: true
```

**Pass Criteria**:
- ✅ Clarification phase triggered
- ✅ Parallel exploration (3+ agents)
- ✅ Consolidation phase executed
- ✅ Metadata shows `execution_strategy: "parallel_multi_agent"`

---

## Performance Tests

**Time**: ~15 minutes
**Purpose**: Verify system meets performance targets

### Test 14: Latency Benchmarks

**Objective**: Verify meta-prompting overhead is acceptable

**Targets** (from PACK_README.md):
- Vague prompt detection: < 100ms
- Clarity assessment (10 dimensions): < 500ms
- PAI enhancement (single tool): < 2s
- Total Phase 1 overhead: < 3s
- Fresh context spawn: < 1s

**Measurement Method**:

```bash
# Enable debug logging with timestamps
export META_PROMPT_DEBUG=true
export META_PROMPT_LOG_FILE=~/.claude/logs/meta-prompting/perf-test.log

# Submit test prompt
# In Claude Code session:
"Can you build something with React?"

# Analyze log timestamps
cat ~/.claude/logs/meta-prompting/perf-test.log | grep -E "(VAGUE_DETECT|CLARITY_SCORE|PAI_ENHANCE|SPAWN_AGENT)"
```

**Expected Log Output**:
```
2026-01-04T07:30:00.050Z [VAGUE_DETECT] Detected vague prompt (42ms)
2026-01-04T07:30:00.520Z [CLARITY_SCORE] 10-point assessment complete (470ms)
2026-01-04T07:30:02.100Z [PAI_ENHANCE] enhance_research_prompt complete (1580ms)
2026-01-04T07:30:03.050Z [SPAWN_AGENT] Fresh context spawned (950ms)
```

**Pass Criteria**:
- ✅ Vague detection: < 100ms
- ✅ Clarity assessment: < 500ms
- ✅ PAI enhancement: < 2s per tool
- ✅ Total Phase 1: < 3s
- ✅ Context spawn: < 1s

**Cleanup**:
```bash
export META_PROMPT_DEBUG=false
rm ~/.claude/logs/meta-prompting/perf-test.log
```

---

### Test 15: Memory Usage

**Objective**: Verify prompt archival doesn't cause memory leaks

**Setup**:
```bash
# Monitor memory before test
BEFORE=$(ps aux | grep claude-code | awk '{sum += $6} END {print sum}')
echo "Memory before: $BEFORE KB"
```

**Execute** 10 prompts with archival:
```bash
# In Claude Code session, run 10 simple tasks
for i in {1..10}; do
  echo "Task $i: Create a function that returns $i"
done
```

**Measure**:
```bash
# Monitor memory after test
AFTER=$(ps aux | grep claude-code | awk '{sum += $6} END {print sum}')
echo "Memory after: $AFTER KB"

# Calculate increase
INCREASE=$((AFTER - BEFORE))
echo "Memory increase: $INCREASE KB"
```

**Pass Criteria**:
- ✅ Memory increase < 50MB (51,200 KB) for 10 prompts
- ✅ No memory leaks (stable after 10 iterations)

---

## Edge Case Tests

**Time**: ~20 minutes
**Purpose**: Verify system handles edge cases gracefully

### Test 16: Empty Prompt

**Input**: `` (empty string)

**Expected Behavior**:
- Hook rejects empty prompt
- Returns error: "Please provide a prompt"
- Does NOT trigger meta-prompting

**Pass Criteria**: Error returned, no execution

---

### Test 17: Extremely Long Prompt (> 2000 words)

**Input**: (Generate 2000+ word detailed specification)

**Expected Behavior**:
- Clarity score calculated (likely >= 9)
- Auto-bypasses clarification (detailed = clear)
- Executes directly with single agent

**Pass Criteria**: Bypass occurs, execution successful

---

### Test 18: Prompt with [DIRECT] Flag

**Input**:
```
[DIRECT] Can you help me with something?
```

**Expected Behavior**:
- Bypass flag detected
- Clarification phase skipped (even though prompt is vague)
- Executes directly

**Pass Criteria**: No clarification questions, direct execution

---

### Test 19: Prompt with Technical Jargon but Vague Objective

**Input**:
```
"Use React Query, Zod, TailwindCSS, and Drizzle ORM to build it"
```

**Expected Behavior**:
- High technical specificity score (8-9)
- Low objective clarity score (1-2) - "build it" is undefined
- Overall score: 4-5 (triggers clarification)
- Clarification focuses on objective and scope

**Pass Criteria**: Clarification triggered despite high technical score

---

### Test 20: Rapid-Fire Prompts (Interruption Test)

**Scenario**: User submits new prompt while clarification is in progress

**Steps**:
1. Submit vague prompt: "Build a dashboard"
2. While Claude is generating clarification questions, submit new prompt: "[DIRECT] Just create a simple chart component"

**Expected Behavior**:
- First prompt clarification is abandoned
- Second prompt executes immediately (DIRECT flag)

**Pass Criteria**: Second prompt takes priority, first is abandoned

---

## Regression Tests

**Time**: ~10 minutes
**Purpose**: Verify known issues don't reoccur

### Test 21: Clarity Score Edge Cases

**Issue**: Weighted scoring caused division by zero when all weights were 0

**Fix**: Fallback to unweighted average if total weight = 0

**Test**:
```typescript
// Manually calculate score with zero weights (edge case)
const dimensions = [
  { dimension: "objective", score: 5, weight: 0 },
  { dimension: "scope", score: 7, weight: 0 }
];

// Should NOT crash, should return unweighted average (6.0)
```

**Pass Criteria**: No error, returns valid score

---

### Test 22: Hook Execution on Non-Prompt Commands

**Issue**: UserPromptSubmit hook triggered on system commands like `/mcp`, causing errors

**Fix**: Hook checks if input starts with `/` and skips processing

**Test**:
```bash
# In Claude Code session
/mcp
/help
/tasks
```

**Expected Behavior**: Commands execute normally, hook does NOT trigger

**Pass Criteria**: No meta-prompting activation for system commands

---

### Test 23: PAI Tool Timeout Handling

**Issue**: If PAI enhancement tool (MCP) times out, execution hangs indefinitely

**Fix**: 5-second timeout on PAI tool invocations, fallback to unenhanced prompt

**Test**:
```bash
# Simulate MCP timeout (kill claude-prompts server during enhancement)
pkill -f claude-prompts-mcp

# Submit prompt that would use enhancement
# In Claude Code session:
"Research the latest React patterns"
```

**Expected Behavior**:
- PAI enhancement times out after 5s
- Fallback: Executes with original prompt (no enhancement)
- Warning logged: "PAI enhancement timeout, proceeding with original prompt"

**Pass Criteria**: Execution continues despite MCP timeout

**Cleanup**:
```bash
# Restart Claude Code to reconnect MCP
exit
claude-code
```

---

## Automated Test Suite

**Script**: `~/.claude/skills/meta-prompting/tests/run-all-tests.sh`

```bash
#!/bin/bash
# Meta-Prompting Automated Test Suite

set -e  # Exit on first failure

echo "🧪 Meta-Prompting Test Suite"
echo "=============================="

TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Directory Structure
echo -n "Test 1: Directory Structure... "
if test -d ~/.claude/skills/meta-prompting && \
   test -d ~/.claude/prompts/vague && \
   test -d ~/.claude/prompts/completed; then
  echo "✅ PASS"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL"
  ((TESTS_FAILED++))
fi

# Test 2: Hook Registration
echo -n "Test 2: Hook Registration... "
if grep -q "auto-meta-prompt-clarification.ts" ~/.claude/settings.json && \
   grep -q "auto-prompt-archival.ts" ~/.claude/settings.json; then
  echo "✅ PASS"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL"
  ((TESTS_FAILED++))
fi

# Test 3: Required Files
echo -n "Test 3: Required Files... "
if test -f ~/.claude/skills/meta-prompting/SKILL.md && \
   test -f ~/.claude/skills/meta-prompting/workflows/clarification.md && \
   test -f ~/.claude/skills/meta-prompting/workflows/execution.md; then
  echo "✅ PASS"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL"
  ((TESTS_FAILED++))
fi

# Test 4: Environment Variables (optional)
echo -n "Test 4: Environment Variables... "
if [[ -n "$PAI_META_PROMPT_ENABLED" ]]; then
  echo "✅ PASS (configured)"
  ((TESTS_PASSED++))
else
  echo "⚠️  SKIP (using defaults)"
fi

# Test 5: Storage Permissions
echo -n "Test 5: Storage Permissions... "
if [[ -w ~/.claude/prompts/completed ]]; then
  echo "✅ PASS"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL (not writable)"
  ((TESTS_FAILED++))
fi

# Summary
echo "=============================="
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"

if [[ $TESTS_FAILED -eq 0 ]]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ Some tests failed"
  exit 1
fi
```

**Run Tests**:

```bash
chmod +x ~/.claude/skills/meta-prompting/tests/run-all-tests.sh
~/.claude/skills/meta-prompting/tests/run-all-tests.sh
```

**Expected Output**:
```
🧪 Meta-Prompting Test Suite
==============================
Test 1: Directory Structure... ✅ PASS
Test 2: Hook Registration... ✅ PASS
Test 3: Required Files... ✅ PASS
Test 4: Environment Variables... ⚠️  SKIP (using defaults)
Test 5: Storage Permissions... ✅ PASS
==============================
Tests Passed: 4
Tests Failed: 0
✅ All tests passed!
```

---

## Test Result Tracking

**Record Test Results** in `TEST_RESULTS.md`:

```bash
# Append test run results
cat >> ~/.claude/skills/meta-prompting/TEST_RESULTS.md <<EOF

---

## Test Run: $(date +%Y-%m-%d)

**Tester**: [Your Name]
**Environment**: Claude Code v2.0, $(uname -s)

### Quick Verification (5 tests)
- ✅ Directory Structure
- ✅ Hook Registration
- ✅ MCP Connection
- ✅ Vague Prompt Detection
- ✅ Auto-Bypass

### Component Tests (5 tests)
- ✅ 10-Point Clarity Assessment
- ✅ PAI Enhancement Tools
- ✅ Execution Strategy Selection
- ✅ Prompt Archival
- ✅ Auto-Cleanup

### Integration Tests (3 tests)
- ✅ End-to-End Vague Flow
- ✅ Bypass Flow
- ✅ Parallel Exploration

### Performance Tests (2 tests)
- ✅ Latency Benchmarks (all within targets)
- ✅ Memory Usage (< 50MB increase)

### Edge Case Tests (5 tests)
- ✅ Empty Prompt
- ✅ Extremely Long Prompt
- ✅ [DIRECT] Flag
- ✅ Technical Jargon + Vague Objective
- ✅ Rapid-Fire Prompts

### Regression Tests (3 tests)
- ✅ Clarity Score Edge Cases
- ✅ System Commands
- ✅ PAI Tool Timeout

**Total**: 23/23 tests passed (100%)
**Status**: ✅ READY FOR PRODUCTION

EOF
```

---

## Troubleshooting Failed Tests

### If Test 3 (MCP Connection) Fails

**Symptoms**: `/mcp` shows claude-prompts as disconnected

**Debug Steps**:
```bash
# Test MCP server manually
npx -y @minipuft/claude-prompts-mcp --help

# Check settings.json
cat ~/.claude/settings.json | jq '.mcpServers["claude-prompts"]'

# Restart Claude Code
exit
claude-code
```

**Solution**: See PACK_INSTALL.md "Troubleshooting > Issue 2"

---

### If Test 4 (Vague Prompt Detection) Fails

**Symptoms**: Vague prompt doesn't trigger clarification

**Debug Steps**:
```bash
# Enable debug logging
export META_PROMPT_DEBUG=true
export META_PROMPT_LOG_FILE=~/.claude/logs/meta-prompting/debug.log

# Submit test prompt
# In Claude Code: "Can you help me build something?"

# Check logs
cat ~/.claude/logs/meta-prompting/debug.log
```

**Common Causes**:
- Hook not registered in settings.json
- Clarity threshold too low (`PAI_META_PROMPT_MIN_CLARITY`)
- Prompt contains bypass keywords

**Solution**: See PACK_INSTALL.md "Troubleshooting > Issue 1"

---

### If Test 9 (Prompt Archival) Fails

**Symptoms**: No files in `~/.claude/prompts/completed/` after successful task

**Debug Steps**:
```bash
# Check hook is registered
grep "auto-prompt-archival.ts" ~/.claude/settings.json

# Check directory permissions
ls -ld ~/.claude/prompts/completed/

# Check environment variable
echo $PAI_META_PROMPT_ARCHIVAL
```

**Solution**: See PACK_INSTALL.md "Troubleshooting > Issue 3"

---

## Verification Checklist

Use this checklist after installation:

- [ ] **Quick Verification** (5/5 tests passed)
  - [ ] Directory structure exists
  - [ ] Hooks registered
  - [ ] MCP server connected
  - [ ] Vague prompt detection works
  - [ ] Auto-bypass works

- [ ] **Component Tests** (5/5 tests passed)
  - [ ] Clarity assessment accurate
  - [ ] PAI enhancement tools work
  - [ ] Execution strategies correct
  - [ ] Prompt archival works
  - [ ] Auto-cleanup works

- [ ] **Integration Tests** (3/3 tests passed)
  - [ ] End-to-end vague flow works
  - [ ] Bypass flow works
  - [ ] Parallel exploration works

- [ ] **Performance Tests** (2/2 tests passed)
  - [ ] Latency within targets
  - [ ] Memory usage acceptable

- [ ] **Edge Cases** (5/5 tests passed)
  - [ ] Empty prompts handled
  - [ ] Long prompts handled
  - [ ] Bypass flags work
  - [ ] Mixed clarity handled
  - [ ] Interruptions handled

- [ ] **Regression Tests** (3/3 tests passed)
  - [ ] Clarity edge cases fixed
  - [ ] System commands work
  - [ ] Timeouts handled

**Total**: 23 verification points

**Status**: [ ] READY FOR PRODUCTION

---

## Next Steps

After verification:

1. **Review TEST_RESULTS.md** for benchmark data and known issues
2. **Customize templates** in `~/.claude/prompts/templates/` for your domain
3. **Tune thresholds** (`PAI_META_PROMPT_MIN_CLARITY`) based on your usage patterns
4. **Monitor performance** using the production monitoring script from PACK_INSTALL.md
5. **Provide feedback** if tests fail or unexpected behavior occurs

---

**Verification Complete!** 🎉

If all tests pass, meta-prompting is ready for production use.

For production deployment guidance, see PACK_INSTALL.md > Production Deployment section.
