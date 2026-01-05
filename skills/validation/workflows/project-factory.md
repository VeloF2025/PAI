## Project-Specific Agent Factory Workflow

**Purpose**: Auto-generate project-tailored validation agents based on codebase analysis

**Benefits**:
- Adapts validation to your exact tech stack (TypeScript, Python, React, FastAPI, etc.)
- Generates project-specific DGTS gaming patterns
- Configures agent-specific confidence thresholds
- Seamlessly integrates with PAI hooks (pre-file-write, pre-commit)

**Performance**: <200ms for analysis + generation

---

## Overview

The Project-Specific Agent Factory analyzes your codebase and automatically creates validation agents tailored to your project's:

1. **Programming Languages** (TypeScript, Python, JavaScript, etc.)
2. **Frameworks** (React, Next.js, FastAPI, Django, etc.)
3. **Architecture Patterns** (Vertical Slice, Clean Architecture, MVC)
4. **Complexity Level** (0-10 score based on size, diversity, patterns)

### What Gets Generated

**`.archon/project_agents.yaml`** with:
- Project metadata (languages, frameworks, complexity)
- Specialized agents (TypeScript enforcer, React validator, etc.)
- Custom DGTS patterns (tech stack-specific gaming detection)
- Agent-specific thresholds (DGTS gaming, NLNH confidence)
- Quality gates (TDD required, security audit, etc.)

---

## Workflow Steps

### Step 1: Generate Project-Specific Agents

```python
from validation.project_factory import ProjectAgentFactory

# Analyze codebase and generate agents
factory = ProjectAgentFactory(project_root="/path/to/your/project")
config = factory.analyze_and_generate()

print(f"Generated {len(config.agents)} specialized agents")
```

**What This Does**:
1. Scans codebase for tech stack indicators
2. Calculates project complexity score
3. Generates agents based on detected technologies
4. Saves configuration to `.archon/project_agents.yaml`

**Output Example** (`.archon/project_agents.yaml`):
```yaml
project:
  name: "my-project"
  complexity: 7.5
  languages:
    typescript: 70%
    python: 30%
  frameworks:
    - react
    - fastapi
  build_tools:
    - npm
    - vite
  testing_frameworks:
    - vitest
  databases:
    - supabase

agents:
  - name: typescript-strict-enforcer
    type: code-quality-reviewer
    description: Enforces TypeScript strict mode and type safety
    validation:
      dgts:
        threshold: 0.35
        custom_patterns:
          - id: TS_ANY_TYPE
            severity: CRITICAL
            regex: '\bany\b(?!\s*\()'
            description: TypeScript 'any' type usage (strict mode violation)
            category: type_safety
      nlnh:
        confidence_threshold: 0.85
      quality_gates:
        - TYPE_CHECK_REQUIRED
        - NO_ANY_TYPES

  - name: react-best-practices-enforcer
    type: code-implementer
    description: Enforces React best practices and hooks rules
    validation:
      dgts:
        threshold: 0.3
        custom_patterns:
          - id: REACT_MISSING_KEY
            severity: MAJOR
            regex: '\.map\(.*?\)\s*\n.*?<.*?>(?!.*?key=)'
            description: Missing key prop in mapped elements
            category: react_rules
      nlnh:
        confidence_threshold: 0.80
      quality_gates:
        - HOOKS_RULES
        - COMPONENT_STRUCTURE

  - name: fastapi-security-enforcer
    type: security-auditor
    description: Enforces FastAPI security best practices
    validation:
      dgts:
        threshold: 0.35
        custom_patterns:
          - id: FASTAPI_NO_AUTH
            severity: CRITICAL
            regex: '@app\.(get|post|put|delete)\(.*?\)(?!\s*\n.*?Depends)'
            description: API route without authentication dependency
            category: security
      nlnh:
        confidence_threshold: 0.85
      quality_gates:
        - SECURITY_AUDIT
        - PYDANTIC_VALIDATION
```

