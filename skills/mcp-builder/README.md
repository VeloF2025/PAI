# mcp-builder - MCP Server Development Framework

**Pack Version**: 2.0
**Skill Type**: Complex (Multi-phase development framework)
**License**: See LICENSE.txt for complete terms

---

## Overview

**mcp-builder** is a comprehensive framework for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Whether you're building Python (FastMCP) or TypeScript (MCP SDK) servers, this framework guides you through research, implementation, testing, and evaluation phases to create production-ready MCP integrations.

**Quality Metric**: MCP server quality is measured by how well it enables LLMs to accomplish real-world tasks using only the provided tools.

---

## What's Included

### Core Components

**Guides and References** (4 comprehensive guides):
1. **MCP Best Practices** (`reference/mcp_best_practices.md`) - Universal MCP guidelines
2. **Python Implementation Guide** (`reference/python_mcp_server.md`) - FastMCP patterns
3. **TypeScript Implementation Guide** (`reference/node_mcp_server.md`) - MCP SDK patterns
4. **Evaluation Guide** (`reference/evaluation.md`) - Quality testing framework

**Evaluation Tools** (Python scripts for automated testing):
- `scripts/evaluation.py` - Run evaluations against MCP servers
- `scripts/connections.py` - Test MCP server connections
- `scripts/example_evaluation.xml` - Example evaluation format

**Reference Implementation**:
- **BOSS Ghost MCP** - Advanced browser automation server demonstrating Phase 2 autonomous features, session persistence, self-healing selectors, and quality integration

---

## Architecture

### Four-Phase Development System

```
Phase 1: Deep Research and Planning
    ├─ Understand Modern MCP Design
    │   ├─ API Coverage vs. Workflow Tools balance
    │   ├─ Tool Naming and Discoverability
    │   ├─ Context Management (concise descriptions, filtering)
    │   └─ Actionable Error Messages
    ├─ Study MCP Protocol Documentation
    │   ├─ Fetch sitemap: modelcontextprotocol.io/sitemap.xml
    │   ├─ Load specific pages with .md suffix
    │   └─ Review spec, transports, tool/resource/prompt definitions
    ├─ Study Framework Documentation
    │   ├─ Load MCP Best Practices (./reference/mcp_best_practices.md)
    │   ├─ Load SDK docs (TypeScript/Python from GitHub)
    │   └─ Review language-specific guides
    └─ Plan Your Implementation
        ├─ Understand target API
        ├─ Prioritize comprehensive API coverage
        └─ List endpoints to implement
    ↓
Phase 2: Implementation
    ├─ Set Up Project Structure
    │   ├─ TypeScript: package.json, tsconfig.json, src/
    │   └─ Python: module organization, dependencies
    ├─ Implement Core Infrastructure
    │   ├─ API client with authentication
    │   ├─ Error handling helpers
    │   ├─ Response formatting (JSON/Markdown)
    │   └─ Pagination support
    └─ Implement Tools
        ├─ Input Schema (Zod/Pydantic)
        ├─ Output Schema (outputSchema, structuredContent)
        ├─ Tool Description (concise, with examples)
        ├─ Implementation (async/await, error handling)
        └─ Annotations (readOnlyHint, destructiveHint, etc.)
    ↓
Phase 3: Review and Test
    ├─ Code Quality Review
    │   ├─ No duplicated code (DRY)
    │   ├─ Consistent error handling
    │   ├─ Full type coverage
    │   └─ Clear tool descriptions
    └─ Build and Test
        ├─ Compilation/syntax verification
        └─ MCP Inspector testing
    ↓
Phase 4: Create Evaluations
    ├─ Understand Evaluation Purpose
    ├─ Create 10 Evaluation Questions
    │   ├─ Tool Inspection
    │   ├─ Content Exploration (read-only ops)
    │   ├─ Question Generation
    │   └─ Answer Verification
    ├─ Evaluation Requirements
    │   ├─ Independent questions
    │   ├─ Read-only operations only
    │   ├─ Complex (multiple tool calls)
    │   ├─ Realistic use cases
    │   ├─ Verifiable single answer
    │   └─ Stable answers (won't change)
    └─ Output Format (XML with qa_pairs)
```

