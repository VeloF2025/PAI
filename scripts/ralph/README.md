# Ralph - Autonomous Coding Loop for PAI

**Version**: 1.0 (Claude Code CLI Edition)
**Adapted from**: https://github.com/snarktank/ralph

Ralph is an autonomous coding loop that executes user stories from a Product Requirements Document (PRD) with zero human intervention, full quality validation, and intelligent context management.

---

## 🚀 Quick Start

```bash
# 1. Navigate to your project
cd /path/to/your/project

# 2. Create prd.json with your user stories (see PRD Format below)

# 3. Run Ralph
bash "$HOME/.claude/../../Jarvis/AI Workspace/Personal_AI_Infrastructure/scripts/ralph/ralph.sh" .

# 4. Watch progress
tail -f progress.txt
```

---

## 📋 What Ralph Does

Ralph automates the entire development cycle:

1. **Reads PRD** - Loads user stories from `prd.json`
2. **Analyzes Complexity** - Decides session vs fresh agent per story
3. **Implements Stories** - Uses Claude Code CLI to write code
4. **Validates Quality** - Runs all PAI quality gates
5. **Captures Context** - Builds handover for next iteration
6. **Updates Progress** - Generates human-readable `progress.txt`
7. **Repeats** - Continues until all stories complete

**Result**: Fully implemented, tested, validated features without manual intervention.

---

## 🎯 Key Features

### ✅ Fully Autonomous Operation
- **No prompts** during execution (set it and forget it)
- **Zero human intervention** required
- **Automatic retries** on validation failures
- **Context preservation** across iterations

### 🧠 Adaptive Context Management
- **Small stories** (complexity < 5): Session continuity
- **Large stories** (complexity ≥ 5): Fresh Task agent
- **Intelligent scoring**: Analyzes steps, components, refactoring

### 🛡️ Comprehensive Quality Validation
- ✅ TypeScript compilation (zero errors)
- ✅ ESLint (zero warnings)
- ✅ Zero Tolerance (no console.log, proper error handling)
- ✅ DGTS (no gaming patterns)
- ✅ Automated tests
- ✅ Chrome extension (for UI changes)

### 📊 Progress Tracking
- **progress.txt**: Human-readable status with emoji indicators
- **.ralph/context.json**: Accumulated decisions and patterns
- **Per-story logs**: `.ralph/logs/story-*.log`

---

## 📄 PRD JSON Format

Create `prd.json` in your project root:

```json
{
  "project_name": "Your Project Name",
  "description": "Brief project description",
  "user_stories": [
    {
      "id": "story-001",
      "title": "Feature Title",
      "description": "Detailed description of what to implement",
      "acceptance_criteria": [
        "Criterion 1 - must be verifiable",
        "Criterion 2 - prefer automated tests",
        "Criterion 3 - specific and measurable"
      ],
      "priority": "high",
      "estimated_complexity": 3,
      "components_affected": ["ui", "api", "database"],
      "status": "pending"
    }
  ],
  "technical_constraints": [
    "Must use Next.js 14 with App Router",
    "Must follow existing code patterns",
    "Must use TypeScript strict mode"
  ],
  "quality_gates": [
    "Zero TypeScript errors",
    "No console.log statements",
    "All tests passing"
  ]
}
```

### Story Fields Explained

- **id**: Unique identifier (e.g., "story-001")
- **title**: Short, descriptive name
- **description**: Detailed implementation requirements
- **acceptance_criteria**: List of verifiable success criteria
- **priority**: "high", "medium", "low" (for future prioritization)
- **estimated_complexity**: Number 1-10 (optional, Ralph auto-calculates if omitted)
- **components_affected**: Array of component types (see Component Types below)
- **status**: "pending", "in_progress", "completed" (Ralph manages this)

### Component Types

| Type | Description | Complexity Impact |
|------|-------------|-------------------|
| `utils` | Utility functions | +1 |
| `ui` | UI components | +2 |
| `api` | API endpoints | +2 |
| `database` | Schema changes | +3 |
| `auth` | Authentication | +3 |
| `tests` | Test suites | +1 |
| `docs` | Documentation | +0 |

---

## 🔧 Complexity Scoring Algorithm

Ralph automatically determines whether to use session continuity or spawn a fresh Task agent:

