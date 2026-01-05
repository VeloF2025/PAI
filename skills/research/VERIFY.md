# Research Pack - Verification Checklist

**Pack Version**: 2.0
**Verification Date**: 2026-01-03
**Purpose**: Verify correct installation and functionality of Research Pack

---

## Overview

This verification checklist ensures the Research Pack is properly installed and all three research modes (Quick, Standard, Extensive) function correctly. Work through each section systematically.

**Estimated Time**: 20-30 minutes

---

## 1. File Verification

### 1.1 Core Pack Files

Verify all Pack v2.0 files exist:

```bash
cd ~/.claude/skills/research/  # macOS/Linux
cd $env:PAI_DIR/skills/research/  # Windows PowerShell

# Check core pack files
ls -la PACK_README.md
ls -la PACK_INSTALL.md
ls -la PACK_VERIFY.md
ls -la SKILL.md
```

**Expected Output**:
```
-rw-r--r--  PACK_README.md  (~30KB)
-rw-r--r--  PACK_INSTALL.md (~25KB)
-rw-r--r--  PACK_VERIFY.md  (this file)
-rw-r--r--  SKILL.md        (~6KB)
```

**Status**: ☐ Pass ☐ Fail

---

### 1.2 Workflows Directory

Verify workflow documentation exists:

```bash
cd ~/.claude/skills/research/

# Check workflows directory
ls -la workflows/

# Verify conduct workflow
cat workflows/conduct.md | head -20
```

**Expected Output**:
```
drwxr-xr-x  workflows/
-rw-r--r--  workflows/conduct.md  (~24KB)

# 🔬 COMPREHENSIVE RESEARCH WORKFLOW FOR KAI
**YOU (Kai) are reading this because a research request was detected...**
```

**Status**: ☐ Pass ☐ Fail

---

### 1.3 Scratchpad and History Directories

Verify working directories exist:

```bash
# Check scratchpad directory
ls -la "$PAI_DIR/scratchpad"

# Check history/research directory
ls -la "$PAI_DIR/history/research"
```

**Expected Output**:
```
drwxr-xr-x  scratchpad/
drwxr-xr-x  history/research/
```

**Status**: ☐ Pass ☐ Fail

---

## 2. Environment Variable Verification

### 2.1 PAI_DIR Configuration

Verify PAI_DIR environment variable:

```bash
# Check PAI_DIR is set
echo $PAI_DIR  # macOS/Linux
echo $env:PAI_DIR  # Windows PowerShell

# Verify directory exists
ls -la "$PAI_DIR"
```

**Expected Output**:
```
/home/username/.claude  # or C:\Users\YourName\.claude
drwxr-xr-x  skills/
drwxr-xr-x  scratchpad/
drwxr-xr-x  history/
```

**Status**: ☐ Pass ☐ Fail

---

### 2.2 API Keys Configuration

Verify all three API keys are set:

```bash
# Check Anthropic API key (don't print full key)
echo $ANTHROPIC_API_KEY | cut -c1-10  # macOS/Linux
echo $env:ANTHROPIC_API_KEY.Substring(0,10)  # Windows PowerShell

# Check Perplexity API key
echo $PERPLEXITY_API_KEY | cut -c1-10

# Check Gemini API key
echo $GEMINI_API_KEY | cut -c1-10
```

**Expected Output**:
```
sk-ant-ap  (Anthropic key prefix)
pplx-      (Perplexity key prefix)
AIza       (Gemini key prefix)
```

**Status**: ☐ Pass ☐ Fail

---

## 3. Research Skill Loading

### 3.1 Skill Metadata

Verify research skill metadata:

```bash
# Check skill metadata
cat ~/.claude/skills/research/SKILL.md | head -10

# Verify skill name and description
grep "^name:" ~/.claude/skills/research/SKILL.md
grep "^description:" ~/.claude/skills/research/SKILL.md
```

**Expected Output**:
```markdown
---
name: research
description: Multi-source comprehensive research using perplexity-researcher, claude-researcher, and gemini-researcher agents. Three modes - Quick (3 agents), Standard (9 agents), Extensive (24 agents with be-creative skill).
---
```

**Status**: ☐ Pass ☐ Fail

---

### 3.2 Skill Triggers

