# `/auto` - Autonomous Development Workflow

> **Fully autonomous development pipeline**: Requirements → Specifications → Implementation → Validation → Learning

## Overview

The `/auto` command enables **zero-human-interaction development** by combining:

1. **PAI Spec-Driven Workflow** (Phases 1-6) - Requirements gathering → Specifications → Task breakdown
2. **ACH Autonomous Coding** - Multi-session implementation with browser testing
3. **Hybrid Validation** - PAI quality gates at checkpoints, ACH validation during sessions
4. **Learning Integration** - All execution data feeds PAI learning systems

**Input**: User requirements
**Output**: Fully built, tested, validated application

## Quick Start

### Activation Methods

#### 1. Natural Language (Primary)
```
User: "Kai use auto workflow to develop a task management app"
User: "PAI autonomous development: build a blog platform"
User: "Use auto to develop an e-commerce store"
```

**Triggers**: "auto workflow", "autonomous development", "Kai develop", "PAI build", "use auto"

#### 2. Slash Command (Explicit)
```bash
# Start new autonomous workflow
/auto "Build a task management app with drag-and-drop"

# Resume interrupted session
/auto resume

# Check status
/auto status

# Dry run (planning only, no coding)
/auto --dry-run "Build a blog platform"
```

### Prerequisites