---

### Step 2: Hook Integration (Automatic)

**No manual setup required** - PAI hooks automatically load project configuration.

**How It Works**:
1. **Pre-File-Write Hook** (`~/.claude/hooks/pre-file-write.ts`):
   - Detects `.archon/project_agents.yaml` in project
   - Loads agent-specific configuration for current agent
   - Merges project patterns with global patterns
   - Applies agent-specific thresholds
   - Runs DGTS validation with merged rules

2. **Pattern Merging**:
   - Global patterns (37 base patterns from `~/.claude/validation/patterns/base_patterns.json`)
   - Project patterns (tech stack-specific from `.archon/project_agents.yaml`)
   - Deduplication by pattern ID (project overrides global)

3. **Threshold Resolution**:
   - **Priority**: Agent-specific → Project default → Global default
   - **DGTS**: Uses agent threshold (e.g., 0.35 for TypeScript strict enforcer)
   - **NLNH**: Uses agent confidence threshold (e.g., 0.85 for security auditor)

**Validation Flow**:
```
1. Agent attempts file write
   ↓
2. pre-file-write.ts hook triggered
   ↓
3. Load project config (.archon/project_agents.yaml)
   ↓
4. Get agent-specific validation config
   ↓
5. Merge global + project DGTS patterns
   ↓
6. Apply agent-specific thresholds
   ↓
7. Run DGTS validation with merged rules
   ↓
8. Block if gaming_score >= threshold
   ↓
9. Allow/block file write
```

---

### Step 3: Validation Execution

**Automatic** - Runs on every file write

**Manual Testing**:
```python
from validation.project_factory import HookIntegration, ValidationContext

# Create validation context
context = ValidationContext(
    file_path="src/components/App.tsx",
    file_content=open("src/components/App.tsx").read(),
    agent_name="typescript-strict-enforcer",
)

# Run validation
integration = HookIntegration(project_root=".")
result = integration.validate_file_write(context)

if result.should_block:
    print(f"🚫 Blocked: {result.summary}")
    for violation in result.violations:
        print(f"  [{violation['severity']}] {violation['description']}")
else:
    print("✅ Validation passed")
```

---

## Tech Stack-Specific Agents

### TypeScript Projects

**Generated Agent**: `typescript-strict-enforcer`

**Custom DGTS Patterns**:
- `TS_ANY_TYPE`: Detects `any` type usage (CRITICAL)
- `TS_IMPLICIT_ANY`: Detects implicit any in array types (MAJOR)

**Quality Gates**:
- `TYPE_CHECK_REQUIRED`: 100% type coverage
- `NO_ANY_TYPES`: Zero tolerance for `any` types

**Threshold**: DGTS 0.35, NLNH 0.85

---

### React Projects

**Generated Agent**: `react-best-practices-enforcer`

**Custom DGTS Patterns**:
- `REACT_INLINE_FUNCTION`: Inline functions in JSX (MINOR - performance)
- `REACT_MISSING_KEY`: Missing key prop in .map() (MAJOR)

**Quality Gates**:
- `HOOKS_RULES`: Enforces Rules of Hooks
- `COMPONENT_STRUCTURE`: Component organization standards

**Threshold**: DGTS 0.3, NLNH 0.80

---

### Python Projects

**Generated Agent**: `python-pep8-enforcer`

**Custom DGTS Patterns**:
- `PY_BROAD_EXCEPT`: Broad exception without logging (MAJOR)
- `PY_PRINT_STATEMENT`: Print statement instead of logging (MINOR)

**Quality Gates**:
- `PEP8_COMPLIANCE`: PEP 8 style guide adherence
- `TYPE_HINTS_REQUIRED`: Type hints for all functions

**Threshold**: DGTS 0.3, NLNH 0.75

---

### FastAPI Projects

**Generated Agent**: `fastapi-security-enforcer`

