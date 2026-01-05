# Research Pack - Multi-Source Parallel Research Orchestration

**Pack Version**: 2.0
**Complexity**: Medium
**Type**: Multi-Agent Orchestration System

---

## Overview

The Research Pack provides massively parallel multi-source research capabilities by orchestrating up to 24 concurrent research agents across three specialized platforms (Perplexity, Claude WebSearch, Gemini). Delivers comprehensive research results in under 3 minutes through intelligent query decomposition and parallel execution.

**Key Innovation**: Transforms sequential research (5-10 minutes) into parallel research (15-180 seconds) by launching multiple specialized agents simultaneously, each exploring different angles of the research question.

---

## What's Included

### Skills
- **research** - Main orchestration skill with 3 research modes (Quick/Standard/Extensive)

### Workflows
- **conduct.md** - Comprehensive workflow documentation for research execution

### Research Agent Types
1. **perplexity-researcher** - Fast Perplexity API searches (web/current events)
2. **claude-researcher** - Claude WebSearch with intelligent query decomposition (academic/detailed)
3. **gemini-researcher** - Google Gemini multi-perspective research (synthesis)

### Research Modes
- **Quick**: 3 agents (1 of each type) → 2 minute timeout
- **Standard**: 9 agents (3 of each type) → 3 minute timeout (default)
- **Extensive**: 24 agents (8 of each type) → 10 minute timeout

---

## Architecture

```
User Research Request
    ↓
Research Skill Activated
    ↓
Mode Selection (Quick/Standard/Extensive)
    ↓
Query Decomposition
    ├─ Quick: 3 sub-questions
    ├─ Standard: 9 sub-questions
    └─ Extensive: 24 sub-questions (with be-creative skill for diversity)
    ↓
Parallel Agent Launch (SINGLE message, multiple Task calls)
    ├─ Perplexity Agents (web search, current events)
    ├─ Claude Agents (academic, detailed analysis)
    └─ Gemini Agents (multi-perspective synthesis)
    ↓
Concurrent Execution
    ├─ Each agent: 1 main query + optional 1 follow-up
    ├─ Timeout enforcement (2/3/10 minutes)
    └─ Results collected as they complete
    ↓
Result Synthesis
    ├─ Combine findings from all agents
    ├─ Confidence levels per finding
    ├─ Source attribution
    └─ Identify gaps or conflicting information
    ↓
Comprehensive Research Report
    ├─ Executive summary
    ├─ Key findings with confidence scores
    ├─ Detailed analysis per sub-question
    ├─ Source citations
    └─ Recommendations for follow-up
    ↓
Archive to History
    └─ ${PAI_DIR}/history/research/YYYY-MM-DD_[topic]/
```

---

## Key Features

### 1. Massive Parallelization

**Problem**: Traditional research is sequential - one query, wait, next query, wait → 5-10 minutes
**Solution**: Launch 3-24 agents simultaneously in a single message

**Implementation**:
```typescript
// SINGLE message with multiple Task tool calls
Task({ subagent_type: "perplexity-researcher", ... })
Task({ subagent_type: "perplexity-researcher", ... })
Task({ subagent_type: "perplexity-researcher", ... })
Task({ subagent_type: "claude-researcher", ... })
Task({ subagent_type: "claude-researcher", ... })
// ... up to 24 total agents
```

**Result**: All agents execute concurrently → Results in 15-180 seconds

---

### 2. Three Research Modes

**Quick Research (3 agents)**:
- Use case: Simple queries, straightforward questions, quick facts
- Agents: 1 Perplexity + 1 Claude + 1 Gemini
- Timeout: 2 minutes
- Speed: ~15-30 seconds typical
- Triggers: "quick research", "fast lookup"

**Standard Research (9 agents - DEFAULT)**:
- Use case: Most research needs, balanced coverage
- Agents: 3 Perplexity + 3 Claude + 3 Gemini
- Timeout: 3 minutes
- Speed: ~30-60 seconds typical
- Triggers: "do research", "research this", "find information about"

**Extensive Research (24 agents)**:
- Use case: Deep-dive analysis, multi-domain investigation, comprehensive reports
- Agents: 8 Perplexity + 8 Claude + 8 Gemini
- Timeout: 10 minutes
- Speed: ~45-180 seconds typical
- Triggers: "extensive research", "comprehensive analysis", "deep dive"
- Special: Uses **be-creative skill** with UltraThink for maximum query diversity

