---
name: kai
triggers: ["kai bootstrap", "pai bootstrap", "bootstrap pai", "run hooks", "fix hooks"]
description: |
  PAI System Bootstrap & Status. TRIGGER: "kai bootstrap", "pai bootstrap"

  IMMEDIATE ACTION: Execute this exact Bash command and show its output:
  bun "C:/Users/HeinvanVuuren/.claude/hooks/pai-bootstrap-all.ts" start

  This runs all critical hooks since Claude Code's hook system is broken (Issue #11544).
  After bootstrap, run: bun "C:/Users/HeinvanVuuren/.claude/hooks/pai-status.ts"
---

# @Kai - PAI Bootstrap & Status

## On Invocation (ALWAYS DO THIS FIRST)

Run bootstrap to execute all critical hooks:

```bash
bun "C:/Users/HeinvanVuuren/.claude/hooks/pai-bootstrap-all.ts" start
```

Then show status:

```bash
bun "C:/Users/HeinvanVuuren/.claude/hooks/pai-status.ts"
```

## Context Management Commands

Since Claude Code hooks are broken (v2.0.37+, Issue #11544), use these manual commands:

### When Context Gets Large
```bash
bun "C:/Users/HeinvanVuuren/.claude/hooks/pai-bootstrap-all.ts" context
```
Or use `/compact` to compress context.

### Before Ending Session
```bash
bun "C:/Users/HeinvanVuuren/.claude/hooks/pai-bootstrap-all.ts" end
```
This saves session state and memories.

### Check Bootstrap Status
```bash
bun "C:/Users/HeinvanVuuren/.claude/hooks/pai-bootstrap-all.ts" status
```

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

## Default Coding Capabilities (Always Available)

Even without project-specific agents, these are ALWAYS available:

### Default Agents:
- `general-coder`: General-purpose coding for any language
- `code-reviewer`: Quality, security, and best practices review
- `test-generator`: Test generation for any framework
- `debugger`: Error analysis and fix suggestions

### Default Validation:
- DGTS threshold: 0.35
- NLNH confidence: 0.80
- Quality gates: NO_CONSOLE_LOG, PROPER_ERROR_HANDLING, TYPE_SAFETY

### Default MCP Usage:
- Use `context7` for any library documentation
- Use `memory` to recall patterns from past sessions
- Use `playwright` for UI testing
- Use `github` for repository operations

## MCP Server Troubleshooting

If MCP servers are disconnected after switching projects:

### Quick Fix
Run `/mcp` to see connection status and reconnect servers.

### Common Issues
1. **Servers show "configured" but tools fail**: Run `/mcp` to reconnect
2. **Missing environment variables**: Check `GITHUB_TOKEN`, API keys in settings.json
3. **HTTP servers (veritas) not running**: Start with docker compose
4. **Project servers not loading**: Ensure `enableAllProjectMcpServers: true` in settings.json

### Health Check
The bootstrap script runs MCP health checker automatically.

### Manual Diagnostics
Run detailed MCP diagnostics:
```bash
bun ~/.claude/hooks/mcp-reconnect.ts
```

## 🧠 Agent Expert System (NEW)

The bootstrap now includes **Agent Expert** hooks that enable self-learning:

### How It Works
1. **expert-load.ts** (Session Start) - Loads project's `expertise.yaml`
   - Injects key_locations, patterns, anti_patterns into context
   - Validates locations still exist in codebase
   - Agent reads mental model FIRST before acting

2. **expert-self-improve.ts** (Session End) - Updates expertise
   - Detects new directories from git changes
   - Auto-updates expertise.yaml with new locations
   - Bumps version, maintains update_history

### Creating Project Expertise
For new projects, create `.claude/expertise.yaml`:
```yaml
expertise:
  project: "project-name"
  domain: "web-app"
  version: 1
  key_locations:
    components: "src/components/"
    api: "api/"
  patterns:
    - name: "Pattern Name"
      when: "when to use it"
      example: |
        code example
  anti_patterns:
    - name: "Anti-pattern Name"
      why_bad: "why it's bad"
      what_to_do: "what to do instead"
```

Template: `~/.claude/expertise/templates/project-expert.yaml`

## Script Locations

- Bootstrap (hooks workaround): `~/.claude/hooks/pai-bootstrap-all.ts`
- Status checker: `~/.claude/hooks/pai-status.ts`
- Expert load: `~/.claude/hooks/expert-load.ts`
- Expert self-improve: `~/.claude/hooks/expert-self-improve.ts`
- Expertise template: `~/.claude/expertise/templates/project-expert.yaml`
- Default config: `~/.claude/config/default-coding-assistant.yaml`
- Cross-project knowledge: `~/.claude/knowledge/cross-project/`

---

## 🚫 NO MOCK/STUB/DEMO STANDARD (MANDATORY)

**BLOCKING RULE**: Phases cannot complete with mock data.
**APPLIES**: FROM THE START - Including planning, TDD, all phases.

### Before Marking Phase Complete
```bash
bun ~/.claude/hooks/no-mock-validator.ts
```

**Requirements**:
1. ALL violations must be resolved (ZERO TOLERANCE)
2. Seed script must exist for database projects
3. Validator must exit code 0

### Acceptable Data Sources
- Database queries (seeded data via `npm run db:seed`)
- Real API endpoints
- User input / form data
- Environment variables

### NOT Acceptable (BLOCKS Phase)
- `mockData`, `demoData`, `sampleData`, `fakeData`
- Hardcoded placeholder values (`John Doe`, `test@test.com`, `lorem ipsum`)
- `faker.js` in production code (only allowed in seed/)
- Mock API endpoints (`/api/mock/`, `/api/stub/`)
- `TODO: implement later`, `Not implemented` errors

### TDD with Real Data
Tests must use seeded database data, NOT mock fixtures:

```typescript
// FORBIDDEN
const mockUser = { id: 1, name: 'Test User' };

// REQUIRED
beforeAll(async () => await runSeed());
const user = await db.query.users.findFirst();
```

### Seed Script Requirement
Database projects MUST have:
```json
{
  "scripts": {
    "db:seed": "bun run seed.ts"
  }
}
```

**Protocol**: `~/.claude/protocols/no-mock-production.md`

---

**Note:** This skill works around Claude Code's broken hooks system by manually running critical hooks on invocation. The Agent Expert hooks enable self-learning per-project expertise.