```bash
score = 0

# Step keywords in description
score += count("first", "then", "after", "next", "finally", "once", "when", "before")

# Acceptance criteria count
score += acceptance_criteria.length

# Component complexity
if "ui" in components: score += 2
if "api" in components: score += 2
if "database" in components: score += 3
if "auth" in components: score += 3

# Refactoring keyword
if "refactor" in description: score += 5

# Multiple components
if len(components) > 2: score += 3

# Decision
if score < 5: mode = "session"
else: mode = "task"
```

### Examples

**Session Mode (Score: 3)**
```json
{
  "title": "Add loading spinner to button",
  "description": "Show spinner when button is clicked",
  "acceptance_criteria": ["Spinner shows on click", "Spinner hides on complete"],
  "components_affected": ["ui"]
}
```
→ Score: 2 (acceptance criteria) + 1 (step keyword: "when") = **3** → **Session**

**Task Mode (Score: 7)**
```json
{
  "title": "Implement user authentication",
  "description": "Add login/logout with JWT tokens. First create auth service, then add API routes, finally add UI components",
  "acceptance_criteria": [
    "User can register",
    "User can login",
    "JWT stored securely",
    "User can logout"
  ],
  "components_affected": ["auth", "api", "ui"]
}
```
→ Score: 4 (acceptance criteria) + 3 (step keywords: "first", "then", "finally") + 3 (auth) + 2 (api) + 2 (ui) - 3 (multiple components) = **7** → **Task Agent**

---

## 🔍 Validation Gates

Ralph runs validation gates **sequentially** after each story:

### 1️⃣ TypeScript Compilation
```bash
npx tsc --noEmit
```
**Blocks on**: Any TypeScript errors

### 2️⃣ ESLint
```bash
npx eslint . --max-warnings 0
```
**Blocks on**: Any linting errors or warnings

### 3️⃣ Zero Tolerance
```bash
python ~/.claude/scripts/validators/zero-tolerance-validator.py .
```
**Blocks on**:
- console.log statements in production code
- Empty catch blocks (no error handling)
- Missing error handling

### 4️⃣ DGTS Gaming Detection
```bash
python ~/.claude/scripts/validators/dgts-validator.py . --threshold 0.5
```
**Blocks on**: Gaming patterns (shortcuts, hardcoded values, fake implementations)

### 5️⃣ Automated Tests
```bash
npm test
```
**Blocks on**: Failing tests

### 6️⃣ Chrome Extension Visual Validation
**Triggers when**: UI components modified (detected via `git diff`)
**Requires**: Manual validation via `claude --chrome`
**Blocks on**: User does not confirm "Looks good"

**Note**: In autonomous mode, Gate 6 is skipped. Run `claude --chrome` separately for UI validation.

---

## 📊 Progress Tracking

### progress.txt Format

```
# Ralph Test Project - Progress

Generated: 2026-01-10 14:32:05

---

## Stories

[✓] Story: Create Hello World Utility
   ID: story-001
   Description: Create a simple TypeScript utility...
   Status: completed

[⧗] Story: Add User Greeting Component
   ID: story-002
   Description: Create a React component...
   Status: in_progress

[☐] Story: Create Greeting API Endpoint
   ID: story-003
   Description: Create Next.js API route...
   Status: pending

---

## Summary

Total stories: 3
Completed: 1
In progress: 1
Pending: 1
Progress: 33%
```

### Context Handover (.ralph/context.json)

```json
{
  "last_story_id": "story-002",
  "files_changed": [
    "src/utils/greeting.ts",
    "src/components/UserGreeting.tsx"
  ],
  "last_commit": "feat: Add user greeting component",
  "key_decisions": [
    "Using React Query for data fetching",
    "All components use TypeScript strict mode",
    "TailwindCSS for styling"
  ],
  "patterns_established": [
    "API routes follow /api/v1/[resource] pattern",
    "Components export named exports, not default"
  ],
  "blockers": []
}
```

**Usage**: Passed to next story's prompt to maintain architectural consistency

---

## 🛠️ Directory Structure

```
project-root/
├── prd.json                          # INPUT: User stories
├── progress.txt                      # OUTPUT: Human-readable progress
├── .ralph/
│   ├── context.json                  # Context handover
│   └── logs/
│       ├── story-001.log             # Per-story execution logs
│       └── story-002.log
├── src/                              # Your application code
│   ├── utils/
│   ├── components/
│   └── app/
└── tests/                            # Your tests
```

---

## 🎮 Usage Examples

### Example 1: Simple Feature Addition