---

### 3. Intelligent Query Decomposition

**Approach**:
1. Analyze research question to identify key aspects
2. Break into focused sub-questions (3/9/24 depending on mode)
3. Assign sub-questions to appropriate agent types:
   - **Perplexity**: Current events, web content, recent developments
   - **Claude**: Academic analysis, detailed explanations, technical depth
   - **Gemini**: Multi-perspective synthesis, comparative analysis, trends

**Example Decomposition**:

**Research Question**: "What are the latest developments in quantum computing?"

**Quick Mode (3 queries)**:
- Perplexity: "Latest quantum computing breakthroughs 2025-2026"
- Claude: "Current state of quantum computing hardware and algorithms"
- Gemini: "Quantum computing commercial applications and future outlook"

**Standard Mode (9 queries)**:
- Perplexity 1: "Quantum computing hardware breakthroughs 2026"
- Perplexity 2: "Quantum computing startups and funding rounds 2025-2026"
- Perplexity 3: "Google/IBM quantum computing announcements recent"
- Claude 1: "Quantum error correction state-of-the-art techniques"
- Claude 2: "Quantum algorithms for cryptography and optimization"
- Claude 3: "Quantum supremacy claims and verification methods"
- Gemini 1: "Quantum computing vs classical computing capabilities comparison"
- Gemini 2: "Quantum computing impact on AI and machine learning"
- Gemini 3: "Timeline and barriers to practical quantum computing"

**Extensive Mode (24 queries)**:
- Uses **be-creative skill** to generate 24 diverse, creative research angles
- Explores unusual perspectives, cross-disciplinary connections, edge cases
- Questions assumptions, considers historical context and future implications
- Organized into 3 groups of 8 (optimized per agent type)

---

### 4. Timeout Enforcement & Partial Results

**Critical Design Decision**: Don't wait indefinitely for slow agents

**Timeout Rules**:
- Quick: 2 minutes → Proceed with available results
- Standard: 3 minutes → Proceed with available results
- Extensive: 10 minutes → Proceed with available results

**Behavior After Timeout**:
- Synthesize findings from completed agents (even if some are still running)
- Note which agents completed vs timed out
- Proceed with partial results rather than blocking
- Include confidence scores reflecting coverage level

**Example**: If 7 of 9 agents complete in 3 minutes, synthesize from those 7 and note 2 agents timed out.

---

### 5. Scratchpad → History Pattern

**Working Directory (Temporary)**:
```
${PAI_DIR}/scratchpad/YYYY-MM-DD-HHMMSS_research-[topic]/
├── raw-outputs/
│   ├── perplexity-001.md
│   ├── perplexity-002.md
│   ├── claude-001.md
│   ├── claude-002.md
│   ├── gemini-001.md
│   └── gemini-002.md
├── synthesis-notes.md
├── query-decomposition.md
└── draft-report.md
```

**Permanent Archive**:
```
${PAI_DIR}/history/research/YYYY-MM-DD_[topic]/
├── README.md (research documentation)
├── research-report.md (final comprehensive report)
├── key-findings.md (executive summary)
└── metadata.json (sources, agents used, timestamps)
```

**Process**:
1. Create scratchpad directory for active research
2. Collect all agent outputs in `raw-outputs/`
3. Draft synthesis and report in scratchpad
4. Move final deliverables to `history/research/` when complete
5. Clean up scratchpad (keep raw outputs if needed for reference)

---

### 6. Comprehensive Synthesis & Reporting

**Synthesis Process**:
1. **Collect Results**: Gather outputs from all completed agents
2. **Identify Patterns**: Find common themes, consensus, and conflicts
3. **Assign Confidence**: Score findings based on source agreement and quality
4. **Source Attribution**: Link each finding to specific sources and agents
5. **Gap Analysis**: Identify areas with insufficient coverage or conflicting data
6. **Format Report**: Structure as executive summary + detailed findings + sources

