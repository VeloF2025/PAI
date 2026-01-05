# Fabric Pack - Verification Checklist

**Pack Version**: 2.0
**Skill**: fabric
**Verification Date**: 2026-01-03
**Purpose**: Verify correct installation and functionality of Fabric Pack

---

## Overview

This verification checklist ensures the Fabric Pack is properly installed and all components are functioning correctly. Work through each section systematically.

**Estimated Time**: 15-20 minutes

---

## 1. File Verification

### 1.1 Core Pack Files

Verify all Pack v2.0 files exist:

```bash
cd ~/.claude/skills/fabric/

# Check core pack files
ls -la PACK_README.md    # Should exist (~340 lines)
ls -la PACK_INSTALL.md   # Should exist (~450 lines)
ls -la PACK_VERIFY.md    # Should exist (this file)
ls -la SKILL.md          # Should exist (~379 lines)
```

**Expected Output**:
```
-rw-r--r-- 1 user user 25000 Jan 03 05:50 PACK_README.md
-rw-r--r-- 1 user user 35000 Jan 03 05:50 PACK_INSTALL.md
-rw-r--r-- 1 user user 30000 Jan 03 05:50 PACK_VERIFY.md
-rw-r--r-- 1 user user 28000 Jan 03 05:50 SKILL.md
```

**Status**: ☐ Pass ☐ Fail

---

### 1.2 Fabric Repository Files

Verify fabric-repo directory structure:

```bash
cd ~/.claude/skills/fabric/

# Check fabric repository exists
ls -la fabric-repo/

# Verify patterns directory
ls -la fabric-repo/data/patterns/ | head -10

# Count total patterns
ls fabric-repo/data/patterns/ | wc -l
```

**Expected Output**:
```
drwxr-xr-x  5 user user  4096 Jan 03 05:30 fabric-repo/
drwxr-xr-x 250 user user 12288 Jan 03 05:30 fabric-repo/data/patterns/

Total patterns: 242+ directories
```

**Status**: ☐ Pass ☐ Fail

---

### 1.3 Workflows Directory

Verify workflow documentation:

```bash
cd ~/.claude/skills/fabric/

# Check workflows directory
ls -la workflows/

# Verify select-pattern workflow
cat workflows/select-pattern.md | head -20
```

**Expected Output**:
```
-rw-r--r-- 1 user user 6000 Jan 03 05:30 select-pattern.md

# Workflow - Fabric Pattern Selection

## Overview
Intelligent pattern selection workflow for routing user requests to appropriate Fabric patterns.
```

**Status**: ☐ Pass ☐ Fail

---

### 1.4 Pattern File Structure

Verify pattern file structure (sample check):

```bash
cd ~/.claude/skills/fabric/fabric-repo/data/patterns/

# Check a few key patterns
ls -la create_threat_model/
ls -la summarize/
ls -la extract_wisdom/

# Verify pattern files exist
cat create_threat_model/system.md | head -5
cat create_threat_model/user.md | head -5
```

**Expected Output**:
```
drwxr-xr-x 2 user user 4096 Jan 03 05:30 create_threat_model/
-rw-r--r-- 1 user user 2500 Jan 03 05:30 system.md
-rw-r--r-- 1 user user 1200 Jan 03 05:30 user.md

# IDENTITY and PURPOSE
You are a cybersecurity expert...
```

**Status**: ☐ Pass ☐ Fail

---

## 2. Fabric CLI Verification

### 2.1 Fabric Installation

Verify Fabric CLI is installed:

```bash
# Check fabric command exists
which fabric

# Check version
fabric --version

# Check help works
fabric --help | head -20
```

**Expected Output**:
```
/usr/local/bin/fabric  (or /home/user/.local/bin/fabric)

fabric version 2.x.x

Usage: fabric [OPTIONS] [PATTERN]

Options:
  -p, --pattern TEXT        Pattern to use
  -m, --model TEXT          Model to use
  -l, --list                List available patterns
  ...
```

**Status**: ☐ Pass ☐ Fail

---

### 2.2 Pattern Listing

Verify patterns are accessible:

```bash
# List all available patterns
fabric --list

# Count patterns
fabric --list | wc -l

# Search for specific patterns
fabric --list | grep threat
fabric --list | grep summarize
fabric --list | grep extract
```

**Expected Output**:
```
analyze_claims
analyze_incident
analyze_logs
analyze_malware
...
[242+ patterns listed]

Patterns found: 242+

Threat patterns:
  create_threat_model
  create_stride_threat_model
  create_threat_scenarios
  analyze_threat_report
```