Verify trigger keywords are documented:

```bash
# Check trigger keywords
grep -i "USE WHEN" ~/.claude/skills/research/SKILL.md
```

**Expected Triggers**:
- "do research"
- "quick research"
- "extensive research"
- "find information about"
- "investigate"
- "analyze trends"
- "current events"

**Status**: ☐ Pass ☐ Fail

---

## 4. Research Mode Configuration

### 4.1 Three Research Modes Documented

Verify all three modes are documented:

```bash
# Check for mode descriptions
grep -A 3 "QUICK RESEARCH MODE" ~/.claude/skills/research/SKILL.md
grep -A 3 "STANDARD RESEARCH MODE" ~/.claude/skills/research/SKILL.md
grep -A 3 "EXTENSIVE RESEARCH MODE" ~/.claude/skills/research/SKILL.md
```

**Expected Modes**:
- **Quick**: 3 agents (1 of each type), 2 minute timeout
- **Standard**: 9 agents (3 of each type), 3 minute timeout
- **Extensive**: 24 agents (8 of each type), 10 minute timeout

**Status**: ☐ Pass ☐ Fail

---

### 4.2 Timeout Configuration

Verify timeout values:

```bash
# Check timeout values
grep -i "timeout" ~/.claude/skills/research/SKILL.md | head -10
```

**Expected Timeouts**:
- Quick: 2 minutes
- Standard: 3 minutes
- Extensive: 10 minutes

**Status**: ☐ Pass ☐ Fail

---

## 5. Agent Availability Verification

### 5.1 Check Research Agent Types

Verify research agent types are available:

**Manual Check in Claude Code**:
1. Start Claude Code session: `claude`
2. Check if agents can be spawned (implementation-specific)
3. Verify agent types: perplexity-researcher, claude-researcher, gemini-researcher

**Expected Agent Types**:
- perplexity-researcher
- claude-researcher
- gemini-researcher

**Status**: ☐ Pass ☐ Fail ☐ Partial (some agents unavailable)

**Note**: If some agents unavailable, research skill can still function with reduced agent count.

---

## 6. Functional Testing - Quick Research Mode

### 6.1 Test Quick Research (3 agents)

**Execute Quick Research test:**

```bash
# Start Claude Code session
claude

# In Claude Code, type:
# "Quick research: When was TypeScript first released?"
```

**Expected Behavior**:
1. Research skill activates
2. Mode selected: Quick (3 agents)
3. Query decomposition: 3 sub-questions generated
4. Agents launch in parallel:
   - 1 perplexity-researcher
   - 1 claude-researcher
   - 1 gemini-researcher
5. Agents execute concurrently
6. Results return within 2 minutes (typically 15-30 seconds)
7. Synthesis produces report with:
   - Executive summary
   - Key findings with confidence scores
   - Sources cited
   - Answer to original question

**Expected Answer**: TypeScript was first released in October 2012 by Microsoft

**Verification Checks**:
- [ ] All 3 agents launched successfully
- [ ] Results returned within timeout (2 minutes)
- [ ] Report includes answer with sources
- [ ] Confidence scores assigned (e.g., 95%+)
- [ ] No API authentication errors
- [ ] Scratchpad directory created with timestamp

**Status**: ☐ Pass ☐ Fail ☐ Partial

---

### 6.2 Verify Quick Research Scratchpad Output

**Check scratchpad directory was created:**

```bash
# List recent scratchpad directories
ls -lt "$PAI_DIR/scratchpad/" | head -5

# Navigate to most recent research directory
cd "$PAI_DIR/scratchpad/"/*research-*/

# Check structure
ls -la
```

**Expected Structure**:
```
scratchpad/YYYY-MM-DD-HHMMSS_research-typescript/
├── raw-outputs/
│   ├── perplexity-001.md
│   ├── claude-001.md
│   └── gemini-001.md
├── synthesis-notes.md (optional)
├── query-decomposition.md (optional)
└── draft-report.md (optional)
```

**Status**: ☐ Pass ☐ Fail

---

## 7. Functional Testing - Standard Research Mode

### 7.1 Test Standard Research (9 agents - Default)

**Execute Standard Research test:**

```bash
# In Claude Code
"Research the benefits and challenges of solar energy"
```