1. **PAI Spec-Driven Workflow** installed (`C:\Users\HeinvanVuuren\.claude\workflows\spec-driven\`)
2. **ACH Autonomous Coding** installed (`C:\Jarvis\AI Workspace\BOSS Exchange\autonomous-coding\`)
3. **BOSS Orchestrator** configured (`.claude\skills\boss-orchestrator\`)
4. **Bun runtime** for TypeScript workflows
5. **Python 3.11+** for BOSS worker
6. **Claude CLI** configured (`claude setup-token`)

## Architecture

### Three-Stage Pipeline

```
Stage 1: PAI Planning (Phases 1-6)
    ↓
    PRD.md + ADR.md (requirements + architecture)
    ↓
    task_list.json (structured tasks)
    ↓
    feature_list.json (200+ test cases for ACH)
    ↓
Stage 2: ACH Autonomous Coding (via BOSS Worker)
    ↓
    Initializer Agent: Reads feature_list.json
    ↓
    Coding Agent: Implements features to pass tests
    ↓
    Checkpoint validation every 5 sessions
    ↓
Stage 3: Final Validation & Learning
    ↓
    Comprehensive PAI validation
    ↓
    Feed data to learning systems
    ↓
    Completion report
```

### Critical Data Flow

```
PRD.md + ADR.md → task_list.json → feature_list.json (200+ test cases)
    ↓
BOSS Worker (--project-root {project} --feature-list {project}/feature_list.json)
    ↓
ACH reads feature_list.json and implements all features
```

## Configuration

### Default Configuration

Location: `.claude/skills/auto/config/auto-config.yaml`

```yaml
# Session limits
maxSessions: 50
checkpointInterval: 5
maxIterations: 20

# Autonomous mode
autonomousMode: true
requireApprovals: false

# Validation
validationLevel: standard
validationThresholds:
  nlnhConfidence: 0.80
  dgtsMaxScore: 0.30
  minCompleteness: 0.95
  minTestCoverage: 0.95

# Learning
learningEnabled: true
learningDir: ./.auto-learning

# Output
outputDir: ./.auto-output
stateFile: ./.auto-state.json
```

### Project-Specific Overrides

Create `.auto-config.local.yaml` in your project:

```yaml
maxSessions: 30
checkpointInterval: 3
validationLevel: strict
```

## Usage Examples

### Example 1: Build Task Management App

```
User: "Kai use auto workflow to develop a task management app with drag-and-drop"
```

**Output**:
- `PRD.md` - Product requirements
- `feature_list.json` - 200+ test cases
- `src/` - Implemented features
- `.auto-state.json` - Session state
- `.auto-learning/` - Learning data

### Example 2: Build Blog Platform

```bash
/auto "Build a blog platform with:
  - User authentication
  - Post creation/editing
  - Comment system
  - Markdown support
  - SEO optimization"
```

### Example 3: Resume Interrupted Workflow

```bash
# Workflow interrupted (Ctrl+C or crash)
/auto resume
```

**Resume Process**:
1. Reads `.auto-state.json`
2. Identifies last completed stage/phase/session
3. Continues from interruption point

## State Management

### State File: `.auto-state.json`

```json
{
  "version": "1.0",
  "sessionId": "auto-1733565000000",
  "currentStage": 2,
  "stages": {
    "1": {
      "name": "PAI Planning",
      "status": "completed",
      "phases": {
        "1": { "name": "Plan Product", "status": "completed" },
        "2": { "name": "Shape Spec", "status": "completed" },
        "3": { "name": "Write Spec", "status": "completed" },
        "4": { "name": "Create Tasks", "status": "completed" },
        "5": { "name": "Implement Prep", "status": "completed" },
        "6": { "name": "Orchestrate", "status": "completed" }
      }
    },
    "2": {
      "name": "ACH Autonomous Coding",
      "status": "in_progress",
      "sessions": {
        "0": { "status": "completed", "featuresCompleted": [...] },
        "1": { "status": "in_progress" }
      },
      "currentSession": 1
    }
  },
  "artifacts": {
    "prd": "./.auto-output/PRD.md",
    "featureList": "./.auto-output/feature_list.json"
  }
}
```

### Resume Capability

State persists across:
- ✅ Crashes (MCP server failures)
- ✅ User interrupts (Ctrl+C)
- ✅ Validation failures (retries)
- ✅ Session timeouts

## Validation Strategy

### Hybrid Validation Timing

| Stage | Validation Type | Frequency | Blocking? | Time |
|-------|----------------|-----------|-----------|------|
| PAI Phase Gates | Full PAI Suite | After each phase (6x) | YES | ~30s each |
| ACH Sessions | ACH Built-in | Every iteration | NO | ~5s each |
| ACH Checkpoints | Lightweight PAI | Every 5 sessions | YES | ~10s |
| Final Completion | Full PAI Suite | Once at end | YES | ~60s |

### Validators Used

**PAI Phase Gates**:
- ✅ NLNH (No Lies, No Hallucination) - Confidence ≥80%
- ✅ DGTS (Don't Game The System) - Gaming score ≤30%
- ✅ Zero Tolerance - 0 TypeScript/ESLint errors
- ✅ Doc-Driven TDD - Tests from PRD/PRP/ADR

**ACH Built-in**:
- ✅ Browser automation tests (Playwright)
- ✅ Feature completion tracking

**Final Comprehensive**:
- ✅ All PAI validators
- ✅ Test coverage ≥95%
- ✅ TypeScript strict mode
- ✅ ESLint zero warnings
- ✅ Zero console.log statements
- ✅ Production build successful

## Learning Integration

### Data Captured

**ACH Session Data** (after each session):
- Duration, features completed, test pass rate
- Validation failures, retry patterns
- Gaming violations

**PAI Phase Data** (after each phase):
- Phase duration, NLNH confidence, DGTS score
- Validation errors, retry success rate

**Final Completion Data**:
- Total duration, overall test pass rate
- Session count, success rate
- Gaming violations, retry effectiveness

### Learning System Components

1. **Performance**: Metrics and timing data
2. **Preferences**: Agent choice patterns (ACH vs direct)
3. **Patterns**: Success/failure modes
4. **Realtime**: Live monitoring
5. **Adaptive**: Threshold adjustments

### Adaptive Recommendations

The system generates recommendations based on outcomes:

- **Session count too low** → Reduce `maxSessions` default
- **Session count too high** → Increase `maxSessions` default
- **High validation failures** → Increase checkpoint frequency
- **High gaming violations** → Increase DGTS sensitivity

## Error Handling

### Intelligent Retry System

**Phase Validation Failures**:
1. Analyze error type (which protocol?)
2. Generate protocol-specific fix suggestions
3. Retry with fixes (max 3 attempts)
4. Detect gaming patterns (identical errors, protocol switching)

**ACH Session Crashes**:
1. Cleanup MCP processes
2. Save state
3. Retry with fresh context (max 2 attempts per session)

**Max Iterations Reached**:
- Generate partial completion report
- Provide resume instructions
- List completed features and next steps

**User Interrupt**:
- Graceful shutdown
- Save state to `.auto-state.json`
- Cleanup MCP processes
- Generate resume instructions

### Gaming Detection

During retries, the system detects:
- **Identical errors** across attempts → Gaming score +0.2
- **Protocol switching** → Gaming score +0.1
- **Gaming score >0.5** → Block retry, escalate to user

### Protocol-Specific Fix Suggestions

- **NLNH**: Add citations, use "I don't know"
- **DGTS**: Remove mocks, implement real logic
- **Zero Tolerance**: Replace console.log, add types
- **Doc-TDD**: Create tests from PRD first
- **AntiHall**: Verify code exists

## Safety Mechanisms

### Human-in-Loop (HIL) Bypass

**Disabled in Autonomous Mode**:
- ❌ Phase approval gates
- ❌ File operation approvals (create, edit)
- ❌ Stage transition approvals

**Still Enforced**:
- ✅ Sandbox restrictions
- ✅ Permission system
- ✅ Blocked operations (deleteDatabase, systemFileModification, etc.)
- ✅ Git operations require approval (commit, push, merge)
- ✅ File deletion requires approval
- ✅ NLNH protocol (truth enforcement)
- ✅ DGTS validation (gaming detection)

### Blocked Operations (Always Require Approval)

- `deleteDatabase`
- `systemFileModification`
- `processTermination`
- `sensitiveDataExposure`
- `securityBypass`
- `deleteMultipleFiles`
- `modifySystemConfig`
- `changePermissions`
- `accessCredentials`
- `executePrivileged`

## Troubleshooting

### Common Issues

#### 1. ACH Sessions Failing

**Symptoms**: Sessions crash repeatedly, timeout errors

**Solutions**:
```bash
# Check MCP processes
bun .claude/skills/auto/workflows/mcp-cleanup.ts check

# Cleanup MCP processes
bun .claude/skills/auto/workflows/mcp-cleanup.ts cleanup

# Verify feature_list.json is valid
cat feature_list.json | jq .
```

#### 2. Phase Validation Failures

**Symptoms**: Phase fails validation after 3 retries

**Solutions**:
- Review validation errors in `.auto-state.json`
- Check NLNH confidence (should be ≥80%)
- Check DGTS score (should be ≤30%)
- Manually fix validation issues, then `/auto resume`

#### 3. Max Iterations Reached

**Symptoms**: Workflow stops at max_sessions

**Solutions**:
```yaml
# Increase max_sessions in .auto-config.local.yaml
maxSessions: 75
```

#### 4. Resume Not Working

**Symptoms**: `/auto resume` starts from beginning

**Solutions**:
```bash
# Check state file exists
ls .auto-state.json

# Validate state file
cat .auto-state.json | jq .
```

## File Structure

```
.claude/skills/auto/
├── skill.md                           # Natural language triggers
├── README.md                          # This file
├── config/
│   ├── auto-config.yaml              # Default configuration
│   └── autonomous-overrides.yaml     # HIL bypass config
└── workflows/
    ├── auto-orchestrator.ts          # Main orchestrator
    ├── state-manager.ts              # State persistence
    ├── completion-validator.ts       # Hybrid validation
    ├── handoff-coordinator.ts        # PAI → ACH transition
    ├── learning-integration.ts       # Learning system bridge
    ├── error-handler.ts              # Error recovery
    └── mcp-cleanup.ts                # Process cleanup

.claude/workflows/spec-driven/
├── workflow-orchestrator.ts          # PAI workflow (modified)
└── autonomous-mode-adapter.ts        # HIL bypass

.claude/skills/boss-orchestrator/workers/
└── autonomous_coding_worker.py       # BOSS worker for ACH

.claude/commands/
└── auto.md                           # Slash command definition

C:/Jarvis/AI Workspace/BOSS Exchange/autonomous-coding/
└── autonomous_agent_demo.py          # ACH entry point (modified)
```

## Output Files

**In Project Root**:
- `.auto-state.json` - Session state (resume capability)
- `.auto-learning/` - Learning data (metrics, preferences, patterns)

**In `.auto-output/`**:
- `PRD.md` - Product Requirements Document
- `PRP.md` - Product Requirements Proposal
- `ADR.md` - Architecture Decision Records
- `task_list.json` - Structured tasks
- `feature_list.json` - **200+ test cases for ACH**
- `implementation-plan.md` - Implementation strategy

## Advanced Usage

### Custom Validation Level

```bash
/auto --validation-level strict "Build X"
```

**Levels**:
- `minimal` - Success flag only
- `checkpoint` - Critical errors only (autonomous default)
- `standard` - Full validation (normal default)
- `strict` - Zero warnings allowed

### Custom Session Limits

```bash
/auto --max-sessions 30 "Build X"
```

### Dry Run (Planning Only)

```bash
/auto --dry-run "Build X"
```

**Output**: PAI planning artifacts only (PRD, feature_list.json), no ACH coding

## Performance Metrics

### Expected Improvements (vs Manual Development)

| Metric | Before /auto | After /auto | Improvement |
|--------|--------------|-------------|-------------|
| **Development Time** | 40+ hours | 2-6 hours | 85-90% faster |
| **Test Coverage** | 60-70% | >95% | +30-35% |
| **Validation Pass Rate** | 40% | 80%+ | +100% |
| **Gaming Violations** | 10-15% | <3% | 70-80% reduction |
| **Human Intervention** | Constant | Zero | 100% automation |

### Typical Session Timeline

```
Stage 1: PAI Planning       → 20-40 minutes (6 phases)
Stage 2: ACH Coding         → 1-4 hours (10-40 sessions)
Stage 3: Final Validation   → 5-10 minutes
Total                       → 2-5 hours (fully autonomous)
```

## FAQ

### Q: Can I interrupt and resume the workflow?

**A**: Yes! Press Ctrl+C or let it crash. Run `/auto resume` to continue from the last checkpoint.

### Q: What if validation keeps failing?

**A**: The system retries with intelligent fixes (max 3 attempts). If all retries fail, it generates a partial completion report with next steps.

### Q: Can I use /auto on existing projects?

**A**: Yes! The workflow operates on any project via `--project-root`. ACH code stays in one location, operates on your project.

### Q: What if max_sessions is reached without completion?

**A**: The system generates a partial completion report and saves state. You can increase `maxSessions` in config and resume.

### Q: How do I disable learning data collection?

**A**: Set `learningEnabled: false` in `.auto-config.local.yaml`

### Q: Can I use /auto without BOSS orchestrator?

**A**: No, BOSS orchestrator is required for ACH session management and process cleanup.

### Q: What happens if MCP processes accumulate?

**A**: The system automatically cleans up MCP processes between sessions using Windows-compatible PID-specific cleanup (never kills all processes).

## Contributing

The `/auto` workflow is part of PAI (Personal AI Infrastructure). To contribute:

1. File issues at: `C:\Jarvis\AI Workspace\Personal_AI_Infrastructure\`
2. Follow PAI development standards (NLNH, DGTS, Zero Tolerance)
3. All contributions must pass validation suite

## License

Part of Personal AI Infrastructure (PAI) - Week 9-10 Autonomous Agents

## Acknowledgments

- **PAI Spec-Driven Workflow** - Phases 1-6 implementation
- **ACH Autonomous Coding** - Two-agent autonomous coding
- **BOSS Orchestrator** - Task queue and worker management
- **Claude Agent SDK** - Agent framework
- **Anthropic** - Claude 4 Sonnet model

---

**Status**: ✅ Implementation Complete (Week 9-10)
**Version**: 1.0
**Last Updated**: 2025-12-07
