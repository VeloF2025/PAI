# Quality Gates Workflow

**Protocol**: Zero Tolerance Quality Gates
**Purpose**: 3-phase validation checkpoints for PAI agents
**Performance**: <1s per gate execution

---

## Overview

Quality Gates enforce zero tolerance validation at 3 critical checkpoints in the development lifecycle:

1. **Pre-Development Gate**: Before writing any code
2. **Post-Implementation Gate**: After code is written
3. **Pre-Commit Gate**: Before committing to version control

Each gate has specific checks that MUST pass before proceeding.

---

## 3-Phase Gate System

### Phase 1: Pre-Development Gate

**When to Execute**: Before ANY code implementation starts

**Purpose**: Ensure development is properly planned and ready to begin

**Checks**:

#### 1. Requirements Parsed (CRITICAL)
- Requirements extracted from PRD/PRP/ADR documentation
- Minimum 1 requirement identified
- Each requirement is testable and specific

**Example**:
```python
requirements = [
    "User can login with email and password",
    "System validates email format",
    "Failed login shows error message"
]
```

#### 2. Test Specifications Generated (CRITICAL)
- Test specs created from requirements (TDD-first)
- Each requirement has corresponding test spec
- Acceptance criteria clearly defined

**Example**:
```python
test_specs = [
    {
        "requirement": "User can login with email and password",
        "test_cases": [
            "test_valid_login_succeeds",
            "test_invalid_password_fails",
            "test_missing_email_fails"
        ],
        "acceptance_criteria": "Login returns auth token on success"
    }
]
```

#### 3. TDD Required (ENFORCED)
- Tests MUST be written before implementation
- No implementation without test specifications
- Zero tolerance for post-hoc test writing

#### 4. Agent Not Blocked
- Agent has no active DGTS blocks
- Agent's gaming score < threshold
- Agent allowed to proceed

#### 5. DGTS Baseline Clean
- Agent has clean gaming history (last 7 days)
- No recent gaming violations
- Gaming score trending stable or improving

**Result**: `CAN_PROCEED` or `BLOCKED`

---

### Phase 2: Post-Implementation Gate

**When to Execute**: After code is written, before marking task complete

**Purpose**: Validate implementation quality and completeness

**Checks**:

#### 1. Tests Mandatory (CRITICAL)
- Test results provided (cannot be skipped)
- All test specs from Pre-Dev gate have corresponding tests
- Test coverage report available

#### 2. Tests Pass (CRITICAL)
- All tests pass (0 failures)
- No skipped tests
- No flaky tests

**Example**:
```python
test_results = {
    "total": 15,
    "passed": 15,
    "failed": 0,
    "skipped": 0,
    "duration_ms": 1250
}
```

#### 3. Test Coverage (CRITICAL)
- Overall coverage >90%
- Critical modules: 100% coverage
- No untested code paths

**Example**:
```python
coverage_report = {
    "overall": 94.5,
    "critical_modules": {
        "auth.py": 100.0,
        "validation.py": 100.0,
        "api.py": 92.3
    }
}
```

#### 4. DGTS Validation (CRITICAL)
- All code files scanned for gaming patterns
- Gaming score < threshold (0.3)
- No CRITICAL or MAJOR violations

**Example**:
```python
dgts_result = {
    "total_gaming_score": 0.05,
    "is_gaming": False,
    "violations": [
        {
            "severity": "WARNING",
            "pattern_id": "TODO_001",
            "description": "TODO comment found",
            "line_number": 45
        }
    ]
}
```

#### 5. NLNH Confidence Requirements (CRITICAL)
- Confidence calculation performed
- Composite confidence >= agent's threshold
- All 4 factors calculated

**Example**:
```python
confidence_result = {
    "composite_confidence": 0.875,
    "threshold": 0.80,
    "threshold_met": True,
    "factors": {
        "knowledge_base_score": 0.92,
        "code_validation_score": 0.90,
        "response_certainty_score": 0.75,
        "agent_history_score": 0.88
    }
}
```

**Result**: `PASS` or `FAIL`

---

### Phase 3: Pre-Commit Gate

**When to Execute**: Before committing code to version control

**Purpose**: Final validation before code enters repository

**Checks**:

