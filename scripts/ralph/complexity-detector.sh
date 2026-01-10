#!/usr/bin/env bash
#
# Complexity Detector - Determine if story should use session or Task agent
#
# Usage: bash complexity-detector.sh <project-dir> <story-id>
# Output: "session" or "task"
#

set -e

PROJECT_DIR="${1:-.}"
STORY_ID="$2"
PRD_FILE="$PROJECT_DIR/prd.json"

# Get story data
STORY=$(jq ".user_stories[] | select(.id == \"$STORY_ID\")" "$PRD_FILE")

# Extract fields
DESCRIPTION=$(echo "$STORY" | jq -r '.description // ""')
ACCEPTANCE_CRITERIA=$(echo "$STORY" | jq -r '.acceptance_criteria // [] | length')
COMPONENTS=$(echo "$STORY" | jq -r '.components_affected // []')
ESTIMATED_COMPLEXITY=$(echo "$STORY" | jq -r '.estimated_complexity // 0')

# Initialize score
SCORE=0

# Use estimated complexity if provided
if [ "$ESTIMATED_COMPLEXITY" != "0" ] && [ "$ESTIMATED_COMPLEXITY" != "null" ]; then
    SCORE=$ESTIMATED_COMPLEXITY
else
    # Calculate complexity score

    # Count step keywords in description
    STEP_KEYWORDS=("first" "then" "after" "next" "finally" "once" "when" "before")
    for keyword in "${STEP_KEYWORDS[@]}"; do
        if echo "$DESCRIPTION" | grep -qi "$keyword"; then
            SCORE=$((SCORE + 1))
        fi
    done

    # Add acceptance criteria count
    SCORE=$((SCORE + ACCEPTANCE_CRITERIA))

    # Component complexity
    if echo "$COMPONENTS" | jq -e 'contains(["ui"])' >/dev/null 2>&1; then
        SCORE=$((SCORE + 2))
    fi

    if echo "$COMPONENTS" | jq -e 'contains(["api"])' >/dev/null 2>&1; then
        SCORE=$((SCORE + 2))
    fi

    if echo "$COMPONENTS" | jq -e 'contains(["database"]) or contains(["db"])' >/dev/null 2>&1; then
        SCORE=$((SCORE + 3))
    fi

    # Refactor keyword
    if echo "$DESCRIPTION" | grep -qi "refactor"; then
        SCORE=$((SCORE + 5))
    fi

    # Multiple components
    COMPONENT_COUNT=$(echo "$COMPONENTS" | jq 'length')
    if [ "$COMPONENT_COUNT" -gt 2 ]; then
        SCORE=$((SCORE + 3))
    fi
fi

# Determine mode (threshold: 5)
if [ $SCORE -lt 5 ]; then
    echo "session"
else
    echo "task"
fi

# Output to stderr for debugging
>&2 echo "Complexity score: $SCORE (threshold: 5)"
