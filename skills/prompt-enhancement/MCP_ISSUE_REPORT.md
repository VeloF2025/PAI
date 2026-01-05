# MCP Server Template Parsing Issue

**Date**: 2026-01-04
**MCP Server**: claude-prompts v1.3.0
**Issue**: Handlebars template parsing failure with custom helpers

---

## Problem

All PAI enhancement prompts fail with parsing error:

```
Error: (unknown path) [Line 3, Column 51]
  unexpected token: #
```

## Root Cause

The MCP server cannot parse Handlebars templates that use custom helpers like `{{#eq}}`.

**Example from enhance_research_prompt.md (lines 28-32)**:
```handlebars
{{#if depth_level}}
{{#eq depth_level "extensive"}}
7. **Multi-Perspective Analysis**: Include diverse viewpoints and approaches
8. **Cross-Reference Requirements**: Specify fact-checking and verification needs
9. **Timeline Context**: Consider temporal aspects (current trends, historical context)
{{/eq}}
{{/if}}
```

The `{{#eq}}` helper is a custom Handlebars helper that the MCP server's Nunjucks parser doesn't recognize.

## Reproduction

```bash
# Test script that triggers the error
node tests/test-mcp-direct.js
```

**MCP Communication**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "prompt_engine",
    "arguments": {
      "command": ">>enhance_research_prompt short_prompt=\"test\" depth_level=\"extensive\""
    }
  }
}
```

**Response**:
```json
{
  "result": {
    "content": [{
      "type": "text",
      "text": "Error: (unknown path) [Line 3, Column 51]\n  unexpected token: #"
    }],
    "isError": true
  },
  "jsonrpc": "2.0",
  "id": 2
}
```

## Affected Prompts

All PAI enhancement prompts use this pattern:
- ✅ `>>listprompts` - Works (no templates)
- ❌ `>>enhance_research_prompt` - Fails (uses {{#eq}})
- ❌ `>>enhance_coding_prompt` - Fails (uses {{#eq}})
- ❌ `>>compress_prompt` - Fails (uses custom helpers)
- ❌ All other PAI prompts - Fail

## Successful MCP Communication

The MCP server itself works correctly:

✅ **Initialize**:
```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}
```

✅ **Response**:
```json
{
  "result": {
    "protocolVersion": "2024-11-05",
    "serverInfo": {
      "name": "claude-prompts-mcp",
      "version": "1.3.0"
    }
  }
}
```

✅ **List Prompts**:
```bash
mcp__claude-prompts__prompt_engine --command ">>listprompts"
# Returns full prompt library
```

## Impact on Testing

**Original Plan**:
- Test MCP enhancement tools directly
- Validate enhancement quality
- Measure performance

**Cannot Execute**:
- ❌ No way to call PAI enhancement prompts via MCP
- ❌ Cannot validate real enhancement quality
- ❌ Cannot measure actual performance

**Can Still Execute**:
- ✅ Token count validation (doesn't need MCP)
- ✅ Installation process testing (doesn't need MCP)
- ✅ Usability comparison (doesn't need MCP)
- ✅ Documentation structure analysis (doesn't need MCP)

## Workarounds Considered

### 1. Fix MCP Templates (REJECTED)
- Requires modifying claude-prompts-mcp server
- Out of scope for this testing
- Would need to convert {{#eq}} to Nunjucks syntax

### 2. Call Tools Directly (NOT POSSIBLE)
- MCP tools only accessible via MCP protocol
- No direct API to enhancement functions
- Claude Code MCP abstraction required

### 3. Mock Enhancement Quality (EXPLICITLY FORBIDDEN BY USER)
> "i wish you would get it in your head not to use stub data. it just makes everything worse."

### 4. Revised Test Strategy (ACCEPTED)
Focus on what CAN be measured without MCP:
- Documentation token counts (objective metric)
- Installation complexity (user testing)
- Progressive disclosure effectiveness (actual usage)
- Format comparison (old vs new)

## Revised Testing Approach

**What We Can Validate Without MCP**:

1. **Token Savings** ✅
   - Already measured: Pack v2.0 INCREASED tokens by 172.5%
   - Objective, measurable, no MCP needed

2. **Installation Complexity** ✅
   - Count steps required
   - Measure time to complete
   - Track error rates
   - User testing with real users

3. **Usability Comparison** ✅
   - A/B test: old format vs Pack v2.0
   - Measure task completion rates
   - Collect user preferences
   - Track confusion/questions

4. **Documentation Quality** ✅
   - Readability analysis
   - Structure comparison
   - Completeness check
   - Progressive disclosure effectiveness

**What We Cannot Validate**:
- ❌ MCP enhancement tool quality (templates broken)
- ❌ Actual enhancement performance (cannot call tools)
- ❌ Real-world enhancement examples (MCP inaccessible)

## Recommendation

**STOP attempting MCP-based testing**. The MCP server template parsing is broken and fixing it is out of scope.

**FOCUS on Pack v2.0 validation using measurable, objective criteria**:
1. Token counts (already shows Pack v2.0 made things worse)
2. User testing (A/B comparison of old vs new format)
3. Installation complexity (step counting, time tracking)
4. Usability metrics (task completion, user preference)

**These metrics are sufficient to make a data-driven decision** about whether Pack v2.0 provides value, without needing the broken MCP enhancement tools.

---

## Decision

Proceeding with **Alternative Validation Strategy** that doesn't rely on MCP tools.

Tests will focus on:
- ✅ Objective metrics (token counts, step counts)
- ✅ User experience (A/B testing, usability)
- ✅ Process efficiency (installation time, error rates)

This provides sufficient data to validate Pack v2.0 value proposition without the broken MCP server.