---

## Key Features

### 1. Research-Driven Development

**What It Does**: Guides you through comprehensive research before writing code

**Components**:
- **Modern MCP Design Principles**: API coverage vs. workflow tools, naming conventions, context management
- **Protocol Study**: Load MCP specification from modelcontextprotocol.io
- **Framework Documentation**: Fetch TypeScript SDK and Python SDK from GitHub
- **API Understanding**: Research target service documentation

**Why It Matters**: Informed design decisions lead to better tool quality and LLM effectiveness

---

### 2. Dual-Language Support

**What It Does**: Provides complete implementation guides for both Python and TypeScript

**Python (FastMCP)**:
- Pydantic models for input/output schemas
- `@mcp.tool` decorator for tool registration
- FastAPI-style async patterns
- Complete working examples

**TypeScript (MCP SDK - Recommended)**:
- Zod schemas for type safety
- `server.registerTool` registration pattern
- Streamable HTTP transport (preferred for remote servers)
- Better compatibility across execution environments

**Why TypeScript is Recommended**:
- High-quality SDK support
- Good compatibility in many execution environments (e.g., MCPB)
- AI models excel at generating TypeScript code
- Static typing + good linting tools
- Broad usage in community

---

### 3. MCP Best Practices Framework

**What It Covers**: Universal guidelines for all MCP servers

**Server Naming**:
- Python: `{service}_mcp` (e.g., `slack_mcp`)
- TypeScript: `{service}-mcp-server` (e.g., `slack-mcp-server`)

**Tool Naming**:
- snake_case with service prefix
- Format: `{service}_{action}_{resource}`
- Examples: `slack_send_message`, `github_create_issue`

**Response Formats**:
- JSON: Machine-readable structured data
- Markdown: Human-readable formatted text (typically default)
- Support both for flexibility

**Pagination**:
- Always respect `limit` parameter
- Return `has_more`, `next_offset`, `total_count`
- Default to 20-50 items
- Never load all results into memory

**Transport Selection**:
- **Streamable HTTP**: Remote servers, multi-client scenarios (preferred)
- **stdio**: Local integrations, command-line tools
- Avoid SSE (deprecated)

**Tool Annotations**:
- `readOnlyHint`: true/false
- `destructiveHint`: true/false
- `idempotentHint`: true/false
- `openWorldHint`: true/false

---

### 4. Comprehensive Evaluation System

**What It Does**: Tests whether LLMs can effectively use your MCP server

**Evaluation Requirements**:
- Create 10 human-readable questions
- **READ-ONLY** operations only (non-destructive)
- **INDEPENDENT** questions (no dependencies)
- **COMPLEX** requiring multiple (potentially dozens) of tool calls
- **REALISTIC** use cases humans would care about
- **VERIFIABLE** with single, stable answers

**Evaluation Process**:
1. **Tool Inspection**: List available tools, understand capabilities
2. **Content Exploration**: Use read-only operations to explore data
3. **Question Generation**: Create 10 complex, realistic questions
4. **Answer Verification**: Solve each question yourself to verify

**Output Format**:
```xml
<evaluation>
  <qa_pair>
    <question>Find discussions about AI model launches with animal codenames. One model needed a specific safety designation that uses the format ASL-X. What number X was being determined for the model named after a spotted wild cat?</question>
    <answer>3</answer>
  </qa_pair>
  <!-- More qa_pairs... -->
</evaluation>
```

**Evaluation Scripts**:
- `scripts/evaluation.py`: Run evaluations automatically
- `scripts/connections.py`: Test MCP server connections
- `scripts/example_evaluation.xml`: Template for evaluation format

---

### 5. BOSS Ghost MCP Reference Implementation

**What It Is**: Advanced browser automation server demonstrating Phase 2 autonomous features

**Why Study BOSS Ghost**:
- **Advanced Tool Design**: Autonomous features (BFS exploration, CAPTCHA detection, self-healing selectors)
- **Session Persistence**: File-based state management (`~/.boss-ghost-mcp/sessions/`)
- **Progressive Enhancement**: Built on Chrome DevTools with enhanced capabilities
- **Stealth Features**: Advanced browser automation patterns
- **Integration Patterns**: Full TDD workflows and quality gates

