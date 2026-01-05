# Fabric Pack - Intelligent Pattern Selection for 242+ AI Prompts

**Version**: 2.0
**Last Updated**: 2026-01-03

---

## Overview

The Fabric Pack provides intelligent pattern selection from Daniel Miessler's **Fabric CLI** - a collection of 242+ specialized AI prompts for processing content, analyzing data, threat modeling, summarization, and text transformation. This skill acts as a smart router that automatically selects the right pattern based on your intent, eliminating the need to memorize pattern names.

**What makes this different:** Instead of manually selecting from 242+ patterns, this skill analyzes your request ("Create a threat model", "Summarize this article", "Extract wisdom") and automatically routes to the optimal Fabric pattern.

**Credits**: Built on [Fabric by Daniel Miessler](https://github.com/danielmiessler/fabric) - a groundbreaking framework for applying AI to everyday tasks.

---

## What's Included

### Skills
- **fabric** - Main skill with intelligent pattern routing

### Repository
- **fabric-repo/** - Complete Fabric repository (242+ patterns)
  - Cloned from https://github.com/danielmiessler/fabric
  - Updated regularly with `git pull`
  - Contains all pattern definitions and templates

### Workflows
- **select-pattern.md** - Pattern selection workflow

### Pattern Categories (242+ Total)

1. **Threat Modeling & Security** (15 patterns)
2. **Summarization** (20 patterns)
3. **Extraction** (30+ patterns)
4. **Analysis** (35+ patterns)
5. **Creation** (50+ patterns)
6. **Improvement** (10 patterns)
7. **Rating/Judgment** (8 patterns)
8. **Specialized** (70+ niche patterns)

---

## Architecture

```
User Request
    ↓
"Create a threat model for API"
    ↓
Fabric Skill (Pattern Router)
    ↓
Intent Recognition: "threat model"
    ↓
Pattern Selection Decision Tree
    ├─ Security? → create_threat_model, create_stride_threat_model
    ├─ Summarization? → summarize, create_5_sentence_summary
    ├─ Extraction? → extract_wisdom, extract_insights
    ├─ Analysis? → analyze_[type]
    └─ Creation? → create_[artifact]
    ↓
Execute: fabric "API auth + payments" -p create_threat_model
    ↓
Fabric CLI
    ↓
Pattern Template (AI Prompt)
    ↓
Claude API
    ↓
Formatted Output (Threat Model)
```

### Key Components

1. **Intent Recognition** - Analyzes user request to identify primary goal
2. **Pattern Mapping** - Maps intent to 1-3 candidate patterns
3. **Best Match Selection** - Chooses optimal pattern based on context
4. **Fabric CLI Invocation** - Executes pattern with proper input handling
5. **Output Formatting** - Returns structured results

---

## Key Features

### 🎯 Intelligent Pattern Selection

**Problem**: 242+ patterns = decision paralysis
**Solution**: Automatic pattern routing based on natural language intent

**Example**:
```bash
User: "Summarize this article"
Skill: Recognizes "summarize" intent
Skill: Routes to `summarize` pattern (not create_summary, create_5_sentence_summary, etc.)
Result: Correct pattern selected automatically
```

**Decision Criteria**:
- Keyword matching (threat, summarize, extract, analyze, create)
- Context analysis (URL provided? YouTube link? Code snippet?)
- Output format (concise vs detailed, structured vs narrative)
- Domain specificity (security, academic, technical, creative)

---

### 📊 Pattern Category System

**8 Major Categories**:

#### 1. Threat Modeling & Security (15 patterns)
Purpose: Security analysis, threat modeling, rule creation

**Top Patterns**:
- `create_threat_model` - General threat modeling framework
- `create_stride_threat_model` - Microsoft STRIDE methodology
- `create_threat_scenarios` - Scenario-based threat generation
- `create_security_update` - Security advisory documentation
- `analyze_threat_report` - Threat intelligence analysis

**When to Use**: Security assessments, threat hunting, compliance, risk analysis

---

#### 2. Summarization (20 patterns)
Purpose: Condense content into digestible summaries

**Top Patterns**:
- `summarize` - General-purpose summarization
- `create_5_sentence_summary` - Ultra-concise (5 lines max)
- `summarize_paper` - Academic paper summaries
- `youtube_summary` - YouTube video transcription + summary
- `summarize_meeting` - Meeting notes summarization

**When to Use**: Research, content curation, meeting notes, video analysis

---

#### 3. Extraction (30+ patterns)
Purpose: Pull specific information types from content

**Top Patterns**:
- `extract_wisdom` - Key insights, lessons, wisdom
- `extract_article_wisdom` - Article-specific wisdom extraction
- `extract_insights` - Data-driven insights
- `extract_recommendations` - Actionable recommendations
- `extract_main_idea` - Core message extraction
- `extract_predictions` - Future predictions mentioned
- `extract_controversial_ideas` - Controversial/contrarian points

**When to Use**: Knowledge extraction, insight mining, reference gathering

---

#### 4. Analysis (35+ patterns)
Purpose: Deep analytical processing of content

**Top Patterns**:
- `analyze_claims` - Fact-checking and claim analysis
- `analyze_malware` - Malware sample analysis
- `analyze_code` - Code review and analysis
- `analyze_paper` - Academic paper analysis
- `analyze_debate` - Debate argument analysis
- `analyze_sales_call` - Sales call effectiveness
- `analyze_threat_report` - Cyber threat analysis

**When to Use**: Critical thinking, fact-checking, code review, research analysis

---

#### 5. Creation (50+ patterns)
Purpose: Generate new content, documents, artifacts

**Top Patterns**:
- `create_prd` - Product Requirements Document
- `create_design_document` - Technical design docs
- `create_visualization` - Visual diagrams (text-based)
- `create_mermaid_visualization` - Mermaid.js diagrams
- `create_coding_project` - Project scaffolding
- `create_user_story` - Agile user stories
- `write_essay` - Essay writing
- `create_keynote` - Presentation outlines

**When to Use**: Documentation, planning, visualization, content creation

---

#### 6. Improvement (10 patterns)
Purpose: Enhance existing content

**Top Patterns**:
- `improve_writing` - General writing enhancement
- `improve_academic_writing` - Academic style improvement
- `improve_prompt` - Prompt engineering optimization
- `review_code` - Code quality improvement
- `humanize` - Make AI text sound human

**When to Use**: Editing, refinement, quality improvement

---

#### 7. Rating/Judgment (8 patterns)
Purpose: Evaluate quality, value, effectiveness

**Top Patterns**:
- `rate_ai_response` - Evaluate AI output quality
- `rate_content` - Content quality rating
- `rate_value` - Value proposition assessment
- `judge_output` - General quality judgment

**When to Use**: Quality assurance, evaluation, decision-making

---

#### 8. Specialized (70+ niche patterns)
Purpose: Domain-specific processing

**Examples**:
- `analyze_spiritual_text` - Religious/spiritual analysis
- `summarize_rpg_session` - RPG game session notes
- `create_podcast_image` - Podcast cover generation prompts
- `extract_sponsor_mentions` - Sponsor identification
- `analyze_cfp_submission` - Conference proposal analysis

**When to Use**: Niche use cases, specialized domains

---

### 🔄 Auto-Update Support

**Fabric Repository Integration**:
- Fabric repo cloned to `~/.claude/skills/fabric/fabric-repo/`
- Patterns update with `git pull`
- New patterns automatically available (no skill modification needed)

**Update Workflow**:
```bash
cd ~/.claude/skills/fabric/fabric-repo
git pull origin main
# New patterns now available via Fabric CLI
```

---

### 🚀 Multi-Input Support

**Input Methods**:

1. **Direct Text**:
   ```bash
   fabric "your text here" -p pattern_name
   ```

2. **URLs**:
   ```bash
   fabric -u "https://example.com/article" -p summarize
   ```

3. **YouTube**:
   ```bash
   fabric -y "https://youtube.com/watch?v=..." -p youtube_summary
   ```

4. **Files**:
   ```bash
   cat file.txt | fabric -p extract_wisdom
   ```

5. **Clipboard** (macOS/Linux):
   ```bash
   pbpaste | fabric -p analyze_claims
   ```

---

### 📈 Smart Defaults

**Pattern Selection Logic**:

| User Says | Skill Routes To | Rationale |
|-----------|-----------------|-----------|
| "threat model" | `create_threat_model` | General threat modeling default |
| "threat model with STRIDE" | `create_stride_threat_model` | STRIDE keyword triggers specific pattern |
| "summarize" | `summarize` | General summarization default |
| "5-sentence summary" | `create_5_sentence_summary` | Length constraint triggers specific pattern |
| "extract wisdom" | `extract_wisdom` | Direct pattern name match |
| "main idea" | `extract_main_idea` | Synonym mapping to pattern |
| "analyze code" | `analyze_code` | Direct match |
| "review code" | `review_code` | Review = improvement context |

**Fallback Strategy**:
1. Exact pattern name match → use directly
2. Keyword match → use primary pattern for category
3. Ambiguous → ask user for clarification
4. Unknown → suggest similar patterns

---

## Use Cases

### 1. Security Threat Modeling

**Scenario**: Need to create threat model for new API

**Workflow**:
```bash
User: "Create a threat model for our authentication API that handles OAuth2 and JWT tokens"

Skill Actions:
1. Recognizes "threat model" intent → Security category
2. Selects `create_threat_model` (general-purpose)
3. Executes:
   fabric "OAuth2 and JWT authentication API" -p create_threat_model

Output:
## Threat Model: Authentication API

**Assets:**
- User credentials
- OAuth2 tokens
- JWT signing keys
- Session data

**Threats:**
1. Token theft via XSS
2. JWT signature bypass
3. Token replay attacks
4. Credential stuffing
5. OAuth redirect manipulation

**Mitigations:**
- HTTPOnly cookies for tokens
- JWT signature verification
- Token expiration enforcement
- Rate limiting on auth endpoints
- Redirect URL whitelisting

**STRIDE Analysis:**
[Detailed STRIDE breakdown...]
```

---

### 2. Content Summarization

**Scenario**: Summarize long article for quick review

**Workflow**:
```bash
User: "Summarize this blog post: https://example.com/long-article"

Skill Actions:
1. Recognizes "summarize" + URL → Summarization category
2. Selects `summarize` (supports URL input)
3. Executes:
   fabric -u "https://example.com/long-article" -p summarize

Output:
## Summary

**Main Points:**
- Point 1: [Key finding]
- Point 2: [Important insight]
- Point 3: [Critical takeaway]

**Key Takeaways:**
1. [Actionable insight 1]
2. [Actionable insight 2]

**Conclusion:**
[One-paragraph synthesis]
```

**Advanced**: Ultra-concise summary
```bash
User: "Give me a 5-sentence summary"

Skill: Routes to `create_5_sentence_summary`

Output:
1. [Sentence 1: Main topic]
2. [Sentence 2: Key point 1]
3. [Sentence 3: Key point 2]
4. [Sentence 4: Implication]
5. [Sentence 5: Conclusion]
```

---

### 3. Wisdom Extraction from Videos

**Scenario**: Extract insights from hour-long YouTube presentation

**Workflow**:
```bash
User: "Extract wisdom from this AI conference talk: https://youtube.com/watch?v=abc123"

Skill Actions:
1. Recognizes "extract wisdom" + YouTube URL
2. Selects `extract_wisdom` (works with YouTube via Fabric's -y flag)
3. Executes:
   fabric -y "https://youtube.com/watch?v=abc123" -p extract_wisdom

Output:
## Wisdom Extracted

**IDEAS:**
- [Insight 1]
- [Insight 2]
- [Insight 3]

**QUOTES:**
- "Quote 1"
- "Quote 2"

**HABITS:**
- [Practice mentioned]
- [Routine discussed]

**FACTS:**
- [Data point 1]
- [Data point 2]

**REFERENCES:**
- [Book/paper/resource mentioned]

**RECOMMENDATIONS:**
- [Actionable advice 1]
- [Actionable advice 2]
```

**Fabric Handles**:
- YouTube video download
- Transcript extraction
- Content processing
- Structured output generation

---

### 4. Code Analysis

**Scenario**: Review code for security issues

**Workflow**:
```bash
User: "Analyze this authentication code for security issues"
[User provides code snippet]

Skill Actions:
1. Recognizes "analyze" + "code" + "security"
2. Selects `analyze_code` (security-aware code review)
3. Executes:
   fabric "$(cat auth.py)" -p analyze_code

Output:
## Code Analysis

**Security Issues:**
1. ⚠️ SQL injection risk (line 42)
2. ⚠️ Hardcoded credentials (line 18)
3. ⚠️ Missing input validation (line 67)

**Code Quality:**
- Good: Error handling present
- Concern: Complex nested conditionals
- Improvement: Extract validation logic

**Recommendations:**
1. Use parameterized queries
2. Move credentials to environment variables
3. Add input sanitization layer
4. Refactor nested conditionals

**Severity:** HIGH (SQL injection risk)
```

---

### 5. PRD Generation

**Scenario**: Create Product Requirements Document from description

**Workflow**:
```bash
User: "Create a PRD for a real-time collaborative code editor with AI autocomplete"

Skill Actions:
1. Recognizes "create" + "PRD" → Creation category
2. Selects `create_prd`
3. Executes:
   fabric "Real-time collaborative code editor with AI autocomplete" -p create_prd

Output:
## Product Requirements Document

**Product Name:** Real-Time Collaborative Code Editor

**Problem Statement:**
Developers need real-time collaboration with AI assistance for pair programming and code review.

**User Stories:**
1. As a developer, I want to edit code simultaneously with teammates
2. As a developer, I want AI-powered code completions
3. As a reviewer, I want to see changes in real-time

**Features:**
1. Multi-cursor editing
2. Real-time syntax highlighting
3. AI autocomplete integration
4. Conflict resolution
5. Version history

**Technical Requirements:**
- WebSocket support
- CRDT for conflict-free editing
- GPT-4 integration for autocomplete
- Sub-100ms latency

**Success Metrics:**
- <100ms collaboration latency
- >90% autocomplete acceptance rate
- 10K+ active users in 6 months

[... more detailed sections ...]
```

---

## Dependencies

### Runtime
- **Fabric CLI** - Must be installed globally
  - Installation: `pip install fabric` or `brew install fabric`
  - Repository: https://github.com/danielmiessler/fabric
- **Python 3** - Required by Fabric CLI
- **Git** - For updating fabric-repo

### Optional (Enhanced Functionality)
- **yt-dlp** - YouTube video processing
- **ffmpeg** - Media file processing
- **jq** - JSON parsing for advanced workflows

### PAI Skills (Optional)
- None required - fabric is standalone

---

## Skill Integration Points

This skill interacts with:

1. **Fabric Repository** (`~/.claude/skills/fabric/fabric-repo/`)
   - Reads: Pattern definitions from `data/patterns/`
   - Updates: Via `git pull` in repo directory

2. **System Fabric Installation** (`~/.config/fabric/` or global install)
   - Executes: Fabric CLI commands
   - Uses: Global fabric installation if available

3. **User Content** (URLs, files, clipboard)
   - Reads: Content from various sources
   - Processes: Via appropriate Fabric patterns

---

## Configuration

### Fabric CLI Setup

**Installation**:
```bash
# Via pip
pip install fabric

# Via Homebrew (macOS)
brew install fabric

# Verify installation
fabric --version
```

**Configuration**:
```bash
# Set OpenAI API key (required for pattern execution)
export OPENAI_API_KEY="your-key-here"

# Or use Fabric's config
fabric --setup
```

**Model Selection**:
```bash
# Default: GPT-4
fabric -p pattern_name

# Use specific model
fabric -p pattern_name --model gpt-4-turbo

# Use Claude (if supported)
fabric -p pattern_name --model claude-3-opus
```

---

### Pattern Repository Location

**PAI-Integrated Repo**:
```bash
# Location
~/.claude/skills/fabric/fabric-repo/

# Patterns directory
~/.claude/skills/fabric/fabric-repo/data/patterns/

# Update patterns
cd ~/.claude/skills/fabric/fabric-repo/
git pull origin main
```

**Global Fabric Install** (alternative):
```bash
# Location
~/.config/fabric/patterns/

# Update
fabric --update
```

---

### Environment Variables

**Required**:
```bash
export OPENAI_API_KEY="sk-..."
# Or other LLM provider API keys
```

**Optional**:
```bash
# Fabric CLI path (if not in PATH)
export FABRIC_CLI="/path/to/fabric"

# Default model
export FABRIC_DEFAULT_MODEL="gpt-4-turbo"

# Patterns directory override
export FABRIC_PATTERNS_DIR="/custom/patterns/path"
```

---

## Pattern Selection Reference

### Quick Decision Tree

```
User request arrives
    ↓
Contains "threat" or "security"?
    Yes → Security patterns
        ├─ "STRIDE" mentioned? → create_stride_threat_model
        ├─ "scenario" mentioned? → create_threat_scenarios
        └─ Default → create_threat_model
    No ↓
Contains "summarize" or "summary"?
    Yes → Summarization patterns
        ├─ "5 sentence" mentioned? → create_5_sentence_summary
        ├─ YouTube URL? → youtube_summary
        ├─ "meeting" mentioned? → summarize_meeting
        └─ Default → summarize
    No ↓
Contains "extract" or "wisdom" or "insights"?
    Yes → Extraction patterns
        ├─ "wisdom" mentioned? → extract_wisdom
        ├─ "main idea" mentioned? → extract_main_idea
        ├─ "recommendations"? → extract_recommendations
        └─ Default → extract_insights
    No ↓
Contains "analyze"?
    Yes → Analysis patterns
        ├─ "code" mentioned? → analyze_code
        ├─ "claims" mentioned? → analyze_claims
        ├─ "malware" mentioned? → analyze_malware
        └─ Default → analyze_[match_type]
    No ↓
Contains "create" or "generate"?
    Yes → Creation patterns
        ├─ "PRD" mentioned? → create_prd
        ├─ "visualization"? → create_mermaid_visualization
        ├─ "design doc"? → create_design_document
        └─ Default → create_[match_type]
    No ↓
Contains "improve" or "enhance"?
    Yes → Improvement patterns
        ├─ "writing" mentioned? → improve_writing
        ├─ "prompt" mentioned? → improve_prompt
        └─ Default → improve_writing
    No ↓
Contains "rate" or "judge" or "evaluate"?
    Yes → Rating patterns
        ├─ "AI response"? → rate_ai_response
        ├─ "content"? → rate_content
        └─ Default → judge_output
    No ↓
Ask for clarification or suggest patterns
```

---

## Performance Characteristics

### Pattern Execution Speed

**Fast Patterns** (<5 seconds):
- `create_5_sentence_summary` - Minimal processing
- `extract_main_idea` - Single concept extraction
- `create_tags` - Simple tagging

**Medium Patterns** (5-30 seconds):
- `summarize` - Standard summarization
- `extract_wisdom` - Structured extraction
- `analyze_claims` - Claim-by-claim analysis

**Slow Patterns** (30-120+ seconds):
- `create_threat_model` - Comprehensive analysis
- `analyze_malware` - Deep technical analysis
- `create_prd` - Detailed document generation
- YouTube patterns (download + transcription + processing)

**Factors Affecting Speed**:
- LLM API latency (GPT-4 vs GPT-3.5)
- Input size (short text vs entire book)
- Pattern complexity (simple extraction vs deep analysis)
- Network speed (URL fetching, YouTube download)

---

### Token Usage

**Low Token Patterns** (<1000 tokens):
- Simple extraction patterns
- Micro summaries
- Tag generation

**Medium Token Patterns** (1000-5000 tokens):
- Standard summarization
- Code analysis
- Wisdom extraction

**High Token Patterns** (5000-15000+ tokens):
- Threat modeling
- PRD generation
- Comprehensive analysis

**Cost Optimization**:
- Use targeted patterns (extract_main_idea vs extract_wisdom)
- Choose appropriate summary length (micro vs detailed)
- Use GPT-3.5-turbo for simple tasks, GPT-4 for complex

---

## Security Considerations

### API Key Protection

**Risk**: Fabric requires LLM API keys
**Mitigation**:
- Store keys in environment variables (not code)
- Use `.env` files with proper `.gitignore`
- Rotate keys regularly
- Use least-privilege API keys

---

### Content Privacy

**Risk**: Input content sent to external LLM APIs
**Mitigation**:
- Don't process confidential information
- Use local LLM models for sensitive data (if Fabric supports)
- Review pattern outputs before sharing
- Understand data retention policies of LLM providers

---

### Pattern Trust

**Risk**: Patterns are prompts - could produce harmful outputs
**Mitigation**:
- Review pattern source before first use
- Test patterns with safe inputs
- Validate outputs for accuracy
- Use trusted pattern sources only (official Fabric repo)

---

## Credits & Inspiration

**Fabric Framework**: Created by [Daniel Miessler](https://github.com/danielmiessler)
- Repository: https://github.com/danielmiessler/fabric
- Concept: "Fabric is an open-source framework for augmenting humans using AI"
- 242+ patterns created by community contributors

**This Skill**: Adds intelligent pattern selection layer on top of Fabric
- Eliminates need to know pattern names
- Routes based on natural language intent
- Integrates Fabric into PAI workflow

---

## Future Enhancements

**Potential Additions** (not yet implemented):

1. **Pattern Chaining** - Auto-chain related patterns
   - Example: extract_wisdom → summarize → create_visualization

2. **Custom Patterns** - User-defined pattern library
   - Store in `~/.claude/skills/fabric/custom-patterns/`

3. **Output Caching** - Cache pattern results
   - Avoid re-processing identical inputs

4. **Batch Processing** - Process multiple inputs
   - Example: Summarize all PDFs in directory

5. **Pattern Analytics** - Track pattern usage
   - Most used patterns
   - Success rates
   - Execution times

6. **Multi-Pattern Comparison** - Run multiple patterns, compare outputs
   - Example: Compare `summarize` vs `extract_wisdom` for same input

7. **Local LLM Support** - Use local models instead of APIs
   - Privacy-focused alternative

---

## Quick Start

### Prerequisites
1. Install Fabric CLI: `pip install fabric` or `brew install fabric`
2. Set API key: `export OPENAI_API_KEY="your-key"`
3. Clone Fabric repo (auto-checked by skill)

### Basic Usage

**In Claude Code session**:

```bash
# Threat modeling
User: "Create a threat model for our authentication API"
Fabric skill: [Routes to create_threat_model]

# Summarization
User: "Summarize https://example.com/article"
Fabric skill: [Routes to summarize]

# Extraction
User: "Extract wisdom from this YouTube video: [URL]"
Fabric skill: [Routes to extract_wisdom with YouTube support]

# Analysis
User: "Analyze this code for security issues"
Fabric skill: [Routes to analyze_code]

# Creation
User: "Create a PRD for a mobile app"
Fabric skill: [Routes to create_prd]
```

### Installation
See **PACK_INSTALL.md** for complete installation guide.

### Verification
See **PACK_VERIFY.md** for verification checklist.

---

**REMEMBER**: The skill's value is **intelligent pattern selection** - you don't need to know pattern names, just describe what you want to accomplish.

---

**Document Version**: 2.0 (Pack Format)
**Created**: 2026-01-03
**Author**: PAI Enhancement Team
**Based On**: Fabric by Daniel Miessler