**Custom DGTS Patterns**:
- `FASTAPI_NO_AUTH`: API route without authentication (CRITICAL)
- `FASTAPI_NO_VALIDATION`: Route parameter without Pydantic validation (MAJOR)

**Quality Gates**:
- `SECURITY_AUDIT`: Security review required
- `PYDANTIC_VALIDATION`: All inputs validated

**Threshold**: DGTS 0.35, NLNH 0.85

---

### Next.js Projects

**Generated Agent**: `nextjs-optimization-enforcer`

**Custom DGTS Patterns**:
- `NEXTJS_IMG_TAG`: Using `<img>` instead of Next.js Image (MAJOR)
- `NEXTJS_CLIENT_COMPONENT`: Unnecessary 'use client' directive (MINOR)

**Quality Gates**:
- `SSR_VALIDATION`: Server-side rendering validation
- `IMAGE_OPTIMIZATION`: Image optimization check

**Threshold**: DGTS 0.3, NLNH 0.80

---

### Supabase Projects

**Generated Agent**: `supabase-rls-enforcer`

**Custom DGTS Patterns**:
- `SUPABASE_NO_RLS`: Supabase query without RLS policy check (CRITICAL)

**Quality Gates**:
- `RLS_VALIDATION`: Row Level Security validation

**Threshold**: DGTS 0.35, NLNH 0.85

---

### Testing Projects

**Generated Agent**: `testing-coverage-enforcer`

**Custom DGTS Patterns**:
- `TEST_NO_ASSERTIONS`: Test without assertions (CRITICAL)
- `TEST_ONLY_TRUE`: Test always passes (assert true) (CRITICAL)

**Quality Gates**:
- `COVERAGE_95_PERCENT`: 95% test coverage required
- `NO_FAKE_TESTS`: No gaming in test assertions

**Threshold**: DGTS 0.4, NLNH 0.90

---

## Configuration Management

### Viewing Current Configuration

```python
from validation.project_factory import ConfigLoader

loader = ConfigLoader(project_root=".")
config = loader.load_for_agent("typescript-strict-enforcer")

print(f"DGTS Threshold: {config.dgts_threshold}")
print(f"NLNH Threshold: {config.nlnh_threshold}")
print(f"Total Patterns: {len(config.dgts_patterns)}")
print(f"Quality Gates: {config.quality_gates}")
```

### Customizing Agent Configuration

Edit `.archon/project_agents.yaml`:

```yaml
agents:
  - name: typescript-strict-enforcer
    validation:
      dgts:
        threshold: 0.40  # Make stricter (default 0.35)
        custom_patterns:
          - id: MY_CUSTOM_PATTERN
            severity: MAJOR
            regex: 'somePattern'
            description: My custom validation rule
            category: custom
      nlnh:
        confidence_threshold: 0.90  # Require higher confidence
      quality_gates:
        - MY_CUSTOM_GATE
```

### Adding New Patterns

```yaml
agents:
  - name: my-custom-agent
    type: code-quality-reviewer
    description: My custom validation agent
    validation:
      dgts:
        threshold: 0.3
        custom_patterns:
          - id: CUSTOM_001
            severity: CRITICAL
            regex: 'dangerousPattern'
            description: Dangerous code pattern detected
            category: security
```

---

## CLI Usage

### Generate Agents

```bash
python -c "
from validation.project_factory import ProjectAgentFactory
factory = ProjectAgentFactory('.')
config = factory.analyze_and_generate()
print(f'Generated {len(config.agents)} agents')
"
```

### Test Validation

```bash
# Test file validation
cat src/components/App.tsx | python ~/.claude/validation/project_factory/hook_integration.py \
  typescript-strict-enforcer \
  src/components/App.tsx
```

---

## Troubleshooting

### Agent Not Loading

**Problem**: Validation uses global patterns instead of project-specific

**Solution**:
1. Check `.archon/project_agents.yaml` exists
2. Verify agent name matches exactly
3. Clear config cache: `ConfigLoader(project_root).clear_cache()`

