# Kai - PAI Session Activation Skill

## Triggers
- `@Kai` - Activate/refresh PAI session
- `@kai` - Activate/refresh PAI session
- `@Pai` - Activate/refresh PAI session
- `@pai` - Activate/refresh PAI session
- `Kai` - Activate/refresh PAI session (when used as greeting/call)

## Purpose
Manually trigger PAI session initialization and context refresh. Use this when:
- Starting a new conversation and want to ensure PAI context is loaded
- Need to refresh/reload the PAI core context mid-session
- Want to verify all PAI systems are active

## Activation Behavior

When triggered, this skill will:

1. **Reload Core Context** - Re-inject PAI SKILL.md content from `$PAI_DIR/skills/CORE/SKILL.md`
2. **Verify Hook Status** - Check that stop-hook and other hooks are properly configured
3. **Set Tab Title** - Update terminal tab to show "$DA Ready"
4. **Send Voice Notification** - If voice server is running, announce readiness
5. **Confirm Activation** - Report status to user

## Quick Response Template

When user calls @Kai or @Pai, respond with:

```
Hey! PAI systems refreshed and ready. What would you like to work on?
```

If there are issues, report them clearly:

```
PAI refresh completed with warnings:
- [List any issues]

Still ready to help - what do you need?
```

## Manual Hook Execution

To manually run PAI hooks (if needed for debugging):

```bash
# Load core context
bun "$PAI_DIR/hooks/load-core-context.ts"

# Initialize session
bun "$PAI_DIR/hooks/initialize-pai-session.ts"
```

## Environment Variables Used
- `DA` - AI assistant name (e.g., "Kai", "Jarvis")
- `PAI_DIR` - Path to PAI directory (default: ~/.claude)
- `DA_VOICE_ID` - ElevenLabs voice ID for notifications

## 🔄 Standard Development Workflow (MANDATORY)

When building features or implementing plans, follow this validation workflow:

### During Build (Per Feature)
After implementing each feature/component:
1. **Playwright MCP Validation** - Use `mcp__playwright__*` tools to verify the feature works in browser
   ```
   - mcp__playwright__browser_navigate to the feature URL
   - mcp__playwright__browser_snapshot to capture current state
   - mcp__playwright__browser_click / browser_type to test interactions
   - Verify expected behavior matches implementation
   ```

2. **UI/UX Design Validation** - If feature has UI components:
   - Use `designer` agent to review visual implementation
   - Validate against any design specs provided
   - Check spacing, typography, alignment, responsiveness
   - Ensure accessibility standards (contrast, focus states, ARIA)

### End of Phase Validation
Before marking a phase complete:
1. **Full E2E Test Suite** - Run Playwright across all new features
2. **Design System Audit** - Designer agent reviews overall consistency
3. **Cross-browser Check** - Test in different viewports using browser_resize

### Validation Commands
```bash
# Quick feature validation
mcp__playwright__browser_navigate → URL
mcp__playwright__browser_snapshot → Capture state

# Full phase validation
Task(designer) → "Review UI implementation against design specs"
mcp__playwright__browser_snapshot → Document final state
```

**Note:** This is STANDARD for all dev plans - not optional.

---

## Notes
- SessionStart hooks run automatically on new sessions
- This skill is for manual refresh/re-activation mid-session
- Subagent sessions skip PAI initialization automatically
