---
name: auto
description: |
  Autonomous development workflow using PAI planning + ACH coding.

  Fully autonomous pipeline that takes user requirements and outputs a complete,
  tested, validated application with zero human interaction.

  USE WHEN user says:
  - "auto workflow"
  - "autonomous development"
  - "Kai develop X"
  - "PAI build X"
  - "use auto to develop X"
  - "autonomous workflow"
  - "auto build X"
  - "Kai use auto workflow"
version: 1.0.0
triggers:
  - auto workflow
  - autonomous development
  - Kai develop
  - PAI build
  - use auto
  - autonomous workflow
  - auto build
  - Kai use auto
---

# Auto Skill - Autonomous Development Workflow

## Overview

The Auto skill provides fully autonomous development capabilities by combining:
1. **PAI Spec-Driven Workflow** (6 phases) - Requirements → Specifications → Task Breakdown
2. **ACH Autonomous Coding** - Multi-session implementation with browser testing
3. **Hybrid Validation** - Quality gates at checkpoints
4. **Learning Integration** - Continuous improvement from execution data

**User Input**: Idea/requirements → **Output**: Fully built, tested, validated application (zero human interaction)

## Activation Triggers

### Natural Language (Primary Method)
```
User: "Kai use auto workflow to develop a task management app"
User: "PAI autonomous development: build a blog platform"
User: "Use auto to develop an e-commerce store"
User: "Kai develop a todo app with drag-and-drop"
User: "Auto build a chat application"
```

### Slash Command (Alternative)
```bash
/auto "Build a task management app"
```

## Workflow Stages

### Stage 1: PAI Planning (Phases 1-6)
```
Requirements
    ↓
Phase 1: Plan Product → plan.md
Phase 2: Shape Spec → shaped-spec.md
Phase 3: Write Spec → PRD.md, PRP.md, ADR.md
Phase 4: Create Tasks → task_list.json
Phase 5: Implement Prep → implementation-plan.md
Phase 6: Orchestrate → feature_list.json (200+ test cases)
    ↓
Handoff Coordinator validates completion
```

### Stage 2: ACH Autonomous Coding
```
feature_list.json
    ↓
BOSS Worker spawns ACH subprocess
    ↓
Initializer Agent: Create test structure
Coding Agent: Implement features
    ↓
Checkpoint validation every 5 sessions
MCP process cleanup between sessions
    ↓
Continues until all tests pass
```

### Stage 3: Final Validation & Learning
```
Comprehensive PAI validation suite
    ↓
Feed execution data to learning systems
    ↓
Generate completion report
```

## Output Files

All artifacts created in project root:
- `.auto-output/` - PAI planning artifacts
  - `PRD.md` - Product Requirements Document
  - `PRP.md` - Product Requirements Proposal
  - `ADR.md` - Architecture Decision Records
  - `task_list.json` - Structured task breakdown
  - `implementation-plan.md` - Implementation strategy
- `feature_list.json` - ACH test cases (200+ tests)
- `.auto-state.json` - Session state (for resume)

## Critical Data Flow

```
PRD.md + ADR.md (requirements + architecture)
    ↓
task_list.json (structured tasks from specs)
    ↓
feature_list.json (200+ detailed test cases in ACH format)
    ↓
BOSS Worker (--project-root {project} --feature-list {project}/feature_list.json)
    ↓
ACH reads feature_list.json and implements all features
```

## Validation Strategy

**Hybrid Validation** (Quality + Performance):

| Stage | Validation Type | Frequency | Blocking? | Time |
|-------|----------------|-----------|-----------|------|
| PAI Phase Gates | Full PAI Suite | After each phase (6x) | YES | ~30s |
| ACH Sessions | ACH Built-in | Every iteration | NO | ~5s |
| ACH Checkpoints | Lightweight PAI | Every 5 sessions | YES | ~10s |
| Final Completion | Full PAI Suite | Once at end | YES | ~60s |

**Validators Used**:
- NLNH (No Lies, No Hallucination) - Confidence ≥80%
- DGTS (Don't Game The System) - Gaming score ≤30%
- Zero Tolerance - 0 TypeScript/ESLint errors
- Doc-Driven TDD - Tests derived from PRD/PRP/ADR
- AntiHall - Code existence verification
- Test Coverage - ≥95% required

## Configuration

**Default Settings** (`config/auto-config.yaml`):
```yaml
maxSessions: 50
checkpointInterval: 5
validationLevel: standard
learningEnabled: true
autonomousMode: true
requireApprovals: false
```

**Project-Specific Overrides** (`.auto-config.local.yaml` in project root):
```yaml
maxSessions: 30
validationLevel: strict
```

## Commands

### Start Development
```
User: "Kai use auto workflow to develop a blog platform with markdown support"
```

### Resume Interrupted Session
```
User: "auto resume"
```

### Check Status
```
User: "auto status"
```

### Configuration
```
User: "auto config --max-sessions 30"
User: "auto config --validation-level strict"
```

### Dry Run (Planning Only, No Coding)
```
User: "auto --dry-run build an e-commerce store"
```

## Features

✅ **Fully Autonomous**: Zero human interaction required
✅ **State Persistence**: Resume capability after crashes/interrupts
✅ **Windows Compatible**: UTF-8 encoding, proper PATH, MCP cleanup
✅ **Learning Integration**: All execution data feeds PAI learning systems
✅ **Safety Maintained**: Sandbox, permissions still enforced
✅ **Hybrid Validation**: Quality gates without performance penalty
✅ **Centralized ACH**: Code in single location, operates on any project

## Success Criteria

- User provides idea → System outputs fully built, tested, validated application
- ACH code remains in `C:\Jarvis\AI Workspace\BOSS Exchange\autonomous-coding\`
- ACH operates on projects via `--project-root` and `--feature-list` arguments
- State persists across crashes with `.auto-state.json`
- Learning systems capture all execution data
- PAI validation at checkpoints (not every iteration)

## Safety & Autonomy

**Autonomous Mode**:
- Human-in-loop approval gates DISABLED
- Automatic file creation/modification
- Automatic command execution
- Automatic git commits (with user permission)

**Safety Still Enforced**:
- Sandbox restrictions active
- Permission system active
- Blocked operations (deleteDatabase, systemFileModification)
- NLNH protocol (truth enforcement)
- DGTS validation (gaming detection)

## Notes

- **Fresh Context**: ACH uses two-agent pattern with context clearing between sessions
- **File-Based State**: All state in JSON files (survives crashes)
- **Learning-First**: Every operation feeds learning system for continuous improvement
- **Windows-First**: All code tested on Windows (UTF-8, PATH, process cleanup)

## Implementation Details

**Technology Stack**:
- TypeScript (orchestrator, validation, learning)
- Python (BOSS worker, ACH integration)
- Bun runtime (for TypeScript workflows)
- Claude CLI (for ACH subprocess spawning)
- Playwright MCP (for browser automation)

**Architecture**:
- 3-stage pipeline (Planning → Coding → Validation)
- Handoff coordinator for PAI → ACH transition
- State manager for crash recovery
- Learning integration for continuous improvement
- Error handler for validation failures and retries