**Status**: ☐ Pass ☐ Fail

---

### 2.3 API Key Configuration

Verify API key is configured:

```bash
# Check environment variable (don't print full key)
echo $OPENAI_API_KEY | cut -c1-7

# Alternative: Check Anthropic key
echo $ANTHROPIC_API_KEY | cut -c1-10

# Test API key works (simple test)
echo "Test input" | fabric -p extract_main_idea --stream
```

**Expected Output**:
```
sk-proj  (OpenAI key prefix)
# OR
sk-ant-ap  (Anthropic key prefix)

[Fabric executes pattern successfully and returns output]
```

**Status**: ☐ Pass ☐ Fail

---

### 2.4 Basic Pattern Execution

Test simple pattern execution:

```bash
# Test 1: Extract main idea
echo "The quick brown fox jumps over the lazy dog. This sentence is often used for typing tests because it contains every letter of the alphabet." | fabric -p extract_main_idea

# Test 2: Summarize
echo "Artificial intelligence has made remarkable progress in recent years. Machine learning models can now perform tasks that were previously thought to require human intelligence, such as image recognition, natural language processing, and complex decision-making." | fabric -p summarize

# Test 3: Create 5-sentence summary
echo "Climate change is one of the most pressing issues of our time. Rising global temperatures are causing ice caps to melt, sea levels to rise, and weather patterns to become more extreme. Scientists agree that human activities, particularly the burning of fossil fuels, are the primary cause. Governments and organizations worldwide are working to reduce carbon emissions and transition to renewable energy sources. However, more urgent action is needed to prevent catastrophic environmental damage." | fabric -p create_5_sentence_summary
```

**Expected Behavior**:
- Commands execute without errors
- API calls succeed
- Output is formatted and relevant to input
- No "pattern not found" errors

**Status**: ☐ Pass ☐ Fail

---

## 3. Pattern Selection Skill Verification

### 3.1 Skill Loading

Verify fabric skill loads in Claude Code:

```bash
# Check skill file exists
cat ~/.claude/skills/fabric/SKILL.md | head -30

# Verify skill metadata
grep "^name:" ~/.claude/skills/fabric/SKILL.md
grep "^description:" ~/.claude/skills/fabric/SKILL.md
```

**Expected Output**:
```markdown
---
name: fabric
description: Intelligent pattern selection for Fabric CLI. Automatically selects the right pattern from 242+ specialized prompts based on your intent - threat modeling, analysis, summarization, content creation, extraction, and more. USE WHEN processing content, analyzing data, creating summaries, threat modeling, or transforming text.
---
```

**Status**: ☐ Pass ☐ Fail

---

### 3.2 Pattern Routing Logic

Verify pattern selection logic is documented:

```bash
# Check decision tree exists
cat ~/.claude/skills/fabric/SKILL.md | grep -A 5 "Pattern Selection Strategy"

# Verify all 8 categories documented
cat ~/.claude/skills/fabric/SKILL.md | grep "^###" | head -10
```

**Expected Output**:
```markdown
## Pattern Selection Strategy

### 1. Identify Intent Category

**Threat Modeling & Security:**
**Summarization:**
**Wisdom Extraction:**
**Content Extraction:**
**Analysis & Research:**
**Content Creation:**
**Content Improvement:**
**Rating & Judgment:**
```

**Status**: ☐ Pass ☐ Fail

---

### 3.3 Smart Defaults Table

Verify smart defaults are documented:

```bash
# Check smart defaults table
cat ~/.claude/skills/fabric/SKILL.md | grep -A 20 "Smart Defaults"
```

**Expected Output**:
```markdown
## Smart Defaults

| User Says | Routes To | Reason |
|-----------|-----------|---------|
| "threat model for X" | create_threat_model | Default threat modeling |
| "STRIDE threat model" | create_stride_threat_model | Explicit STRIDE methodology |
| "summarize X" | summarize | General summarization |
...
```

**Status**: ☐ Pass ☐ Fail

---

## 4. Functional Testing

### 4.1 Security Patterns

Test threat modeling patterns:

```bash
# Test 1: Basic threat model
echo "A web API that handles user authentication and payment processing. Users can login, view their account, and make purchases using credit cards." | fabric -p create_threat_model

# Test 2: STRIDE threat model
echo "Mobile banking app with biometric authentication, transaction history, and money transfer features." | fabric -p create_stride_threat_model

# Test 3: Threat scenarios
echo "Cloud-based file storage system with public and private sharing capabilities." | fabric -p create_threat_scenarios
```