#### 1. Final DGTS Check (CRITICAL)
- Re-scan all changed files
- Ensure no gaming patterns introduced during final edits
- Gaming score must be clean

#### 2. Console.log Statements (CRITICAL - ZERO TOLERANCE)
- Scan for `console.log`, `console.debug`, `console.warn`
- Scan for `print()` statements (Python)
- All debugging statements removed

**Blocked Examples**:
```javascript
console.log("Debug info");  // ❌ BLOCKED
console.debug(data);        // ❌ BLOCKED
print(f"Value: {x}")       // ❌ BLOCKED (Python)
```

**Allowed Examples**:
```javascript
logger.info("User action", data);  // ✅ ALLOWED
log.debug("Processing", context);  // ✅ ALLOWED
```

#### 3. Documentation Updated
- Code changes have corresponding documentation
- README updated if public API changed
- Inline comments for complex logic

#### 4. No Commented Code
- No commented-out code blocks
- No `# TODO:` or `// FIXME:` without tracking
- Clean, production-ready code

#### 5. Type Safety (TypeScript/Python)
- Zero TypeScript errors
- Zero mypy errors (Python)
- No `any` types (TypeScript)
- No `# type: ignore` (Python)

**Result**: `PASS` or `FAIL`

---

## Usage

### Command Line

#### Pre-Development Gate
```bash
python ~/.claude/validation/quality_gates/gate_executor.py \
  pre-dev \
  --agent-name planner-1 \
  --agent-type planner \
  --requirements requirements.json \
  --test-specs test-specs.json
```

#### Post-Implementation Gate
```bash
python ~/.claude/validation/quality_gates/gate_executor.py \
  post-impl \
  --agent-name patcher-1 \
  --agent-type patcher \
  --test-results test-results.json \
  --coverage coverage.json \
  --code-files "src/**/*.py"
```

#### Pre-Commit Gate
```bash
python ~/.claude/validation/quality_gates/gate_executor.py \
  pre-commit \
  --changed-files "$(git diff --name-only)"
```

---

### Python API

```python
from claude.validation.quality_gates import QualityGatesExecutor, GatePhase

executor = QualityGatesExecutor()

# Pre-Development Gate
result = executor.execute_pre_development_gate(
    agent_name="planner-1",
    agent_type="planner",
    task_id="task-123",
    requirements=[
        "User can login with email and password",
        "System validates email format"
    ],
    test_specs=[
        {
            "requirement": "User can login with email and password",
            "test_cases": ["test_valid_login", "test_invalid_password"]
        }
    ]
)

if not result.can_proceed:
    print(f"🚫 Gate blocked: {result.summary}")
    for check in result.checks:
        if check.status == "FAILED":
            print(f"  - {check.rule}: {check.message}")
    # Cannot start development
else:
    print("✅ Pre-Dev gate passed - proceed with implementation")

# Post-Implementation Gate
result = executor.execute_post_implementation_gate(
    agent_name="patcher-1",
    agent_type="patcher",
    task_id="task-123",
    test_results={
        "total": 10,
        "passed": 10,
        "failed": 0,
        "skipped": 0
    },
    coverage_report={
        "overall": 95.5,
        "critical_modules": {"auth.py": 100.0}
    },
    code_files=["src/auth.py", "src/api.py"]
)

if result.status != "PASS":
    print(f"🚫 Post-Impl gate failed: {result.summary}")
    # Fix issues before proceeding

# Pre-Commit Gate
result = executor.execute_pre_commit_gate(
    changed_files=["src/auth.py", "src/api.py", "tests/test_auth.py"]
)

if result.status != "PASS":
    print(f"🚫 Pre-Commit gate failed - fix before committing")
    # Commit blocked
```

---

## Integration Points

### Pre-File-Write Hook

Run Pre-Development gate before writing code:

```typescript
// ~/.claude/hooks/validation/pre-file-write.ts
import { execSync } from 'child_process';

const result = execSync(
  `python ~/.claude/validation/quality_gates/gate_executor.py pre-dev \
   --agent-name ${agentName} \
   --agent-type ${agentType} \
   --requirements requirements.json \
   --test-specs test-specs.json`
);

const gateResult = JSON.parse(result.toString());

if (!gateResult.can_proceed) {
  throw new Error(`Pre-Dev gate blocked: ${gateResult.summary}`);
}
```