**Report Structure**:
```markdown
# Research Report: [Topic]

## Executive Summary
[3-5 key findings with highest confidence]

## Key Findings

### Finding 1: [Title]
**Confidence**: 95% (8/9 agents agree)
**Sources**: [List of agent outputs and URLs]
**Details**: [Comprehensive explanation]

### Finding 2: [Title]
**Confidence**: 80% (6/9 agents agree, 1 conflicting)
**Sources**: [List of agent outputs and URLs]
**Details**: [Comprehensive explanation]
**Conflicting Information**: [What disagreements exist]

## Detailed Analysis

### Sub-Question 1: [Question]
[Findings from agents addressing this angle]

### Sub-Question 2: [Question]
[Findings from agents addressing this angle]

## Gaps and Limitations
- [Areas with insufficient information]
- [Questions requiring follow-up research]

## Recommendations
- [Next steps or additional research needed]

## Methodology
- **Research Mode**: Standard (9 agents)
- **Agents Used**: 3 Perplexity, 3 Claude, 3 Gemini
- **Query Decomposition**: [How questions were split]
- **Completion Rate**: 7/9 agents (2 timed out)

## Sources
[Complete list of URLs and references from all agents]
```

---

## Use Cases

### Use Case 1: Quick Fact Checking (Quick Mode)

**Scenario**: User needs fast verification of a claim or basic information

**Trigger**: "Quick research: Did GPT-5 get released in 2025?"

**Workflow**:
1. Skill activates in Quick Mode (3 agents)
2. Query decomposition:
   - Perplexity: "GPT-5 release announcement 2025"
   - Claude: "OpenAI GPT model releases timeline"
   - Gemini: "GPT-5 vs GPT-4 comparison features"
3. Launch 3 agents in parallel (single message)
4. Wait 2 minutes or until all complete
5. Synthesize: Check consensus, identify conflicts
6. Report: Quick answer with confidence level

**Expected Time**: 15-30 seconds
**Expected Output**: Brief answer with sources, confidence score

---

### Use Case 2: Balanced Research Topic (Standard Mode)

**Scenario**: User researching a topic for decision-making or learning

**Trigger**: "Research the current state of renewable energy storage technologies"

**Workflow**:
1. Skill activates in Standard Mode (9 agents, default)
2. Query decomposition into 9 sub-questions:
   - Perplexity agents: Recent developments, commercial products, market trends
   - Claude agents: Technical analysis, efficiency comparisons, scientific papers
   - Gemini agents: Future outlook, cost-benefit analysis, adoption barriers
3. Launch 9 agents in parallel (single message)
4. Wait 3 minutes or until all complete
5. Synthesize findings with confidence levels
6. Format comprehensive report
7. Archive to history

**Expected Time**: 30-90 seconds
**Expected Output**: Comprehensive report with executive summary, detailed findings, sources

---

### Use Case 3: Deep-Dive Investigation (Extensive Mode)

**Scenario**: User needs exhaustive research across multiple domains

**Trigger**: "Do extensive research on the impact of AI on healthcare"

**Workflow**:
1. Skill activates in Extensive Mode (24 agents)
2. **Use be-creative skill** for query generation:
   - UltraThink: Explore unusual perspectives, cross-disciplinary angles
   - Generate 24 diverse research questions
   - Organize into 3 groups of 8 (optimized per agent type)
3. Launch 24 agents in parallel (single message)
4. Wait 10 minutes or until all complete
5. Synthesize massive dataset:
   - Identify themes across all findings
   - Map relationships between different perspectives
   - Note consensus vs controversy
6. Generate comprehensive multi-section report
7. Archive with all raw outputs for future reference

**Expected Time**: 45-180 seconds
**Expected Output**: Extensive multi-section report, executive summary, detailed appendices

---

### Use Case 4: Current Events Monitoring

**Scenario**: Tracking recent developments in fast-moving situation

**Trigger**: "Research latest developments in [breaking news topic]"

**Workflow**:
1. Skill activates in Standard Mode
2. Heavy emphasis on Perplexity agents (current web search)
3. Query decomposition focuses on:
   - Timeline of events
   - Key players and statements
   - Expert reactions and analysis
   - Conflicting reports or claims
4. Launch agents with focus on recency
5. Synthesize with attention to source credibility
6. Report with clear timeline and confidence levels per claim

**Expected Time**: 30-60 seconds
**Expected Output**: Timeline-based report with source credibility assessment

---

### Use Case 5: Technical Deep Dive

**Scenario**: Understanding complex technical topic in depth

**Trigger**: "Research how transformer architecture works in LLMs"

**Workflow**:
1. Skill activates in Standard or Extensive Mode
2. Heavy emphasis on Claude agents (academic/detailed analysis)
3. Query decomposition includes:
   - Fundamental concepts and mathematical foundations
   - Architecture components (attention mechanism, embeddings, etc.)
   - Training methodology and data requirements
   - Practical implementations and variations
   - Performance characteristics and limitations