**Expected Behavior**:
- Threat models include categories (STRIDE elements)
- Attack scenarios are specific and actionable
- Mitigations are provided
- Output is structured and comprehensive

**Status**: ☐ Pass ☐ Fail

---

### 4.2 Summarization Patterns

Test summarization patterns:

```bash
# Test 1: General summary
curl -s https://example.com/article.txt | fabric -p summarize

# Test 2: 5-sentence summary
curl -s https://example.com/long-article.txt | fabric -p create_5_sentence_summary

# Test 3: Micro summary
echo "Long content here..." | fabric -p create_micro_summary
```

**Expected Behavior**:
- Summaries capture key points
- Length constraints respected (5 sentences, micro format)
- Important details preserved
- Coherent and readable output

**Status**: ☐ Pass ☐ Fail

---

### 4.3 Extraction Patterns

Test content extraction patterns:

```bash
# Test 1: Extract wisdom
echo "Steve Jobs once said: 'Innovation distinguishes between a leader and a follower.' This quote emphasizes that true innovation comes from thinking differently and taking risks." | fabric -p extract_wisdom

# Test 2: Extract ideas
echo "The book discusses three main concepts: 1) Systems thinking, 2) Feedback loops, 3) Emergent behavior. Each concept builds on the previous one to create a comprehensive framework." | fabric -p extract_book_ideas

# Test 3: Extract main idea
echo "Quantum computing leverages quantum mechanical phenomena like superposition and entanglement to perform computations that are intractable for classical computers." | fabric -p extract_main_idea
```

**Expected Behavior**:
- Wisdom extracted in structured format
- Ideas clearly identified and categorized
- Main ideas accurately captured
- Output follows pattern's formatting guidelines

**Status**: ☐ Pass ☐ Fail

---

### 4.4 URL Processing (Optional)

Test URL processing if installed:

```bash
# Test URL input
fabric -u https://example.com/article -p summarize

# Test with specific pattern
fabric -u https://blog.example.com/post -p extract_article_wisdom

# Test with YouTube URL (requires yt-dlp)
fabric -y https://www.youtube.com/watch?v=example -p extract_wisdom
```

**Expected Behavior**:
- URLs fetched successfully
- Content processed correctly
- YouTube transcripts extracted (if yt-dlp installed)
- Output relevant to source content

**Status**: ☐ Pass ☐ Fail ☐ Skipped (optional features not installed)

---

### 4.5 Pattern Selection Integration

Test pattern selection through Claude Code skill:

**Manual Test in Claude Code**:
1. Start Claude Code session
2. Say: "Create a threat model for a REST API with OAuth authentication"
3. Verify fabric skill activates automatically
4. Verify correct pattern selected (create_threat_model or create_stride_threat_model)
5. Verify Fabric CLI executes with correct parameters

**Expected Behavior**:
- Fabric skill triggers on security-related requests
- Correct pattern selected based on intent
- Fabric CLI executes successfully
- Output formatted and relevant

**Status**: ☐ Pass ☐ Fail

---

## 5. Optional Features Verification

### 5.1 YouTube Processing (yt-dlp)

If yt-dlp is installed:

```bash
# Check yt-dlp installation
which yt-dlp
yt-dlp --version

# Test YouTube transcript extraction
fabric -y https://www.youtube.com/watch?v=dQw4w9WgXcQ -p summarize
```

**Status**: ☐ Pass ☐ Fail ☐ Not Installed

---

### 5.2 Media Processing (ffmpeg)

If ffmpeg is installed:

```bash
# Check ffmpeg installation
which ffmpeg
ffmpeg -version

# Test media file processing
fabric -f /path/to/media/file.mp4 -p extract_wisdom
```

**Status**: ☐ Pass ☐ Fail ☐ Not Installed

---

### 5.3 JSON Processing (jq)

If jq is installed:

```bash
# Check jq installation
which jq
jq --version

# Test JSON output formatting
echo "test" | fabric -p extract_main_idea --json | jq .
```

**Status**: ☐ Pass ☐ Fail ☐ Not Installed

---

## 6. Performance Verification

### 6.1 Pattern Execution Speed

Test execution performance:

```bash
# Time a simple pattern
time echo "Test input" | fabric -p extract_main_idea

# Time a complex pattern
time curl -s https://example.com/article | fabric -p create_threat_model
```