### Patterns Not Merging

**Problem**: Project patterns not being applied

**Solution**:
1. Check pattern format (must have `id`, `severity`, `regex`, `description`)
2. Verify YAML syntax is correct
3. Check hook logs for loading errors

### Validation Too Strict

**Problem**: Too many false positives

**Solution**:
1. Increase agent threshold in `.archon/project_agents.yaml`
2. Remove noisy patterns from custom_patterns
3. Adjust severity levels (CRITICAL → MAJOR → MINOR)

---

## Performance

### Benchmarks

| Operation | Time | Status |
|-----------|------|--------|
| Codebase Analysis | <500ms | ✅ |
| Agent Generation | <200ms | ✅ |
| Config Loading | <50ms | ✅ |
| Pattern Merging | <10ms | ✅ |
| DGTS Validation | <100ms | ✅ |
| **Total (cold start)** | **<1s** | ✅ |
| **Total (cached)** | **<150ms** | ✅ |

### Caching

**What's Cached**:
- Global patterns (in-memory)
- Project configuration (in-memory)
- Agent configurations (on-demand)

**Cache Invalidation**:
- Automatic on `.archon/project_agents.yaml` change
- Manual: `ConfigLoader.clear_cache()`

---

## Integration with Other PAI Systems

### DGTS Gaming Detection

Project-specific patterns are **merged** with global DGTS patterns:
- Global: 37 base patterns (all projects)
- Project: Tech stack-specific patterns (this project only)

### NLNH Confidence Scoring

Agent-specific thresholds **override** global thresholds:
- Global: 0.75 (default)
- Project Agent: 0.85 (security-critical)

### Quality Gates

Project-specific quality gates **extend** global gates:
- Global: TDD_REQUIRED, DGTS_CLEAN, NLNH_THRESHOLD_MET
- Project: TYPE_CHECK_REQUIRED, SECURITY_AUDIT, RLS_VALIDATION

---

## Examples

### Full Stack TypeScript + Python Project

**Tech Stack**:
- Frontend: TypeScript + React + Next.js
- Backend: Python + FastAPI
- Database: Supabase
- Testing: Vitest + Pytest

**Generated Agents** (6 total):
1. `typescript-strict-enforcer` (DGTS: 0.35, NLNH: 0.85)
2. `react-best-practices-enforcer` (DGTS: 0.3, NLNH: 0.80)
3. `nextjs-optimization-enforcer` (DGTS: 0.3, NLNH: 0.80)
4. `python-pep8-enforcer` (DGTS: 0.3, NLNH: 0.75)
5. `fastapi-security-enforcer` (DGTS: 0.35, NLNH: 0.85)
6. `supabase-rls-enforcer` (DGTS: 0.35, NLNH: 0.85)
7. `testing-coverage-enforcer` (DGTS: 0.4, NLNH: 0.90)

**Total Custom Patterns**: 15 (in addition to 37 global patterns)

**Validation Coverage**:
- TypeScript: No `any` types, strict mode enforcement
- React: Hooks rules, key props, component structure
- Next.js: Image optimization, SSR validation
- Python: PEP 8, type hints, error handling
- FastAPI: Authentication required, Pydantic validation
- Supabase: Row Level Security enforcement
- Testing: No fake tests, 95% coverage

---

## Version History

- **1.0.0** (2025-11-15): Initial release
  - Codebase analyzer (300 LOC)
  - Agent generator (400 LOC)
  - Configuration loader (250 LOC)
  - Hook integration (250 LOC)
  - 8 agent templates (TypeScript, React, Python, FastAPI, Next.js, Firebase, Supabase, Testing)
  - Pre-file-write hook integration
  - Pattern merging system
  - Threshold resolution
  - 8 integration tests passing
  - Performance: <1s cold start, <150ms cached

---

**Maintained by**: PAI Core Team
**License**: MIT
**Status**: ✅ PRODUCTION READY