4. Launch agents optimized for technical depth
5. Synthesize with focus on accuracy and clarity
6. Format report with progressive complexity (overview → deep technical details)

**Expected Time**: 60-120 seconds
**Expected Output**: Multi-level technical explanation (ELI5 → expert detail)

---

## Dependencies

### Runtime Requirements
- **Claude Code CLI** - For Task tool and agent spawning
- **Anthropic API Key** - Required for claude-researcher agents
- **Perplexity API Key** - Required for perplexity-researcher agents
- **Google Gemini API Key** - Required for gemini-researcher agents

### PAI Skills Integration
- **be-creative** (Optional) - Used in Extensive Mode for creative query generation
- **CORE** - PAI context loading (optional but recommended)

### Agent Availability
- Requires perplexity-researcher, claude-researcher, and gemini-researcher agents configured in Claude Code
- If any agent type unavailable, skill can still function with remaining agents

---

## Skill Integration Points

### Reads From
- `${PAI_DIR}/.claude/skills/CORE/SKILL.md` (optional) - Full PAI context
- `${PAI_DIR}/.claude/skills/be-creative/SKILL.md` (Extensive Mode) - Creative query generation
- User request message for research topic and mode selection

### Writes To
- `${PAI_DIR}/scratchpad/YYYY-MM-DD-HHMMSS_research-[topic]/` - Working directory
  - `raw-outputs/` - Individual agent results
  - `synthesis-notes.md` - Synthesis process notes
  - `query-decomposition.md` - How queries were split
  - `draft-report.md` - Report drafts
- `${PAI_DIR}/history/research/YYYY-MM-DD_[topic]/` - Permanent archive
  - `README.md` - Research documentation
  - `research-report.md` - Final report
  - `key-findings.md` - Executive summary
  - `metadata.json` - Tracking data

### Spawns Agents
- **perplexity-researcher** (1-8 instances per research request)
- **claude-researcher** (1-8 instances per research request)
- **gemini-researcher** (1-8 instances per research request)

---

## Configuration

### Research Mode Selection

**Automatic Mode Selection**:
```javascript
// Quick Mode triggers
if (request.includes("quick research") || request.includes("fast lookup")) {
  mode = "quick";  // 3 agents
}

// Extensive Mode triggers
else if (request.includes("extensive research") ||
         request.includes("comprehensive analysis") ||
         request.includes("deep dive")) {
  mode = "extensive";  // 24 agents
}

// Standard Mode (default)
else {
  mode = "standard";  // 9 agents
}
```

### Timeout Configuration

**Default Timeouts** (configured in SKILL.md):
```javascript
const TIMEOUTS = {
  quick: 120000,      // 2 minutes
  standard: 180000,   // 3 minutes
  extensive: 600000   // 10 minutes
};
```

**Custom Timeouts** (can be overridden per request):
```javascript
// If user specifies timeout
if (request.includes("timeout:")) {
  customTimeout = extractTimeout(request);
}
```

### Agent Distribution

**Default Distribution**:
```javascript
const AGENT_DISTRIBUTION = {
  quick: { perplexity: 1, claude: 1, gemini: 1 },
  standard: { perplexity: 3, claude: 3, gemini: 3 },
  extensive: { perplexity: 8, claude: 8, gemini: 8 }
};
```

**Custom Distribution** (for specialized research):
```javascript
// Example: Current events research (favor Perplexity)
const CURRENT_EVENTS = {
  perplexity: 5,
  claude: 2,
  gemini: 2
};

// Example: Technical research (favor Claude)
const TECHNICAL_DEEP_DIVE = {
  perplexity: 2,
  claude: 5,
  gemini: 2
};
```

### Query Decomposition Strategy

**Extensive Mode with be-creative**:
```markdown
<instructions>
ULTRATHINK + VERBALIZED SAMPLING MODE:

STEP 1 - ULTRATHINK:
Think deeply and extensively about this research topic:
- Explore multiple unusual perspectives and domains
- Question all assumptions about what's relevant
- Make unexpected connections across different fields
- Consider edge cases, controversies, and emerging trends
- Think about historical context, future implications, and cross-disciplinary angles
- What questions would experts from different fields ask?

STEP 2 - GENERATE 24 DIVERSE RESEARCH QUERIES:
Based on your deep thinking, generate 24 unique research angles/sub-questions.
Each should be distinct, creative, and explore a different facet of the topic.
Mix different types: technical, historical, practical, controversial, emerging, comparative, etc.

Organize them into 3 groups of 8:
- Group 1 (Perplexity): [8 queries optimized for broad web search]
- Group 2 (Claude): [8 queries optimized for academic/detailed analysis]
- Group 3 (Gemini): [8 queries optimized for multi-perspective synthesis]
</instructions>
```