**Expected Performance**:
- Simple patterns: 2-5 seconds
- Complex patterns: 5-15 seconds
- Network latency: Varies by location/provider

**Status**: ☐ Pass ☐ Slow (acceptable) ☐ Fail (too slow)

---

### 6.2 API Response Time

Monitor API provider response:

```bash
# Test with timing
time fabric --list > /dev/null  # Should be instant (local)

# Test pattern execution (measures API latency)
time echo "Test" | fabric -p summarize
```

**Expected Behavior**:
- Local commands (--list): <1 second
- API calls: 2-10 seconds (depends on provider/model)
- Streaming mode: Progressive output

**Status**: ☐ Pass ☐ Acceptable ☐ Fail

---

### 6.3 Token Usage Estimation

Check token consumption (if provider shows usage):

```bash
# Small input test
echo "Short text" | fabric -p extract_main_idea
# Check token usage in API dashboard

# Large input test
cat large-document.txt | fabric -p summarize
# Check token usage in API dashboard
```

**Expected Behavior**:
- Small inputs: 100-500 tokens
- Medium inputs: 500-2000 tokens
- Large inputs: 2000-8000 tokens
- Pattern system prompts add ~200-500 tokens per request

**Status**: ☐ Pass ☐ High Usage (acceptable) ☐ Fail (excessive)

---

## 7. Integration Verification

### 7.1 Claude Code Integration

Verify fabric skill integrates with Claude Code:

**Manual Verification**:
1. Start Claude Code session
2. Check skill loads: Look for "fabric" in skill list
3. Trigger skill: Make request requiring pattern selection
4. Verify automatic activation
5. Check output quality

**Expected Behavior**:
- Skill appears in Claude Code skill registry
- Auto-triggers on relevant requests
- Pattern selection works correctly
- Output integrated into conversation

**Status**: ☐ Pass ☐ Fail

---

### 7.2 PAI Skills Compatibility

Test compatibility with other PAI skills:

**Test Scenarios**:
1. **With research skill**: "Research X and create threat model"
2. **With proactive-scanner**: "Scan code and summarize findings"
3. **With alex-hormozi-pitch**: "Extract wisdom from pitch deck"

**Expected Behavior**:
- Skills work together without conflicts
- Context passed correctly between skills
- No circular dependencies
- Clean separation of concerns

**Status**: ☐ Pass ☐ Fail

---

### 7.3 Protocol Compliance

Verify fabric skill follows PAI protocols:

```bash
# Check NLNH compliance (no hallucinations)
cat ~/.claude/skills/fabric/SKILL.md | grep -i "pattern" | wc -l  # Should match actual pattern count

# Check DGTS compliance (documentation quality)
cat ~/.claude/skills/fabric/PACK_README.md | wc -l  # Should be ~340 lines
cat ~/.claude/skills/fabric/PACK_INSTALL.md | wc -l  # Should be ~450 lines

# Check AntiHall compliance (no non-existent methods)
# All referenced patterns should exist in fabric-repo/data/patterns/
```

**Status**: ☐ Pass ☐ Fail

---

## 8. Documentation Verification

### 8.1 README Completeness

Verify PACK_README.md is comprehensive:

```bash
# Check section headers
cat ~/.claude/skills/fabric/PACK_README.md | grep "^##"

# Verify key sections exist
grep -q "Architecture" ~/.claude/skills/fabric/PACK_README.md && echo "✓ Architecture section exists"
grep -q "Key Features" ~/.claude/skills/fabric/PACK_README.md && echo "✓ Features section exists"
grep -q "Use Cases" ~/.claude/skills/fabric/PACK_README.md && echo "✓ Use cases section exists"
grep -q "Pattern Selection" ~/.claude/skills/fabric/PACK_README.md && echo "✓ Pattern selection section exists"
```

**Expected Sections**:
- Overview
- What's Included
- Architecture
- Key Features (6 features)
- Use Cases (5 scenarios)
- Pattern Categories (8 categories)
- Dependencies
- Skill Integration Points
- Configuration
- Performance Characteristics
- Security Considerations

**Status**: ☐ Pass ☐ Fail

---

### 8.2 Installation Guide Accuracy

Verify PACK_INSTALL.md steps work:

**Manual Verification**:
1. Follow installation steps sequentially
2. Verify each command works as documented
3. Check troubleshooting section covers real issues
4. Validate configuration examples

**Expected Accuracy**:
- All commands execute successfully
- Troubleshooting covers common issues
- Configuration examples are valid
- Links to external resources work

