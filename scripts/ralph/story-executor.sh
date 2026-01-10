#!/usr/bin/env bash
#
# Story Executor - Execute a single user story using Claude Code CLI
#
# Usage: bash story-executor.sh <project-dir> <story-id>
#

set -e

PROJECT_DIR="${1:-.}"
STORY_ID="$2"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Files
PRD_FILE="$PROJECT_DIR/prd.json"
CONTEXT_FILE="$PROJECT_DIR/.ralph/context.json"

# Get story
STORY=$(jq ".user_stories[] | select(.id == \"$STORY_ID\")" "$PRD_FILE")

# Extract story details
TITLE=$(echo "$STORY" | jq -r '.title')
DESCRIPTION=$(echo "$STORY" | jq -r '.description')
ACCEPTANCE_CRITERIA=$(echo "$STORY" | jq -r '.acceptance_criteria | join("\n- ")')
COMPONENTS=$(echo "$STORY" | jq -r '.components_affected | join(", ")')

# Get context from previous stories
CONTEXT=$(cat "$CONTEXT_FILE")
KEY_DECISIONS=$(echo "$CONTEXT" | jq -r '.key_decisions | join("\n- ")')
PATTERNS=$(echo "$CONTEXT" | jq -r '.patterns_established | join("\n- ")')

# Detect complexity
MODE=$(bash "$SCRIPT_DIR/complexity-detector.sh" "$PROJECT_DIR" "$STORY_ID")

echo "Complexity mode: $MODE"

# Build prompt
PROMPT="# Story: $TITLE

**Story ID**: $STORY_ID

## Description
$DESCRIPTION

## Acceptance Criteria
- $ACCEPTANCE_CRITERIA

## Components Affected
$COMPONENTS

## Context from Previous Stories

### Key Decisions Made
- $KEY_DECISIONS

### Patterns Established
- $PATTERNS

## Instructions

Implement this story following these guidelines:

1. **Code Quality**: Follow all PAI quality standards
   - TypeScript strict mode
   - No console.log in production code
   - Proper error handling (no empty catch blocks)
   - Follow existing code patterns

2. **Testing**: Write tests for all new functionality
   - Unit tests for business logic
   - Integration tests for API endpoints
   - E2E tests for UI components (if applicable)

3. **Documentation**: Update relevant documentation
   - Code comments for complex logic
   - Update AGENTS.md if creating new components
   - Update README if changing user-facing features

4. **Validation**: Ensure all acceptance criteria are met
   - Each criterion must be verifiable
   - Prefer automated tests over manual validation
   - Document how to verify each criterion

## Expected Output

When complete, respond with:
- Summary of implementation
- Files created/modified
- How acceptance criteria are met
- Any blockers or concerns

Mark your response complete with:
🎯 COMPLETED: [Brief summary]
"

# Execute based on mode
if [ "$MODE" = "session" ]; then
    echo "Executing in session mode (small story)"

    # Use claude --print with continuation
    echo "$PROMPT" | claude --print --continue

elif [ "$MODE" = "task" ]; then
    echo "Executing in Task agent mode (large story)"

    # Create Task agent prompt
    TASK_PROMPT="Use the Task tool to spawn an 'engineer' agent to implement this story.

$PROMPT

Make sure the engineer agent has full context and can work autonomously."

    echo "$TASK_PROMPT" | claude --print

else
    echo "Unknown mode: $MODE"
    exit 1
fi

# After execution, run validation
echo ""
echo "Running validation gates..."
if bash "$SCRIPT_DIR/validation-runner.sh" "$PROJECT_DIR" "$STORY_ID"; then
    echo "All validation gates passed!"
    exit 0
else
    echo "Validation failed - story incomplete"
    exit 1
fi