**Key Features Demonstrated**:

1. **Autonomous Exploration Tool**:
   ```typescript
   autonomous_explore(startUrl, maxDepth, maxPages, detectErrors, captureScreenshots)
     → BFS site crawling with comprehensive bug detection
   ```
   - Clear parameter descriptions with constraints
   - Actionable output (sitemap + bug report)
   - Configurable depth/limits for client control
   - Non-destructive exploration (read-only hint)

2. **Session Persistence Tools**:
   ```typescript
   save_page_state(sessionId, includeFormData)
   restore_page_state(sessionId, restoreFormData)
     → File-based session storage for resumable workflows
   ```
   - Stateful operations with clear session management
   - Optional parameters for granular control
   - Idempotent operations (safe to call multiple times)

3. **Self-Healing Selectors** (smart_click):
   ```typescript
   smart_click(selector)
     → 7-tier fallback strategy for robust element location
   ```
   - Single parameter with intelligent fallback logic
   - Detailed result reporting (which strategy succeeded)
   - Error messages guide toward solutions

4. **CAPTCHA Detection Suite**:
   ```typescript
   detect_captcha() → Returns type, confidence, location
   wait_for_captcha(timeout) → Waits for CAPTCHA appearance
   wait_for_captcha_solved(captchaType, timeout) → Monitors solution
   ```
   - Specialized tools for complex workflows
   - Progressive disclosure (basic → advanced features)
   - Clear timeout/configuration options

**Integration with Development Workflows**:
- **TDD Workflows**: All standard browser automation tools + autonomous exploration
- **Quality Gates**: Automatic validation triggers (UI changes → snapshot + console + screenshot)
- **Progressive Disclosure**: Protocol documentation loaded on-demand (`~/.claude/protocols/boss-ghost-testing.md`)

**Test Coverage**: Phase 2: 93.7% pass rate (239/255 tests)

**Migration Pattern**: Shows how to replace/enhance existing MCP servers while maintaining backward compatibility

---

### 6. Language-Specific Implementation Guides

**Python Implementation Guide** (`reference/python_mcp_server.md`):
- Server initialization patterns
- Pydantic model examples
- Tool registration with `@mcp.tool`
- Complete working examples
- Quality checklist

**TypeScript Implementation Guide** (`reference/node_mcp_server.md`):
- Project structure (package.json, tsconfig.json)
- Zod schema patterns
- Tool registration with `server.registerTool`
- Complete working examples
- Quality checklist

**Both guides include**:
- Project setup instructions
- Authentication patterns
- Error handling strategies
- Response formatting examples
- Pagination implementation
- MCP Inspector testing

---

## Use Cases

### 1. Building a REST API MCP Server

**Scenario**: You want to create an MCP server for a REST API (Stripe, Twilio, SendGrid, etc.)

**Workflow**:
1. **Phase 1 - Research**:
   - Study MCP best practices guide
   - Load TypeScript SDK docs (recommended) or Python SDK
   - Research target API documentation
   - Plan comprehensive API endpoint coverage

2. **Phase 2 - Implementation**:
   - Set up TypeScript project (package.json, tsconfig.json)
   - Create API client with authentication (API key, OAuth)
   - Implement core infrastructure (error handling, pagination)
   - Implement tools for each endpoint:
     - Define Zod input schemas with constraints
     - Add clear descriptions with examples
     - Implement async handlers with error handling
     - Add tool annotations (readOnlyHint, etc.)

3. **Phase 3 - Testing**:
   - Run `npm run build` to verify compilation
   - Test with MCP Inspector: `npx @modelcontextprotocol/inspector`
   - Review code quality (DRY, consistent error handling)

4. **Phase 4 - Evaluation**:
   - Create 10 complex questions testing various endpoints
   - Verify answers yourself first
   - Run evaluation script: `python scripts/evaluation.py your_evaluation.xml`

**Example Tools Created**:
- `stripe_list_customers(limit, offset)`
- `stripe_create_charge(amount, currency, customer_id)`
- `stripe_get_invoice(invoice_id, response_format)`

