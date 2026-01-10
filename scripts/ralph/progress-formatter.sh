#!/usr/bin/env bash
#
# Progress Formatter - Generate human-readable progress.txt
#
# Usage: bash progress-formatter.sh <project-dir>
#

set -e

PROJECT_DIR="${1:-.}"
PRD_FILE="$PROJECT_DIR/prd.json"
PROGRESS_FILE="$PROJECT_DIR/progress.txt"

# Get project name
PROJECT_NAME=$(jq -r '.project_name' "$PRD_FILE")

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Count stories by status
TOTAL=$(jq '.user_stories | length' "$PRD_FILE")
COMPLETED=$(jq '[.user_stories[] | select(.status == "completed")] | length' "$PRD_FILE")
IN_PROGRESS=$(jq '[.user_stories[] | select(.status == "in_progress")] | length' "$PRD_FILE")
PENDING=$(jq '[.user_stories[] | select(.status == "pending" or .status == null)] | length' "$PRD_FILE")

# Calculate progress percentage
if [ "$TOTAL" -gt 0 ]; then
    PROGRESS_PCT=$((COMPLETED * 100 / TOTAL))
else
    PROGRESS_PCT=0
fi

# Start building progress file
{
    echo "# $PROJECT_NAME - Progress"
    echo ""
    echo "Generated: $TIMESTAMP"
    echo ""
    echo "---"
    echo ""
    echo "## Stories"
    echo ""

    # List all stories with status
    jq -r '.user_stories[] | "\(.id)|\(.title)|\(.description)|\(.status // "pending")"' "$PRD_FILE" | while IFS='|' read -r id title description status; do
        # Choose icon based on status
        case "$status" in
            completed)
                icon="[✓]"
                ;;
            in_progress)
                icon="[⧗]"
                ;;
            *)
                icon="[☐]"
                ;;
        esac

        echo "$icon Story: $title"
        echo "   ID: $id"
        echo "   Description: $description"
        echo "   Status: $status"
        echo ""
    done

    echo "---"
    echo ""
    echo "## Summary"
    echo ""
    echo "Total stories: $TOTAL"
    echo "Completed: $COMPLETED"
    echo "In progress: $IN_PROGRESS"
    echo "Pending: $PENDING"
    echo "Progress: $PROGRESS_PCT%"
    echo ""

} > "$PROGRESS_FILE"

echo "Progress file updated: $PROGRESS_FILE"