### Post-File-Write Hook

Run Post-Implementation gate after code changes:

```typescript
// ~/.claude/hooks/validation/post-file-write.ts
const result = execSync(
  `python ~/.claude/validation/quality_gates/gate_executor.py post-impl \
   --agent-name ${agentName} \
   --agent-type ${agentType} \
   --test-results test-results.json \
   --coverage coverage.json \
   --code-files "${changedFiles}"`
);

const gateResult = JSON.parse(result.toString());

if (gateResult.status !== "PASS") {
  console.error(`⚠️ Post-Impl gate failed: ${gateResult.summary}`);
  // Log but don't block (user can fix)
}
```

### Pre-Commit Hook

Run Pre-Commit gate before Git commit:

```bash
#!/bin/bash
# ~/.claude/hooks/validation/pre-commit.sh

changed_files=$(git diff --cached --name-only --diff-filter=ACM)

python ~/.claude/validation/quality_gates/gate_executor.py pre-commit \
  --changed-files "$changed_files"

if [ $? -ne 0 ]; then
  echo "🚫 Pre-Commit gate failed - commit blocked"
  exit 1
fi

echo "✅ Pre-Commit gate passed"
```

---

## Gate Result Structure

### GateResult Object

```python
@dataclass
class GateResult:
    phase: GatePhase                    # Which gate executed
    status: GateStatus                  # PASS, FAIL, WARNING
    can_proceed: bool                   # Can proceed with next step?
    checks: list[GateCheck]             # Individual check results
    summary: str                        # Human-readable summary
    execution_time_ms: int              # Performance tracking
    agent_name: str
    agent_type: str
    task_id: Optional[str]
    timestamp: datetime
```

### GateCheck Object

```python
@dataclass
class GateCheck:
    rule: ValidationRule                # Which rule checked
    status: CheckStatus                 # PASS, FAIL, SKIP, WARNING
    message: str                        # Explanation
    details: Optional[dict]             # Additional context
```

### ValidationRule Enum

```python
class ValidationRule(str, Enum):
    # Pre-Development
    REQUIREMENTS_PARSED = "REQUIREMENTS_PARSED"
    TEST_SPECS_GENERATED = "TEST_SPECS_GENERATED"
    TDD_REQUIRED = "TDD_REQUIRED"
    AGENT_NOT_BLOCKED = "AGENT_NOT_BLOCKED"
    DGTS_BASELINE = "DGTS_BASELINE"

    # Post-Implementation
    TESTS_MANDATORY = "TESTS_MANDATORY"
    TESTS_PASS = "TESTS_PASS"
    TEST_COVERAGE = "TEST_COVERAGE"
    DGTS_VALIDATION = "DGTS_VALIDATION"
    CONFIDENCE_REQUIREMENTS = "CONFIDENCE_REQUIREMENTS"

    # Pre-Commit
    FINAL_DGTS_CHECK = "FINAL_DGTS_CHECK"
    NO_CONSOLE_LOG = "NO_CONSOLE_LOG"
    DOCUMENTATION_UPDATED = "DOCUMENTATION_UPDATED"
    NO_COMMENTED_CODE = "NO_COMMENTED_CODE"
    TYPE_SAFETY = "TYPE_SAFETY"
```

---

## History & Logging

### JSONL History

**File**: `~/.claude/validation/history/quality-gates-YYYY-MM-DD.jsonl`

**Format**:
```json
{
  "timestamp": "2025-11-15T10:30:00Z",
  "agent_name": "patcher-1",
  "agent_type": "patcher",
  "task_id": "task-123",
  "phase": "POST_IMPLEMENTATION",
  "status": "PASS",
  "can_proceed": true,
  "execution_time_ms": 850,
  "checks": [
    {
      "rule": "TESTS_MANDATORY",
      "status": "PASS",
      "message": "Test results provided"
    },
    {
      "rule": "TESTS_PASS",
      "status": "PASS",
      "message": "All 10 tests passed"
    }
  ]
}
```

**Retention**: 90 days (auto-cleanup)

---

## Performance Benchmarks