```bash
# Create PRD with single story
cat > prd.json <<EOF
{
  "project_name": "Todo App",
  "user_stories": [{
    "id": "story-001",
    "title": "Add delete button",
    "description": "Add delete button to each todo item",
    "acceptance_criteria": [
      "Button appears next to todo text",
      "Clicking button deletes the todo",
      "Deletion confirmed with toast notification"
    ],
    "components_affected": ["ui"],
    "status": "pending"
  }]
}
EOF

# Run Ralph
bash "$PAI_DIR/scripts/ralph/ralph.sh" .

# Expected: Story implemented in session mode, validated, marked complete
```

### Example 2: Multi-Story Feature

```bash
# Create PRD with dependent stories
cat > prd.json <<EOF
{
  "project_name": "Blog Platform",
  "user_stories": [
    {
      "id": "story-001",
      "title": "Create Post Model",
      "description": "Add database schema for blog posts",
      "components_affected": ["database"],
      "status": "pending"
    },
    {
      "id": "story-002",
      "title": "Create Post API",
      "description": "Add CRUD endpoints for posts",
      "components_affected": ["api", "database"],
      "status": "pending"
    },
    {
      "id": "story-003",
      "title": "Create Post UI",
      "description": "Add UI for creating/editing posts",
      "components_affected": ["ui", "api"],
      "status": "pending"
    }
  ]
}
EOF

# Run Ralph
bash "$PAI_DIR/scripts/ralph/ralph.sh" .

# Expected:
# - Story 1: Task agent (database = high complexity)
# - Story 2: Task agent (database + api = high complexity)
# - Story 3: Task agent (ui + api = medium-high complexity)
# - Context accumulates: Story 2 knows about schema from Story 1
# - Context accumulates: Story 3 knows about API from Story 2
```

### Example 3: Using Test PRD

```bash
# Use provided test PRD
cd "$PAI_DIR/.temp"
mkdir my-test-project
cd my-test-project

# Copy test PRD
cp "$PAI_DIR/scripts/ralph/test-prd.json" prd.json

# Initialize git (required for Ralph)
git init
git add .
git commit -m "Initial commit"

# Create minimal package.json
cat > package.json <<EOF
{
  "name": "test-project",
  "scripts": {
    "test": "echo 'No tests' && exit 0"
  }
}
EOF

# Run Ralph
bash "$PAI_DIR/scripts/ralph/ralph.sh" .

# Watch progress
tail -f progress.txt
```

---

## 🐛 Troubleshooting

### Ralph doesn't start

**Check**:
1. `prd.json` exists in project root
2. `prd.json` is valid JSON
3. At least one story has `status: "pending"`
4. Git repository initialized (`git init`)

**Debug**:
```bash
# Validate PRD structure
jq . prd.json

# Check Ralph can read PRD
jq '.user_stories[] | select(.status == "pending")' prd.json
```

### Validation gates keep failing

**Common issues**:

**TypeScript errors**:
```bash
# See errors
npx tsc --noEmit

# Fix or add to tsconfig.json:
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

**ESLint errors**:
```bash
# See errors
npx eslint .

# Fix or disable rule in .eslintrc:
{
  "rules": {
    "no-unused-vars": "off"
  }
}
```

**Zero Tolerance failures**:
- Remove all `console.log` statements
- Add proper error handling to catch blocks
- Use `logger.error()` instead of `console.log` for debugging

**DGTS failures**:
- Remove hardcoded values
- Implement real logic instead of placeholders
- No shortcuts or fake implementations

### Story stuck in "in_progress"

**Cause**: Story implementation failed but Ralph marked it in_progress

**Fix**:
```bash
# Manually reset story status
jq '.user_stories[] |= if .id == "story-XXX" then .status = "pending" else . end' prd.json > prd.tmp.json && mv prd.tmp.json prd.json

# Re-run Ralph
bash "$PAI_DIR/scripts/ralph/ralph.sh" .
```

### Context window overflow

**Symptoms**: Claude CLI returns "context too large" errors

**Fix**: Increase complexity threshold to force Task agent mode earlier

```bash
# Edit complexity-detector.sh
# Change line 69:
if [ $SCORE -lt 3 ]; then  # More aggressive Task agent spawning
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# Maximum iterations before Ralph stops
export RALPH_MAX_ITERATIONS=100

# Validation timeout per story (seconds)
export RALPH_VALIDATION_TIMEOUT=600

# Enable verbose logging
export RALPH_VERBOSE=true
```

### Customizing Validation Gates

Edit `scripts/ralph/validation-runner.sh`:

```bash
# Disable specific gate
# Comment out the gate section