**Expected Behavior**:
1. Research skill activates
2. Mode selected: Standard (9 agents) - default
3. Query decomposition: 9 sub-questions generated
4. Agents launch in parallel:
   - 3 perplexity-researcher
   - 3 claude-researcher
   - 3 gemini-researcher
5. Agents execute concurrently
6. Results return within 3 minutes (typically 30-90 seconds)
7. Comprehensive report with:
   - Executive summary
   - Multiple findings per sub-question
   - Confidence scores (likely 80-95% for consensus)
   - Detailed source citations
   - Multi-perspective analysis

**Verification Checks**:
- [ ] All 9 agents launched successfully
- [ ] Results returned within timeout (3 minutes)
- [ ] Report comprehensive (multiple findings)
- [ ] Multi-perspective analysis present
- [ ] Sources from all three agent types
- [ ] Synthesis identifies consensus and conflicts
- [ ] Scratchpad directory created

**Status**: ☐ Pass ☐ Fail ☐ Partial

---

### 7.2 Verify Standard Research Quality

**Assess research report quality:**

**Quality Indicators**:
- [ ] Multiple perspectives covered (benefits AND challenges)
- [ ] Findings categorized logically
- [ ] Confidence scores reflect source agreement
- [ ] Conflicting information identified and noted
- [ ] Sources are recent and credible
- [ ] Executive summary captures key points
- [ ] Detailed analysis goes deeper than summary

**Status**: ☐ High Quality ☐ Acceptable ☐ Needs Improvement

---

## 8. Functional Testing - Extensive Research Mode

### 8.1 Test Extensive Research (24 agents)

**Execute Extensive Research test:**

```bash
# In Claude Code
"Do extensive research on the future of artificial general intelligence (AGI)"
```

**Expected Behavior**:
1. Research skill activates
2. Mode selected: Extensive (24 agents)
3. **be-creative skill activates** (if installed):
   - UltraThink process begins
   - 24 diverse research angles generated
   - Queries organized into 3 groups of 8
4. Query decomposition: 24 unique sub-questions
5. Agents launch in parallel:
   - 8 perplexity-researcher
   - 8 claude-researcher
   - 8 gemini-researcher
6. Agents execute concurrently
7. Results return within 10 minutes (typically 45-180 seconds)
8. Exhaustive multi-section report with:
   - Comprehensive executive summary
   - Multiple findings per sub-question
   - Cross-domain analysis
   - Unusual perspectives explored
   - Confidence scores with high coverage
   - Extensive source citations
   - Gap analysis for follow-up research

**Verification Checks**:
- [ ] All 24 agents launched successfully
- [ ] be-creative skill activated (if installed)
- [ ] Query diversity evident (unusual angles explored)
- [ ] Results returned within timeout (10 minutes)
- [ ] Report exhaustive (multi-section, comprehensive)
- [ ] Cross-domain connections made
- [ ] Sources highly diverse
- [ ] Scratchpad has 24 raw output files

**Status**: ☐ Pass ☐ Fail ☐ Partial ☐ Skipped (be-creative not installed)

---

### 8.2 Verify be-creative Integration (If Installed)

**Check be-creative skill was used:**

```bash
# Check if be-creative skill exists
ls -la "$PAI_DIR/skills/be-creative/"

# Review query decomposition in scratchpad
cat "$PAI_DIR/scratchpad/"/*research-*/query-decomposition.md
```

**Expected Indicators**:
- UltraThink process evident in query decomposition
- Queries explore unusual perspectives
- Cross-disciplinary angles present
- Questions go beyond obvious/surface-level
- Evidence of creative thinking in query formulation

**Status**: ☐ Pass ☐ Fail ☐ Skipped (be-creative not installed)

---

## 9. Timeout and Partial Results Testing

### 9.1 Test Timeout Enforcement

**Verify timeout handling (optional advanced test):**

**Approach**: Simulate slow agent responses by testing with complex query

```bash
# In Claude Code
"Quick research: [complex multi-part question requiring extensive search]"
```

**Observe Behavior**:
- After 2 minutes (Quick mode timeout), check if:
  - Main Kai stops waiting for stragglers
  - Synthesis proceeds with available results
  - Report notes which agents completed vs timed out
  - Confidence scores reflect partial coverage

