---
name: content-scanner
description: Scans high-value AI/coding YouTube channels and digital sources to find content worth investigating for PAI enhancement. Auto-scans at session start and supports manual triggers. USE WHEN user says 'scan channels', 'what's new', 'AI news', 'check sources', or wants to find new AI/coding knowledge.
---

# Content Scanner Skill

## When to Activate This Skill

- User says "scan channels" or "scan sources"
- User asks "what's new" or "what's new in AI"
- User requests "AI news" or "coding news"
- User says "check sources" or "check my channels"
- User wants to find new content for PAI enhancement
- Automatically on session start (via hook)

## Core Workflow

### Manual Scan

When user requests a scan:

1. **Fetch RSS feeds** from all sources in parallel using Task agents
2. **Filter by recency** - only content from last 7 days (configurable)
3. **Score with VPM** - use Fabric's `rate_value` pattern concepts
4. **Apply PAI boosters** - +2 VPM for PAI-relevant keywords
5. **Store findings** in Memory MCP for cross-session persistence
6. **Present digest** - sorted by effective VPM score

### Automatic Scan (SessionStart)

- Runs on every session start
- Quick mode: Only Tier 1 sources, last 24 hours
- Brief output: Shows count and top 3 items only
- Full details available via "show AI news" command

## Knowledge Sources (Hardcoded)

### Tier 1 - Priority (Daily)

| Source | Type | RSS/Feed URL | Focus |
|--------|------|--------------|-------|
| Daniel Miessler | YouTube | `https://www.youtube.com/feeds/videos.xml?channel_id=UCnCikd0s4i9KoDtaHPlK-JA` | Fabric, AI security |
| Fireship | YouTube | `https://www.youtube.com/feeds/videos.xml?channel_id=UCsBjURrPoezykLs9EqgamOA` | AI tools, quick updates |
| Simon Willison | Blog | `https://simonwillison.net/atom/everything/` | Practical LLM implementation |
| AI Explained | YouTube | `https://www.youtube.com/feeds/videos.xml?channel_id=UCNJ1Ymd5yFuUPtn21xtRbbw` | AI news breakdown |
| Andrej Karpathy | YouTube | `https://www.youtube.com/feeds/videos.xml?channel_id=UCXUPKJO5MZQN11PqgIvyuvQ` | LLM fundamentals |

### Tier 2 - Regular (2-3x/week)

| Source | Type | RSS/Feed URL | Focus |
|--------|------|--------------|-------|
| ThePrimeagen | YouTube | `https://www.youtube.com/feeds/videos.xml?channel_id=UC8ENHE5xdFSwx71u3fDH5Xw` | Developer productivity |
| Two Minute Papers | YouTube | `https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg` | AI research summaries |
| Hacker News (AI) | Forum | `https://hnrss.org/newest?q=AI+OR+LLM+OR+Claude+OR+GPT` | Breaking tech news |

### Tier 3 - Watch (Weekly)

| Source | Type | RSS/Feed URL | Focus |
|--------|------|--------------|-------|
| DeepLearning.AI | YouTube | `https://www.youtube.com/feeds/videos.xml?channel_id=UCcIXc5mJsHVYTZR1maL5l9w` | Structured courses |
| Sam Witteveen | YouTube | `https://www.youtube.com/feeds/videos.xml?channel_id=UCH1L5U0fvIlIf_1VRrYeKTQ` | Agents, RAG tutorials |
| LangChain Blog | Blog | `https://blog.langchain.dev/rss/` | Framework updates |

## VPM Scoring System

### Base VPM Calculation

Content is scored using concepts from Fabric's `rate_value` pattern:

| VPM Score | Meaning | Action |
|-----------|---------|--------|
| 8-10 | Exceptional value | Must watch/read |
| 6-7 | High value | Recommended |
| 4-5 | Moderate value | Optional |
| 1-3 | Low value | Skip |

### PAI-Specific Boosters (+1-2 VPM)

Apply these boosters when content contains:

**+2 VPM:**
- "Claude Code", "MCP server", "Model Context Protocol"
- "AI agents", "multi-agent", "agent orchestration"
- "Fabric patterns", "Daniel Miessler"
- "prompt engineering", "context engineering"

**+1 VPM:**
- "Claude", "Anthropic", "Sonnet", "Opus"
- "RAG", "vector database", "embeddings"
- "LLM", "GPT-4", "Gemini"
- "coding assistant", "AI tools"
- "TypeScript", "Python", "Node.js"

### Learned Adjustments

The learning system tracks your interactions:

- **Starred content**: Boosts similar source/topic VPM by +0.5
- **Watched content**: Minor boost +0.1
- **Skipped content**: Reduces source VPM by -0.2
- **Explicit feedback**: "skip source X" reduces all X content by -1.0

Adjustments are stored in `learning-state.json` and applied automatically.

## Commands

### Full Scan
```
"scan channels" | "scan all sources" | "full content scan"
```
Scans all tiers, last 7 days, full VPM analysis.

### Quick Digest
```
"what's new" | "AI news" | "show digest"
```
Shows recent high-value findings from Memory MCP cache.