# Add custom gate
run_gate "Custom Check" "7️⃣ " "npm run custom-check" || true
```

### Adjusting Complexity Scoring

Edit `scripts/ralph/complexity-detector.sh`:

```bash
# Make UI less complex
if echo "$COMPONENTS" | jq -e 'contains(["ui"])' >/dev/null 2>&1; then
    SCORE=$((SCORE + 1))  # Changed from +2
fi

# Make database more complex
if echo "$COMPONENTS" | jq -e 'contains(["database"])' >/dev/null 2>&1; then
    SCORE=$((SCORE + 5))  # Changed from +3
fi
```

---

## 📚 Integration with PAI Systems

### Stop-Hook Integration
Ralph automatically triggers PAI's stop-hook after each story:
- Captures session summary
- Extracts key decisions
- Updates context.json
- Sends voice notification (if configured)

### Memory System
Ralph context integrates with PAI memory:
- Loads project memory at start
- Updates memories after completion
- Maintains cross-session context

### Chrome Extension
For UI stories, Ralph:
1. Detects UI changes via `git diff`
2. Launches `claude --chrome` (in manual mode)
3. Waits for user confirmation
4. Only marks story complete after "Looks good"

### Agent System
Ralph uses `.agents/AGENTS.md` to determine:
- Which agent type to spawn (engineer, designer, architect)
- Which validator to use (pentester, engineer)
- Which tools to provide (Context7, Memory, Playwright)

---

## 🔐 Security & Safety

### Automatic Safety Protocols
- ✅ All code validated by DGTS (no gaming)
- ✅ Zero Tolerance enforced (no console.log, proper error handling)
- ✅ TypeScript strict mode required
- ✅ Git commits after each story (rollback possible)

### Manual Review Points
Ralph runs autonomously BUT you should review:
1. **Before starting**: Review PRD, ensure stories are clear
2. **After completion**: Review `git log` for all changes
3. **Before deployment**: Run `claude --chrome` for UI validation

### Rollback Strategy
If Ralph produces bad code:
```bash
# See what changed
git log --oneline

# Rollback to before specific story
git reset --hard <commit-before-story>

# Fix PRD, re-run Ralph
bash "$PAI_DIR/scripts/ralph/ralph.sh" .
```

---

## 🚀 Advanced Usage

### Running Specific Stories Only

```bash
# Temporarily mark other stories completed
jq '.user_stories[] |= if .id != "story-003" then .status = "completed" else . end' prd.json > prd.tmp.json && mv prd.tmp.json prd.json

# Run Ralph (will only execute story-003)
bash "$PAI_DIR/scripts/ralph/ralph.sh" .

# Reset statuses
git checkout prd.json
```

### Parallel Story Execution (Future)

**Not yet implemented**, but planned:

```bash
# Run multiple stories in parallel
bash "$PAI_DIR/scripts/ralph/ralph.sh" . --parallel=3

# Will spawn 3 Task agents simultaneously
```

### Integration with CI/CD

```yaml
# .github/workflows/ralph.yml
name: Ralph Autonomous Development
on:
  push:
    paths:
      - 'prd.json'

jobs:
  ralph:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Ralph
        run: bash scripts/ralph/ralph.sh .
      - name: Create PR
        run: gh pr create --title "Ralph Implementation" --body "$(cat progress.txt)"
```

---

## 📖 References

- **Original Ralph**: https://github.com/snarktank/ralph
- **Claude Code CLI**: https://docs.anthropic.com/claude-code
- **PAI Documentation**: `~/.claude/README.md`
- **Agent System**: `.agents/AGENTS.md`
- **Quality Gates**: `~/.claude/protocols/`

---

## 🆘 Getting Help

**Documentation**:
- This README
- Implementation plan: `~/.claude/plans/reflective-plotting-shannon.md`
- Agent mapping: `.agents/AGENTS.md`

**Debug Logs**:
- Main log: `.ralph/logs/ralph-main.log`
- Per-story logs: `.ralph/logs/story-*.log`
- Validation output: Inline in story logs

**Common Issues**:
1. PRD format errors → Validate with `jq . prd.json`
2. Validation failures → Check `.ralph/logs/story-*.log`
3. Context overflow → Lower complexity threshold
4. Git errors → Ensure `git init` was run

---

**Version**: 1.0
**Last Updated**: 2026-01-10
**Maintained By**: PAI Ralph System
**License**: Same as PAI (Personal AI Infrastructure)