**Expected Timeout Behavior**:
- ✅ Timeout enforced at correct interval
- ✅ Synthesis proceeds with partial results
- ✅ Report notes completion rate (e.g., "7/9 agents completed")
- ✅ Confidence scores adjusted for coverage level
- ✅ No indefinite waiting for slow agents

**Status**: ☐ Pass ☐ Fail ☐ Skipped (optional test)

---

## 10. Scratchpad → History Migration

### 10.1 Test History Archiving

**Manually archive a research project:**

```bash
# Navigate to a scratchpad research directory
cd "$PAI_DIR/scratchpad/"/*research-*/

# Create history archive directory
TOPIC="solar-energy"  # Use actual topic
DATE=$(date +%Y-%m-%d)
mkdir -p "$PAI_DIR/history/research/${DATE}_${TOPIC}"

# Copy final deliverables to history
cp draft-report.md "$PAI_DIR/history/research/${DATE}_${TOPIC}/research-report.md"

# Create README.md for archive
cat > "$PAI_DIR/history/research/${DATE}_${TOPIC}/README.md" << EOF
# Research: Solar Energy

**Date:** ${DATE}
**Research Mode:** Standard
**Agents Used:** 3 perplexity, 3 claude, 3 gemini

## Research Question
What are the benefits and challenges of solar energy?

## Key Findings
- [List key findings from report]

## Output Files
- research-report.md: Full comprehensive report

## Notes
[Any limitations or follow-up needed]
EOF

# Verify archive created
ls -la "$PAI_DIR/history/research/${DATE}_${TOPIC}/"
```

**Expected Archive Structure**:
```
history/research/YYYY-MM-DD_solar-energy/
├── README.md
└── research-report.md
```

**Status**: ☐ Pass ☐ Fail

---

## 11. Performance Verification

### 11.1 Speed Benchmarks

**Measure actual research speed:**

| Mode | Expected Time | Actual Time | Status |
|------|---------------|-------------|---------|
| Quick (3 agents) | 15-30 seconds | _____ seconds | ☐ Pass ☐ Slow |
| Standard (9 agents) | 30-90 seconds | _____ seconds | ☐ Pass ☐ Slow |
| Extensive (24 agents) | 45-180 seconds | _____ seconds | ☐ Pass ☐ Slow |

**Performance Assessment**:
- Fast: Within expected time range
- Acceptable: Up to 2x expected time
- Slow: More than 2x expected time (investigate timeout/network issues)

**Status**: ☐ Fast ☐ Acceptable ☐ Slow

---

### 11.2 API Cost Tracking

**Monitor API usage for sample research:**

**Track Costs**:
1. Note API balances before test (Anthropic, Perplexity, Gemini dashboards)
2. Execute Standard Research test
3. Note API balances after test
4. Calculate cost per research request

**Expected Costs** (approximate):
- Quick: $0.10-0.30
- Standard: $0.30-1.00
- Extensive: $1.00-3.00

**Actual Costs**:
- Quick: $______
- Standard: $______
- Extensive: $______

**Status**: ☐ Within Expected ☐ Higher Than Expected ☐ Not Tracked

---

## 12. Integration Verification

### 12.1 Claude Code Integration

**Verify research skill integrates with Claude Code:**

**Manual Verification**:
1. Start Claude Code session
2. Say: "Do research on X"
3. Observe skill activation
4. Verify seamless integration (no manual steps required)
5. Check report appears in conversation

**Expected Behavior**:
- Research skill auto-activates on trigger keywords
- User doesn't need to manually invoke skill
- Workflow transparent to user
- Results integrated into conversation naturally

**Status**: ☐ Pass ☐ Fail

---

### 12.2 PAI Skills Compatibility

**Test integration with other PAI skills:**

**Test Scenarios**:

1. **Research + fabric**: "Research X and create threat model using fabric"
   - Expected: Research completes, then fabric processes results

2. **Research + CORE**: Full PAI context loaded during research
   - Expected: Research uses PAI preferences (if any)

3. **Research + be-creative** (Extensive Mode): Already tested above
   - Expected: be-creative generates diverse queries

**Status**: ☐ Pass ☐ Fail ☐ Partially Compatible

---

## 13. Edge Cases and Error Handling