### Source-Specific
```
"check Daniel Miessler" | "scan Anthropic blog"
```
Scans specific source only.

### Feedback Commands
```
"mark [title] as watched" - Records viewing, minor VPM boost
"star [title]" - Significant boost to similar content
"skip [source]" - Reduces priority of source
"reset learning" - Clears learned preferences
```

## Implementation Details

### Parallel Scanning

Use Task tool with multiple agents for parallel RSS fetching:

```typescript
// Launch parallel fetch agents for each source
const agents = sources.map(source => ({
  type: 'haiku',
  prompt: `Fetch RSS from ${source.url} and extract:
    - Title, URL, Published date
    - Brief description/summary
    Return as JSON array.`
}));
```

### Memory MCP Integration

Store findings with these entities:

```typescript
// ContentScanner_Queue - Items pending review
{
  entityType: "ContentQueue",
  name: "ContentScanner_Queue",
  observations: [
    "Item: [title] | Source: [source] | VPM: [score] | URL: [url]",
    // ...more items
  ]
}

// ContentScanner_History - Interaction history for learning
{
  entityType: "ContentHistory",
  name: "ContentScanner_History",
  observations: [
    "WATCHED: [title] | [date]",
    "STARRED: [title] | [date]",
    "SKIPPED: [source] | [date]",
  ]
}

// ContentScanner_Learned - VPM adjustments
{
  entityType: "LearnedPreferences",
  name: "ContentScanner_Learned",
  observations: [
    "SOURCE_BOOST: Daniel Miessler: +0.5",
    "SOURCE_PENALTY: TechBro Channel: -1.0",
    "TOPIC_BOOST: MCP servers: +0.8",
  ]
}
```

### Scan Execution Steps

**Step 1: Gather Sources**
```typescript
const sources = getTierSources(mode); // mode: 'quick'|'full'
const lookback = mode === 'quick' ? '24h' : '7d';
```

**Step 2: Fetch in Parallel**
```typescript
// Use Task tool with haiku model for speed
sources.forEach(source => {
  Task({
    prompt: `Fetch ${source.url}, extract items from last ${lookback}`,
    model: 'haiku'
  });
});
```

**Step 3: Score Content**
```typescript
items.forEach(item => {
  let vpm = baseVPM(item);
  vpm += paiBooster(item);
  vpm += learnedAdjustment(item.source);
  item.effectiveVPM = vpm;
});
```

**Step 4: Store and Present**
```typescript
// Store in Memory MCP
mcp__memory__create_entities([{
  name: "ContentScanner_Queue",
  entityType: "ContentQueue",
  observations: items.map(formatItem)
}]);

// Present digest sorted by VPM
presentDigest(items.filter(i => i.effectiveVPM >= 4));
```

## Output Format

### Quick Digest (SessionStart)
```
[Content Scanner] 5 new items since last scan

TOP 3:
1. [VPM 8.5] "Building MCP Servers with Claude" - Daniel Miessler (2h ago)
2. [VPM 7.2] "Claude 4 Features Deep Dive" - Anthropic Blog (5h ago)
3. [VPM 6.8] "AI Coding Assistant Comparison" - Fireship (12h ago)

Say "show AI news" for full list or "scan channels" for fresh scan.
```

### Full Digest
```
[Content Scanner] Full scan complete - 23 items found

MUST WATCH (VPM 7+):
- [VPM 8.5] "Building MCP Servers" - Daniel Miessler
  URL: https://...
- [VPM 7.2] "Claude 4 Features" - Anthropic Blog
  URL: https://...

RECOMMENDED (VPM 4-7):
- [VPM 6.1] "LangChain v0.3" - LangChain Blog
- [VPM 5.8] "RAG Best Practices" - Sam Witteveen
- [VPM 4.5] "AI News Roundup" - AI Explained

SKIPPED (VPM <4): 15 items

Commands: "mark [title] watched" | "star [title]" | "skip [source]"
```

## Learning State File

Location: `${PAI_DIR}/skills/content-scanner/learning-state.json`

```json
{
  "version": "1.0",
  "lastScan": "2025-01-15T10:30:00Z",
  "sourceAdjustments": {
    "Daniel Miessler": 0.5,
    "Anthropic Blog": 0.3,
    "Random Tech Channel": -0.8
  },
  "topicBoosts": {
    "MCP": 0.8,
    "Claude Code": 0.6,
    "prompt engineering": 0.4
  },
  "interactions": [
    {"type": "starred", "title": "...", "source": "...", "date": "..."},
    {"type": "watched", "title": "...", "source": "...", "date": "..."},
    {"type": "skipped", "source": "...", "date": "..."}
  ],
  "decayFactor": 0.95,
  "lastDecayApplied": "2025-01-14T00:00:00Z"
}
```

## Key Principles

1. **Value-first scanning** - Only surface content worth your time (VPM >= 4)
2. **PAI-relevant boosting** - Prioritize content that enhances PAI capabilities
3. **Learning from feedback** - System improves based on your interactions
4. **Parallel efficiency** - Fetch multiple sources simultaneously
5. **Cross-session persistence** - Memory MCP maintains state across sessions