---

## Performance Characteristics

### Speed Benchmarks

**Quick Mode (3 agents)**:
- Best case: 15-20 seconds (all agents return quickly)
- Typical case: 20-30 seconds
- Worst case: 120 seconds (timeout)
- Average: ~25 seconds

**Standard Mode (9 agents)**:
- Best case: 30-45 seconds
- Typical case: 45-90 seconds
- Worst case: 180 seconds (timeout)
- Average: ~60 seconds

**Extensive Mode (24 agents)**:
- Best case: 45-90 seconds
- Typical case: 90-150 seconds
- Worst case: 600 seconds (timeout)
- Average: ~120 seconds

### API Cost Estimates

**Per Research Request**:
- Quick Mode: ~$0.10-0.30 (depends on API providers)
- Standard Mode: ~$0.30-1.00
- Extensive Mode: ~$1.00-3.00

**Token Usage** (approximate):
- Query decomposition: ~500-2000 tokens
- Agent execution: ~1000-5000 tokens per agent
- Synthesis: ~2000-5000 tokens
- Total (Standard): ~15,000-50,000 tokens

### Throughput

**Concurrent Research Requests**:
- Each request spawns 3-24 agents
- Agents run independently
- Can handle multiple research requests in parallel
- Practical limit: ~3-5 concurrent research requests (to avoid API rate limits)

---

## Security Considerations

### API Key Management

**Requirement**: Research skill requires API keys for:
- Perplexity API (`PERPLEXITY_API_KEY`)
- Anthropic API (`ANTHROPIC_API_KEY`)
- Google Gemini API (`GEMINI_API_KEY`)

**Best Practices**:
- Store keys in environment variables (never hardcode)
- Use separate keys for different projects if possible
- Monitor API usage to detect anomalies
- Rotate keys periodically

### Data Privacy

**Considerations**:
- Research queries sent to third-party APIs (Perplexity, Google)
- Results may be logged by API providers
- Avoid researching sensitive/confidential topics with public APIs
- Consider using local LLMs for sensitive research

**Mitigations**:
- Review API provider privacy policies
- Use generic queries when possible
- Archive research locally (scratchpad → history pattern)
- Don't include PII in research queries

### Rate Limiting

**API Rate Limits**:
- Perplexity: Varies by plan (check current limits)
- Claude: Varies by plan (check current limits)
- Gemini: Varies by plan (check current limits)

**Handling**:
- Skill attempts to stay within limits through timeout enforcement
- If rate limited, agents may fail gracefully
- Synthesis proceeds with partial results
- Consider upgrading API plans for heavy research usage

---

## Future Enhancements

### Potential Additions

1. **Custom Agent Types**: Support for additional research agents (Bing, DuckDuckGo, Tavily, etc.)
2. **Smart Agent Selection**: Automatically choose agent types based on query characteristics
3. **Result Caching**: Cache common queries to reduce API costs and improve speed
4. **Interactive Refinement**: Allow user to request follow-up research on specific findings
5. **Export Formats**: Generate reports in PDF, HTML, Markdown, JSON formats
6. **Source Quality Scoring**: Evaluate and rank sources by credibility and relevance
7. **Multi-Language Support**: Research in languages other than English
8. **Visual Data Integration**: Incorporate charts, graphs, and images into reports

---

## Credits & Acknowledgments

**Created by**: Kai (Personal AI Infrastructure)
**Research Agents**: Anthropic Claude, Perplexity AI, Google Gemini
**Inspiration**: Parallel computing patterns, distributed systems research
**Pack Format**: Anthropic Pack v2.0 specification

---

## Related Packs

- **be-creative** - Used for creative query generation in Extensive Mode
- **CORE** - PAI context loading and configuration
- **fabric** - Pattern-based content processing (can be used on research results)

---

**Pack Version**: 2.0
**Last Updated**: 2026-01-03
**Compatibility**: Claude Code 0.2.0+, Anthropic API, Perplexity API, Gemini API