### 13.1 Test with Missing API Key

**Temporarily unset one API key:**

```bash
# Backup and unset Gemini key
GEMINI_BACKUP=$GEMINI_API_KEY
unset GEMINI_API_KEY

# Try research
# In Claude Code: "Quick research: test query"

# Observe behavior
# Restore key
export GEMINI_API_KEY=$GEMINI_BACKUP
```

**Expected Behavior**:
- Gemini agents fail gracefully
- Perplexity and Claude agents continue
- Synthesis proceeds with 2/3 agents
- Report notes Gemini unavailable
- Confidence scores adjusted

**Status**: ☐ Pass ☐ Fail ☐ Skipped

---

### 13.2 Test with Network Failure Simulation

**Test handling of API failures:**

**Approach**: Use invalid API key temporarily

```bash
# Backup and invalidate Perplexity key
PERPLEXITY_BACKUP=$PERPLEXITY_API_KEY
export PERPLEXITY_API_KEY="invalid-key-12345"

# Try research
# In Claude Code: "Quick research: test query"

# Observe error handling
# Restore key
export PERPLEXITY_API_KEY=$PERPLEXITY_BACKUP
```

**Expected Behavior**:
- Perplexity agents fail with authentication error
- Error logged clearly (not crash)
- Other agents continue
- Synthesis proceeds with partial results
- Report notes Perplexity failures

**Status**: ☐ Pass ☐ Fail ☐ Skipped

---

### 13.3 Test with Ambiguous Research Query

**Test query decomposition with vague query:**

```bash
# In Claude Code
"Research stuff about technology"
```

**Expected Behavior**:
- Skill activates
- Query decomposition attempts to clarify
- May ask user for clarification (optional)
- Or: Makes reasonable assumptions and proceeds
- Results may be broader/less focused

**Status**: ☐ Pass (handles gracefully) ☐ Fail (crashes or errors)

---

## 14. Security Verification

### 14.1 API Key Security

**Verify API keys not exposed:**

```bash
# Check no API keys in files
grep -r "sk-ant" "$PAI_DIR/skills/research/" || echo "✓ No Anthropic keys in files"
grep -r "pplx-" "$PAI_DIR/skills/research/" || echo "✓ No Perplexity keys in files"
grep -r "AIza" "$PAI_DIR/skills/research/" || echo "✓ No Gemini keys in files"

# Check API keys only in environment
env | grep API_KEY | cut -c1-30
```

**Expected**:
- ✅ No API keys hardcoded in skill files
- ✅ Keys only in environment variables
- ✅ Keys not logged to scratchpad/history

**Status**: ☐ Pass ☐ Fail

---

### 14.2 Data Privacy

**Verify research data handling:**

**Check**:
- [ ] Research outputs stored locally (scratchpad/history)
- [ ] No sensitive data in API requests (review query decomposition)
- [ ] Archive directories have correct permissions (not world-readable)

```bash
# Check permissions on history directory
ls -la "$PAI_DIR/history/research/"

# Should be: drwx------ (700) or drwxr-x--- (750)
# NOT: drwxrwxrwx (777)
```

**Status**: ☐ Pass ☐ Fail

---

## 15. Documentation Verification

### 15.1 README Completeness

**Verify PACK_README.md is comprehensive:**

```bash
# Check section headers
grep "^##" ~/.claude/skills/research/PACK_README.md

# Verify key sections exist
grep -q "Architecture" ~/.claude/skills/research/PACK_README.md && echo "✓ Architecture section exists"
grep -q "Key Features" ~/.claude/skills/research/PACK_README.md && echo "✓ Features section exists"
grep -q "Use Cases" ~/.claude/skills/research/PACK_README.md && echo "✓ Use cases section exists"
```

**Expected Sections**:
- Overview
- What's Included
- Architecture
- Key Features (6 features)
- Use Cases (5 scenarios)
- Dependencies
- Skill Integration Points
- Configuration
- Performance Characteristics
- Security Considerations

**Status**: ☐ Pass ☐ Fail

---

### 15.2 Installation Guide Accuracy

**Verify PACK_INSTALL.md steps work:**

**Manual Verification**:
1. Follow installation steps from PACK_INSTALL.md
2. Verify each command works as documented
3. Check troubleshooting section covers real issues encountered