| Gate Phase | Target | Typical | Status |
|------------|--------|---------|--------|
| Pre-Development | <500ms | 200-300ms | ✅ |
| Post-Implementation | <2s | 1.5-1.8s | ✅ |
| Pre-Commit | <1s | 600-800ms | ✅ |

**Breakdown** (Post-Implementation):
- DGTS scan: 400ms
- NLNH calculation: 50ms
- Test validation: 100ms
- Coverage parsing: 50ms
- Overhead: 200ms

---

## Troubleshooting

### Pre-Dev Gate Always Failing

**Problem**: "Requirements not parsed" or "Test specs missing"

**Solutions**:
1. Check requirements format: Must be list of strings
2. Verify test specs structure: Each requirement needs test cases
3. Ensure PRD/PRP/ADR documentation exists
4. Check agent has access to documentation

### Post-Impl Gate Failing on DGTS

**Problem**: Gaming violations detected in implementation

**Solutions**:
1. Run standalone DGTS check: `python dgts/gaming_detector.py src/file.py`
2. Review violations list for specific patterns
3. Fix gaming code (remove mocks, add real implementations)
4. Re-run Post-Impl gate

### Pre-Commit Gate Blocking on Console.log

**Problem**: Debugging statements still in code

**Solutions**:
1. Search codebase: `grep -r "console.log" src/`
2. Replace with proper logger: `import { log } from '@/lib/logger'`
3. Use `log.info()`, `log.debug()`, `log.error()` instead
4. Configure editor to highlight console.log as error

### Performance Too Slow

**Problem**: Gates taking >2s to execute

**Solutions**:
1. Check file count: Large codebases take longer
2. Use file filters: Only scan changed files
3. Enable DGTS pattern caching
4. Run DGTS in parallel with coverage parsing

---

## Best Practices

### 1. Run Gates Early
Execute Pre-Dev gate BEFORE writing any code, not after.

### 2. Fix Failures Immediately
Don't accumulate gate failures - fix before proceeding.

### 3. Monitor Gate History
Track gate pass/fail rates per agent - trends indicate issues.

### 4. Automate Gate Execution
Integrate gates into hooks for automatic enforcement.

### 5. Review Blocked Agents
If agent repeatedly fails gates, review agent prompts and behavior.

---

## Complete Workflow Example

### Feature Implementation Flow

```python
# Step 1: Pre-Development Gate
print("📋 Step 1: Pre-Development Gate")
pre_dev_result = executor.execute_pre_development_gate(
    agent_name="patcher-1",
    agent_type="patcher",
    requirements=parse_requirements_from_prd("feature.md"),
    test_specs=generate_test_specs(requirements)
)

if not pre_dev_result.can_proceed:
    raise ValueError(f"🚫 Cannot start development: {pre_dev_result.summary}")

print("✅ Pre-Dev gate passed - proceeding with implementation")

# Step 2: Implementation (agent writes code + tests)
implement_feature()
write_tests()

# Step 3: Post-Implementation Gate
print("🔍 Step 2: Post-Implementation Gate")
post_impl_result = executor.execute_post_implementation_gate(
    agent_name="patcher-1",
    agent_type="patcher",
    test_results=run_tests(),
    coverage_report=generate_coverage(),
    code_files=get_changed_files()
)

if post_impl_result.status != "PASS":
    print(f"🚫 Post-Impl gate failed: {post_impl_result.summary}")
    fix_violations(post_impl_result.checks)
    # Re-run gate after fixes

print("✅ Post-Impl gate passed - ready to commit")

# Step 4: Pre-Commit Gate
print("📝 Step 3: Pre-Commit Gate")
pre_commit_result = executor.execute_pre_commit_gate(
    changed_files=get_changed_files()
)

if pre_commit_result.status != "PASS":
    raise ValueError(f"🚫 Cannot commit: {pre_commit_result.summary}")

print("✅ All gates passed - committing code")
git_commit()
```

---

## References

- **Zero Tolerance Policy**: Veritas ZT enforcement system
- **TDD-First Enforcement**: Archon documentation-driven tests
- **DGTS Integration**: Gaming detection workflow
- **NLNH Integration**: Confidence scoring workflow

---

**Last Updated**: 2025-11-15
**Version**: 1.0.0