**Time Estimate**: 6-12 hours for simple API, 20-40 hours for complex API

---

### 2. Building a Database MCP Server

**Scenario**: You want to create an MCP server for a database (PostgreSQL, MongoDB, Redis, etc.)

**Workflow**:
1. **Phase 1 - Research**:
   - Study MCP best practices (especially pagination, response formats)
   - Load Python SDK docs (good for database integrations)
   - Plan read-only tools vs. destructive tools

2. **Phase 2 - Implementation**:
   - Set up Python project with FastMCP
   - Create database connection manager
   - Implement query tools with proper parameterization (prevent SQL injection)
   - Support both JSON and Markdown response formats
   - Implement pagination for large result sets

3. **Phase 3 - Testing**:
   - Test connection pooling
   - Verify query safety (parameterized queries)
   - Test pagination with large datasets
   - Test with MCP Inspector

4. **Phase 4 - Evaluation**:
   - Create complex queries requiring joins/aggregations
   - Test pagination behavior
   - Verify performance on large datasets

**Example Tools Created**:
- `postgres_query_table(table_name, where_clause, limit, offset)`
- `postgres_get_schema(table_name)`
- `postgres_execute_safe_query(parameterized_query, params)`

**Security Considerations**:
- Always use parameterized queries
- Implement read-only mode for production
- Add destructiveHint annotations for write operations

**Time Estimate**: 8-16 hours for basic database integration

---

### 3. Building a File System / Cloud Storage MCP Server

**Scenario**: You want to create an MCP server for file operations (local filesystem, S3, Google Drive, Dropbox, etc.)

**Workflow**:
1. **Phase 1 - Research**:
   - Study MCP best practices (tool naming, pagination)
   - Load TypeScript SDK docs
   - Research target file API (S3, Drive API)

2. **Phase 2 - Implementation**:
   - Set up TypeScript project
   - Implement authentication (API keys, OAuth tokens)
   - Create file listing tools with pagination
   - Create file read/write tools
   - Implement streaming for large files
   - Support both JSON metadata and content responses

3. **Phase 3 - Testing**:
   - Test with various file sizes
   - Test pagination for directories with many files
   - Test streaming large files
   - Verify proper error handling (permissions, not found)

4. **Phase 4 - Evaluation**:
   - Create questions requiring file searches across directories
   - Test metadata extraction
   - Verify content retrieval accuracy

**Example Tools Created**:
- `gdrive_list_files(folder_id, limit, offset, response_format)`
- `gdrive_get_file_content(file_id)`
- `gdrive_search_files(query, limit, offset)`
- `gdrive_get_file_metadata(file_id, response_format)`

**Special Considerations**:
- Implement streaming for large files
- Handle various file encodings
- Support file metadata (MIME type, size, modified date)
- Implement proper permission checking

**Time Estimate**: 10-20 hours for cloud storage integration

---

### 4. Enhancing an Existing MCP Server (Migration Pattern)

**Scenario**: You have an existing MCP server that needs autonomous features, session persistence, or self-healing logic

**Reference**: Study BOSS Ghost MCP migration pattern (Chrome DevTools → BOSS Ghost)

**Workflow**:
1. **Phase 1 - Research**:
   - Review BOSS Ghost reference implementation
   - Identify enhancement opportunities:
     - Autonomous multi-step operations?
     - Session persistence needed?
     - Self-healing/fallback strategies?
     - Better error messages?

2. **Phase 2 - Implementation**:
   - **Maintain backward compatibility**: Keep all existing tools working
   - Add enhanced versions with new features:
     - `click()` → `smart_click()` (7-tier fallback)
     - `navigate()` → `autonomous_explore()` (multi-page crawling)
   - Implement session management if needed:
     - `save_state()`, `restore_state()` tools
     - File-based storage: `~/.your-mcp/sessions/`

3. **Phase 3 - Testing**:
   - Verify backward compatibility (all old tools work)
   - Test new autonomous features
   - Test session persistence across restarts

4. **Phase 4 - Evaluation**:
   - Create evaluations for new autonomous workflows
   - Compare performance: basic tools vs. enhanced tools
   - Measure improvement in LLM success rate