**Expected Accuracy**:
- All commands execute successfully
- Troubleshooting covers common issues
- Configuration examples are valid
- No broken links or references

**Status**: ☐ Pass ☐ Fail

---

## 16. Sign-Off Checklist

### Critical Items (Must Pass)

- [ ] All Pack v2.0 files exist (PACK_README.md, PACK_INSTALL.md, PACK_VERIFY.md, SKILL.md, workflows/conduct.md)
- [ ] PAI_DIR environment variable set correctly
- [ ] All three API keys configured (Anthropic, Perplexity, Gemini)
- [ ] Scratchpad and history directories created
- [ ] Quick Research Mode tested successfully (3 agents)
- [ ] Standard Research Mode tested successfully (9 agents)
- [ ] Research outputs created in scratchpad
- [ ] Timeout enforcement works correctly
- [ ] No API keys exposed in files
- [ ] Skill loads in Claude Code

### Recommended Items (Should Pass)

- [ ] Extensive Research Mode tested (24 agents)
- [ ] be-creative skill integrated (if installed)
- [ ] Query decomposition quality verified
- [ ] Synthesis produces high-quality reports
- [ ] Confidence scores accurately reflect source agreement
- [ ] Partial results handling works (some agents timeout)
- [ ] History archiving process documented
- [ ] Performance within expected ranges
- [ ] API costs reasonable
- [ ] Error handling graceful (missing keys, network failures)

### Optional Items (Nice to Have)

- [ ] Result caching implemented
- [ ] Batch research script created
- [ ] Automated scratchpad cleanup configured
- [ ] API usage monitoring set up
- [ ] Custom agent distribution configured
- [ ] Integration with other PAI skills tested
- [ ] Multi-language research tested (if applicable)

---

## 17. Health Check Summary

### Installation Health

**Status**: ☐ Excellent ☐ Good ☐ Needs Attention ☐ Critical Issues

**Summary**:
- Core functionality: _____ / 10 tests passed
- Performance: _____ / 3 modes within expected time
- Security: _____ / 2 security checks passed
- Integration: _____ / 2 integration checks passed

### Research Mode Health

| Mode | Status | Agent Success Rate | Avg Time | Notes |
|------|--------|-------------------|----------|-------|
| Quick (3) | ☐ Pass ☐ Fail | ___/3 | ___ sec | |
| Standard (9) | ☐ Pass ☐ Fail | ___/9 | ___ sec | |
| Extensive (24) | ☐ Pass ☐ Fail | ___/24 | ___ sec | |

### Overall Pack Health

**Grade**: ☐ A (90-100%) ☐ B (80-89%) ☐ C (70-79%) ☐ D (60-69%) ☐ F (<60%)

**Recommendations**:
- [ ] No issues found - pack ready for use
- [ ] Minor issues - address optional items
- [ ] Moderate issues - review troubleshooting guide
- [ ] Critical issues - reinstall following PACK_INSTALL.md

---

## 18. Troubleshooting Reference

If verification fails, consult:

1. **PACK_INSTALL.md** - Reinstallation instructions and troubleshooting (8 common issues)
2. **API Provider Dashboards** - Check usage, rate limits, billing
   - Anthropic: https://console.anthropic.com/
   - Perplexity: https://www.perplexity.ai/settings/api
   - Gemini: https://makersuite.google.com/
3. **Claude Code Documentation** - Agent configuration and debugging
4. **PAI Diagnostics** - Run `/pai-diagnostics` for system health check

---

## 19. Next Steps

After successful verification:

1. **Start Using Research Modes**: Try different research scenarios
2. **Optimize Configuration**: Adjust timeouts and agent distribution for your needs
3. **Monitor API Costs**: Track usage across all three providers
4. **Archive Research**: Develop workflow for moving scratchpad → history
5. **Explore Advanced Use Cases**: Multi-domain research, current events tracking, technical deep dives
6. **Contribute Improvements**: Document any optimizations or custom configurations

---

**Verification Completed By**: _________________
**Date**: _________________
**Overall Status**: ☐ Pass ☐ Fail
**Notes**:

---

**Document Version**: 1.0
**Last Updated**: 2026-01-03
**Next Review**: After major Research Pack update or API provider changes