**Status**: ☐ Pass ☐ Fail

---

### 8.3 Pattern Documentation Accuracy

Verify pattern documentation matches reality:

```bash
# Verify pattern count
DOCUMENTED=$(cat ~/.claude/skills/fabric/PACK_README.md | grep -o "242+" | head -1)
ACTUAL=$(ls ~/.claude/skills/fabric/fabric-repo/data/patterns/ | wc -l)

echo "Documented: $DOCUMENTED patterns"
echo "Actual: $ACTUAL patterns"

# Verify category examples exist
grep -q "create_threat_model" ~/.claude/skills/fabric/fabric-repo/data/patterns/ && echo "✓ Threat modeling patterns exist"
grep -q "summarize" ~/.claude/skills/fabric/fabric-repo/data/patterns/ && echo "✓ Summarization patterns exist"
grep -q "extract_wisdom" ~/.claude/skills/fabric/fabric-repo/data/patterns/ && echo "✓ Extraction patterns exist"
```

**Status**: ☐ Pass ☐ Fail

---

## 9. Update Verification

### 9.1 Pattern Repository Updates

Test pattern update mechanism:

```bash
cd ~/.claude/skills/fabric/fabric-repo/

# Check current commit
git log -1 --oneline

# Update patterns
git pull origin main

# Verify new patterns (if any)
git log -5 --oneline
```

**Expected Behavior**:
- Git repository is valid
- Pull succeeds
- New patterns integrated automatically
- No merge conflicts

**Status**: ☐ Pass ☐ Fail

---

### 9.2 Fabric CLI Updates

Test Fabric CLI update:

```bash
# Check current version
fabric --version

# Update Fabric (method depends on installation)
pip install --upgrade fabric-ai
# OR
brew upgrade fabric

# Verify new version
fabric --version
```

**Status**: ☐ Pass ☐ Updated ☐ Already Latest

---

## 10. Edge Cases and Error Handling

### 10.1 Invalid Pattern Name

Test error handling for non-existent patterns:

```bash
# Test invalid pattern
echo "Test" | fabric -p nonexistent_pattern_12345
```

**Expected Behavior**:
- Clear error message: "Pattern not found"
- Suggests using `fabric --list` to see available patterns
- Does not crash or hang

**Status**: ☐ Pass ☐ Fail

---

### 10.2 Missing API Key

Test behavior without API key:

```bash
# Temporarily unset API key
unset OPENAI_API_KEY
unset ANTHROPIC_API_KEY

# Try to run pattern
echo "Test" | fabric -p summarize

# Restore API key
export OPENAI_API_KEY="sk-..."
```

**Expected Behavior**:
- Clear error: "API key not found" or "Authentication failed"
- Instructions on how to set API key
- Does not expose partial key or crash

**Status**: ☐ Pass ☐ Fail

---

### 10.3 Network Failures

Test URL processing with invalid URLs:

```bash
# Test invalid URL
fabric -u https://nonexistent-domain-12345.com/article -p summarize

# Test timeout scenario (use very slow URL)
fabric -u https://httpstat.us/200?sleep=30000 -p summarize
```

**Expected Behavior**:
- Clear error: "Failed to fetch URL" or "Connection timeout"
- Graceful failure (no crash)
- Suggests checking internet connection

**Status**: ☐ Pass ☐ Fail

---

### 10.4 Rate Limiting

Test API rate limit handling:

```bash
# Run multiple requests rapidly
for i in {1..10}; do
  echo "Test $i" | fabric -p extract_main_idea &
done
wait
```

**Expected Behavior**:
- Some requests may fail with "Rate limit exceeded"
- Error messages are clear
- No data corruption
- System recovers after rate limit resets

**Status**: ☐ Pass ☐ Fail ☐ Skipped (no rate limits hit)

---

## 11. Security Verification

### 11.1 API Key Security

Verify API keys are handled securely:

```bash
# Check API key not in files
grep -r "sk-proj" ~/.claude/skills/fabric/ || echo "✓ No API keys in files"
grep -r "sk-ant" ~/.claude/skills/fabric/ || echo "✓ No API keys in files"

# Check environment variable only
env | grep API_KEY | cut -c1-30
```

**Expected Behavior**:
- API keys only in environment variables
- Not hardcoded in scripts or config files
- Not logged to console or files
- Secure storage method documented

**Status**: ☐ Pass ☐ Fail

---

### 11.2 Input Sanitization

Test with special characters and injection attempts:

```bash
# Test special characters
echo "Test with 'quotes' and \"double quotes\" and \$variables" | fabric -p extract_main_idea

# Test potentially problematic input
echo "Test with newlines\nand\ttabs\tand | pipes | and > redirects" | fabric -p summarize
```

**Expected Behavior**:
- Special characters handled correctly
- No command injection possible
- Output properly escaped
- No security warnings

**Status**: ☐ Pass ☐ Fail

---

### 11.3 Pattern File Permissions

Verify secure file permissions:

```bash
# Check pattern files are readable but not executable
ls -la ~/.claude/skills/fabric/fabric-repo/data/patterns/*/system.md | head -5

# Verify no world-writable files
find ~/.claude/skills/fabric/ -type f -perm -002 || echo "✓ No world-writable files"
```

**Expected Permissions**:
- Pattern files: 644 (rw-r--r--)
- Directories: 755 (rwxr-xr-x)
- No executable markdown files
- No world-writable files

**Status**: ☐ Pass ☐ Fail

---

## 12. Sign-Off Checklist

### Critical Items (Must Pass)

- [ ] All Pack v2.0 files exist (PACK_README.md, PACK_INSTALL.md, PACK_VERIFY.md, SKILL.md)
- [ ] Fabric CLI installed and accessible (`fabric --version`)
- [ ] fabric-repo cloned with 242+ patterns
- [ ] API key configured correctly
- [ ] Basic pattern execution works (extract_main_idea, summarize)
- [ ] Pattern listing works (`fabric --list`)
- [ ] No API keys hardcoded in files
- [ ] Documentation accurate and complete
- [ ] Skill loads in Claude Code
- [ ] Pattern selection logic documented

### Recommended Items (Should Pass)

- [ ] Threat modeling patterns tested (create_threat_model)
- [ ] Summarization patterns tested (create_5_sentence_summary)
- [ ] Extraction patterns tested (extract_wisdom)
- [ ] URL processing works (if needed)
- [ ] Error handling graceful (invalid patterns, missing API key)
- [ ] Performance acceptable (2-15 seconds per request)
- [ ] Pattern repository updates work (git pull)
- [ ] Integration with other PAI skills verified
- [ ] Troubleshooting guide covers common issues
- [ ] Security best practices followed

### Optional Items (Nice to Have)

- [ ] yt-dlp installed for YouTube processing
- [ ] ffmpeg installed for media processing
- [ ] jq installed for JSON formatting
- [ ] Local LLM configured (Ollama) for privacy
- [ ] Batch processing script created
- [ ] Caching mechanism implemented
- [ ] Custom patterns added
- [ ] Multiple API providers configured

---

## 13. Health Check Summary

### Installation Health

**Status**: ☐ Excellent ☐ Good ☐ Needs Attention ☐ Critical Issues

**Summary**:
- Core functionality: _____ / 10 tests passed
- Optional features: _____ / 7 tests passed
- Performance: _____ / 3 tests passed
- Security: _____ / 3 tests passed

### Overall Pack Health

**Grade**: ☐ A (90-100%) ☐ B (80-89%) ☐ C (70-79%) ☐ D (60-69%) ☐ F (<60%)

**Recommendations**:
- [ ] No issues found - pack ready for use
- [ ] Minor issues - address optional items
- [ ] Moderate issues - follow troubleshooting guide
- [ ] Critical issues - reinstall following PACK_INSTALL.md

---

## 14. Troubleshooting Reference

If verification fails, consult:

1. **PACK_INSTALL.md** - Reinstallation instructions and troubleshooting
2. **Fabric GitHub Issues** - https://github.com/danielmiessler/fabric/issues
3. **API Provider Status** - Check OpenAI/Anthropic status pages
4. **PAI Diagnostics** - Run `/pai-diagnostics` for system health check

---

## 15. Next Steps

After successful verification:

1. **Update Progress Tracker**: Mark fabric migration complete in `pack-v2-migrations.md`
2. **Test Real-World Scenarios**: Use fabric in actual Claude Code sessions
3. **Share Knowledge**: Document any custom patterns or workflows
4. **Stay Updated**: Regularly pull latest patterns (`cd fabric-repo && git pull`)
5. **Contribute**: Submit useful custom patterns to Fabric repository

---

**Verification Completed By**: _________________
**Date**: _________________
**Overall Status**: ☐ Pass ☐ Fail
**Notes**:

---

**Document Version**: 1.0
**Last Updated**: 2026-01-03
**Next Review**: After major Fabric version update