**BOSS Ghost Example - Before/After**:
- **Before (Chrome DevTools MCP)**: Basic browser automation, manual test execution, brittle selectors
- **After (BOSS Ghost MCP)**: All Chrome DevTools features PLUS autonomous exploration, automatic test triggering, self-healing selectors, session persistence, CAPTCHA detection

**Key Lesson**: Add enhanced versions while keeping basic tools for backward compatibility

**Time Estimate**: 15-30 hours for significant enhancements

---

### 5. Building a Documentation / Knowledge Base MCP Server

**Scenario**: You want to create an MCP server for documentation search (Confluence, Notion, Docusaurus, etc.)

**Workflow**:
1. **Phase 1 - Research**:
   - Study MCP best practices (response formats crucial for docs)
   - Load SDK docs
   - Research documentation API (Confluence API, Notion API)
   - Plan search/retrieval tools

2. **Phase 2 - Implementation**:
   - Set up project
   - Implement search tools with multiple strategies:
     - Full-text search
     - Hierarchical navigation (spaces → pages → content)
     - Tag-based filtering
   - Support Markdown response format (preserve formatting)
   - Implement content extraction (handle HTML, Markdown, rich text)

3. **Phase 3 - Testing**:
   - Test search relevance
   - Test content extraction preserves formatting
   - Test with various content types (code blocks, tables, images)

4. **Phase 4 - Evaluation**:
   - Create questions requiring multi-hop searches
   - Test deep exploration (finding specific info in large docs)
   - Verify answer extraction from complex content

**Example Tools Created**:
- `confluence_search(query, space_key, limit, offset)`
- `confluence_get_page_content(page_id, response_format="markdown")`
- `confluence_list_pages_in_space(space_key, limit, offset)`
- `confluence_get_page_hierarchy(page_id)`

**Special Considerations**:
- Preserve content formatting (code blocks, lists, tables)
- Handle various content formats (HTML → Markdown conversion)
- Implement effective search ranking
- Support hierarchical navigation

**Time Estimate**: 12-24 hours for documentation integration

---

## Dependencies

### Required (For All MCP Server Development)

**Runtime**:
- **Node.js 18+** (for TypeScript MCP servers) OR **Python 3.8+** (for Python MCP servers)
- **npm** or **yarn** (for TypeScript projects)
- **pip** (for Python projects)

**Development**:
- **MCP Inspector**: `npx @modelcontextprotocol/inspector` (for testing MCP servers)
- **TypeScript SDK** (if using TypeScript): Installed via `npm install @modelcontextprotocol/sdk`
- **Python SDK** (if using Python): Installed via `pip install mcp`

### Optional (For Evaluation)

**Evaluation Scripts**:
- Python 3.8+ (for running `scripts/evaluation.py`)
- `requirements.txt` dependencies: Install via `pip install -r scripts/requirements.txt`

### MCP Server-Specific Dependencies

**Depends on target service**:
- REST API integrations: HTTP client libraries (axios, requests, etc.)
- Database integrations: Database drivers (pg, mongodb, redis-py, etc.)
- Cloud storage: SDK libraries (aws-sdk, google-cloud-storage, etc.)
- Authentication: OAuth libraries, JWT libraries, etc.

---

## Skill Integration Points

### What This Skill Reads

**External Documentation** (via WebFetch):
- `https://modelcontextprotocol.io/sitemap.xml` - MCP specification sitemap
- `https://modelcontextprotocol.io/[page].md` - Specific MCP spec pages
- `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md` - TypeScript SDK
- `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md` - Python SDK

**Internal Reference Files**:
- `./reference/mcp_best_practices.md` - Universal MCP guidelines
- `./reference/python_mcp_server.md` - Python implementation patterns
- `./reference/node_mcp_server.md` - TypeScript implementation patterns
- `./reference/evaluation.md` - Evaluation creation guide

**BOSS Ghost Protocol** (when relevant):
- `~/.claude/protocols/boss-ghost-testing.md` - Browser automation patterns

### What This Skill Writes

