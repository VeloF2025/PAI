#!/usr/bin/env bash
#
# Context Builder - Build context handover for next iteration
#
# Usage: bash context-builder.sh <project-dir> <story-id>
#

set -e

PROJECT_DIR="${1:-.}"
STORY_ID="$2"

# Files
CONTEXT_FILE="$PROJECT_DIR/.ralph/context.json"
PRD_FILE="$PROJECT_DIR/prd.json"

# Get story
STORY=$(jq ".user_stories[] | select(.id == \"$STORY_ID\")" "$PRD_FILE")
STORY_TITLE=$(echo "$STORY" | jq -r '.title')

# Get current context
CONTEXT=$(cat "$CONTEXT_FILE")

# Get files changed (via git)
cd "$PROJECT_DIR"
FILES_CHANGED=$(git diff --name-only HEAD~1 HEAD 2>/dev/null | jq -R . | jq -s . || echo "[]")

# Get last commit message
LAST_COMMIT=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "No commit")

# Extract key decisions from implementation
# This is a simple heuristic - could be enhanced with AI analysis
KEY_DECISIONS=()

# Check for new dependencies
if git diff HEAD~1 HEAD package.json 2>/dev/null | grep -q "^+.*\"dependencies\""; then
    KEY_DECISIONS+=("DECISION: Added new dependencies - check package.json")
fi

# Check for new components/services
if echo "$FILES_CHANGED" | jq -r '.[]' | grep -q "components/.*\.tsx"; then
    KEY_DECISIONS+=("IMPLEMENTED: New React components in components/")
fi

if echo "$FILES_CHANGED" | jq -r '.[]' | grep -q "api/.*\.ts"; then
    KEY_DECISIONS+=("IMPLEMENTED: New API endpoints in api/")
fi

# Convert to JSON array
KEY_DECISIONS_JSON=$(printf '%s\n' "${KEY_DECISIONS[@]}" | jq -R . | jq -s .)

# Extract patterns established
PATTERNS=()

# TypeScript patterns
if echo "$FILES_CHANGED" | jq -r '.[]' | grep -q "\.tsx\?$"; then
    PATTERNS+=("All TypeScript files use strict mode")
fi

# API patterns
if echo "$FILES_CHANGED" | jq -r '.[]' | grep -q "api/"; then
    PATTERNS+=("API routes follow RESTful conventions")
fi

# Convert to JSON array
PATTERNS_JSON=$(printf '%s\n' "${PATTERNS[@]}" | jq -R . | jq -s .)

# Build new context
NEW_CONTEXT=$(jq -n \
    --arg story_id "$STORY_ID" \
    --argjson files "$FILES_CHANGED" \
    --arg commit "$LAST_COMMIT" \
    --argjson decisions "$KEY_DECISIONS_JSON" \
    --argjson patterns "$PATTERNS_JSON" \
    '{
        last_story_id: $story_id,
        files_changed: $files,
        last_commit: $commit,
        key_decisions: $decisions,
        patterns_established: $patterns,
        blockers: []
    }')

# Merge with existing context (keep accumulating decisions and patterns)
EXISTING_DECISIONS=$(echo "$CONTEXT" | jq -r '.key_decisions // []')
EXISTING_PATTERNS=$(echo "$CONTEXT" | jq -r '.patterns_established // []')

MERGED_CONTEXT=$(echo "$NEW_CONTEXT" | jq \
    --argjson existing_decisions "$EXISTING_DECISIONS" \
    --argjson existing_patterns "$EXISTING_PATTERNS" \
    '.key_decisions = ($existing_decisions + .key_decisions) |
     .patterns_established = ($existing_patterns + .patterns_established) |
     .key_decisions |= unique |
     .patterns_established |= unique')

# Write updated context
echo "$MERGED_CONTEXT" | jq . > "$CONTEXT_FILE"

echo "Context updated for story: $STORY_ID"
