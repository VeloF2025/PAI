#!/usr/bin/env bash
#
# Ralph - Autonomous Coding Loop for PAI
# Adapted from https://github.com/snarktank/ralph for Claude Code CLI
#
# Usage: bash ralph.sh [project-dir] [options]
#

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
CHECK="✅"
CROSS="❌"
GEAR="⚙️"
MAGNIFY="🔍"
PENCIL="📝"
ROBOT="🤖"
PARTY="🎉"
WARNING="⚠️"
CLOCK="⏱️"

# Configuration
PROJECT_DIR="${1:-.}"
MAX_ITERATIONS="${RALPH_MAX_ITERATIONS:-100}"
TIMEOUT_PER_STORY="${RALPH_STORY_TIMEOUT:-1800}"  # 30 minutes default
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Resolve absolute path
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"

# Ralph state directory
RALPH_DIR="$PROJECT_DIR/.ralph"
mkdir -p "$RALPH_DIR/logs"

# File paths
PRD_FILE="$PROJECT_DIR/prd.json"
PROGRESS_FILE="$PROJECT_DIR/progress.txt"
CONTEXT_FILE="$RALPH_DIR/context.json"
STORIES_FILE="$RALPH_DIR/stories.json"

# Check dependencies
check_dependencies() {
    local missing=()

    command -v claude >/dev/null 2>&1 || missing+=("claude")
    command -v jq >/dev/null 2>&1 || missing+=("jq")
    command -v git >/dev/null 2>&1 || missing+=("git")
    command -v node >/dev/null 2>&1 || missing+=("node")
    command -v python >/dev/null 2>&1 || missing+=("python")

    if [ ${#missing[@]} -gt 0 ]; then
        echo -e "${RED}${CROSS} Missing required dependencies: ${missing[*]}${NC}"
        echo "Please install missing tools and try again."
        exit 1
    fi
}

# Initialize context file if it doesn't exist
init_context() {
    if [ ! -f "$CONTEXT_FILE" ]; then
        cat > "$CONTEXT_FILE" <<EOF
{
  "last_story_id": null,
  "files_changed": [],
  "last_commit": null,
  "key_decisions": [],
  "patterns_established": [],
  "blockers": []
}
EOF
    fi
}

# Read PRD and validate
read_prd() {
    if [ ! -f "$PRD_FILE" ]; then
        echo -e "${RED}${CROSS} PRD file not found: $PRD_FILE${NC}"
        echo "Please create prd.json in your project root."
        exit 1
    fi

    # Validate JSON
    if ! jq empty "$PRD_FILE" 2>/dev/null; then
        echo -e "${RED}${CROSS} Invalid JSON in $PRD_FILE${NC}"
        exit 1
    fi

    # Check required fields
    local project_name=$(jq -r '.project_name // empty' "$PRD_FILE")
    local user_stories=$(jq -r '.user_stories // empty' "$PRD_FILE")

    if [ -z "$project_name" ] || [ -z "$user_stories" ]; then
        echo -e "${RED}${CROSS} PRD must contain 'project_name' and 'user_stories'${NC}"
        exit 1
    fi

    echo -e "${GREEN}${CHECK} PRD validated: $project_name${NC}"
}

# Get pending stories
get_pending_stories() {
    jq -r '.user_stories[] | select(.status == "pending" or .status == null) | .id' "$PRD_FILE"
}

# Get story by ID
get_story() {
    local story_id="$1"
    jq ".user_stories[] | select(.id == \"$story_id\")" "$PRD_FILE"
}

# Update story status
update_story_status() {
    local story_id="$1"
    local status="$2"

    # Create temporary file
    local tmp_file=$(mktemp)

    # Update status in PRD
    jq "(.user_stories[] | select(.id == \"$story_id\") | .status) = \"$status\"" "$PRD_FILE" > "$tmp_file"
    mv "$tmp_file" "$PRD_FILE"
}

# Format progress output
format_progress() {
    bash "$SCRIPT_DIR/progress-formatter.sh" "$PROJECT_DIR"
}

# Main Ralph loop
main() {
    echo -e "${CYAN}${ROCKET} Ralph Starting${NC}"
    echo -e "${BLUE}Project: $(jq -r '.project_name' "$PRD_FILE")${NC}"
    echo -e "${BLUE}Directory: $PROJECT_DIR${NC}"
    echo ""

    check_dependencies
    init_context
    read_prd

    local iteration=0
    local stories_completed=0
    local stories_failed=0

    while [ $iteration -lt $MAX_ITERATIONS ]; do
        iteration=$((iteration + 1))

        # Get pending stories
        local pending_stories=($(get_pending_stories))

        if [ ${#pending_stories[@]} -eq 0 ]; then
            echo -e "${GREEN}${PARTY} All stories complete!${NC}"
            break
        fi

        echo -e "${YELLOW}${MAGNIFY} Iteration $iteration - ${#pending_stories[@]} stories pending${NC}"
        echo ""

        # Process each pending story
        for story_id in "${pending_stories[@]}"; do
            local story=$(get_story "$story_id")
            local story_title=$(echo "$story" | jq -r '.title')

            echo -e "${CYAN}${PENCIL} Story $story_id: $story_title${NC}"

            # Update status to in_progress
            update_story_status "$story_id" "in_progress"

            # Execute story
            local log_file="$RALPH_DIR/logs/${story_id}.log"

            if bash "$SCRIPT_DIR/story-executor.sh" "$PROJECT_DIR" "$story_id" > "$log_file" 2>&1; then
                echo -e "${GREEN}${CHECK} Story $story_id COMPLETE!${NC}"
                update_story_status "$story_id" "completed"
                stories_completed=$((stories_completed + 1))

                # Update context
                bash "$SCRIPT_DIR/context-builder.sh" "$PROJECT_DIR" "$story_id"

                # Update progress file
                format_progress

            else
                echo -e "${RED}${CROSS} Story $story_id FAILED${NC}"
                echo -e "${YELLOW}See log: $log_file${NC}"
                update_story_status "$story_id" "pending"
                stories_failed=$((stories_failed + 1))
            fi

            echo ""
        done

        echo -e "${BLUE}Iteration $iteration complete${NC}"
        echo ""
    done

    if [ $iteration -ge $MAX_ITERATIONS ]; then
        echo -e "${YELLOW}${WARNING} Max iterations ($MAX_ITERATIONS) reached${NC}"
    fi

    # Final summary
    echo -e "${CYAN}=====================================${NC}"
    echo -e "${GREEN}${PARTY} Ralph Complete!${NC}"
    echo -e "${BLUE}Iterations: $iteration${NC}"
    echo -e "${GREEN}Completed: $stories_completed${NC}"
    echo -e "${RED}Failed: $stories_failed${NC}"
    echo -e "${CYAN}=====================================${NC}"

    # Show final progress
    if [ -f "$PROGRESS_FILE" ]; then
        echo ""
        cat "$PROGRESS_FILE"
    fi
}

# Run main
main "$@"