**MCP Server Code**:
- TypeScript: `src/index.ts`, `src/tools/*.ts`, `package.json`, `tsconfig.json`
- Python: `server.py`, `tools/*.py`, `requirements.txt`, `setup.py`

**Evaluation Files**:
- `evaluations/your_server_eval.xml` - XML evaluation file with 10 qa_pairs

**Configuration Files**:
- `.mcp.json` - MCP server configuration for Claude Code CLI
- Transport configuration (streamable HTTP or stdio)

### Integration with Other PAI Skills

**research skill** (for Phase 1):
- Launch research skill to investigate target API documentation
- Research competitive MCP servers for similar services
- Investigate authentication patterns for target service

**create-skill** (for MCP server project setup):
- Use Standard skill pattern (SKILL.md + scripts/)
- Scripts as tools pattern for evaluation scripts

**fabric** (for documentation analysis):
- Use `extract_wisdom` pattern to analyze target API docs
- Use `create_summary` pattern to summarize MCP best practices

---

## Configuration

### MCP Server Transport Selection

**Streamable HTTP** (Recommended for most servers):
```json
{
  "mcpServers": {
    "your-service": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

**stdio** (For local tools):
```json
{
  "mcpServers": {
    "your-service": {
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

### Evaluation Configuration

**Running Evaluations**:
```bash
# Install evaluation dependencies
pip install -r scripts/requirements.txt

# Run evaluation
python scripts/evaluation.py your_evaluation.xml

# Test MCP server connection
python scripts/connections.py --server your-service-mcp
```

---

## Key Principles

### 1. Quality is Measured by LLM Effectiveness

The measure of quality is NOT how comprehensively you implement tools, but how well these implementations enable LLMs to answer realistic questions.

### 2. Prioritize Comprehensive API Coverage

Balance comprehensive endpoint coverage with specialized workflow tools. When uncertain, prioritize comprehensive coverage—agents can compose operations.

### 3. Clear, Descriptive Tool Names

Use consistent prefixes (e.g., `github_create_issue`) and action-oriented naming. Help agents find the right tools quickly.

### 4. Concise Tool Descriptions and Filtering

Design tools that return focused, relevant data. Agents benefit from concise descriptions and pagination.

### 5. Actionable Error Messages

Error messages should guide agents toward solutions with specific suggestions and next steps.

### 6. Support Both JSON and Markdown

JSON for programmatic processing, Markdown for human readability. Support both for maximum flexibility.

### 7. Always Implement Pagination

Never load all results into memory. Default to 20-50 items. Return `has_more`, `next_offset`, `total_count`.

### 8. Use Tool Annotations

Mark tools with `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint` for agent guidance.

### 9. Prefer TypeScript for New Servers

High-quality SDK support, good compatibility, AI models excel at generating TypeScript, static typing benefits.

### 10. Create Comprehensive Evaluations

10 complex, realistic, read-only questions that require multiple tool calls. This is how you measure quality.

---

## Token Savings with Pack v2.0

**Before Pack v2.0** (single SKILL.md):
- Entire skill documentation loaded upfront: ~15,000 tokens
- All reference guides, examples, BOSS Ghost documentation: ~25,000 tokens
- Total upfront load: **~40,000 tokens**

**After Pack v2.0** (progressive disclosure):
- SKILL.md (quick reference): ~4,000 tokens (loaded on activation)
- PACK_README.md (overview): ~8,000 tokens (loaded on-demand)
- PACK_INSTALL.md (installation): ~5,000 tokens (loaded on-demand)
- PACK_VERIFY.md (verification): ~6,000 tokens (loaded on-demand)
- Reference guides: ~20,000 tokens (loaded as needed during phases)

**Token savings**: 70-80% reduction for typical MCP server development workflow

---

## Related Skills

**research** - Use during Phase 1 to investigate target APIs, competitive MCP servers, authentication patterns

**create-skill** - Reference for project setup patterns, scripts as tools pattern for evaluation scripts

**fabric** - Use for documentation analysis (`extract_wisdom`, `create_summary` patterns)

---

**Pack README Version**: 2.0
**Last Updated**: 2026-01-03
**License**: See LICENSE.txt for complete terms
