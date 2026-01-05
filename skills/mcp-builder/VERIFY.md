# MCP Builder - Verification Guide

**Pack Version**: 2.0
**Verification Time**: 90-120 minutes (comprehensive framework validation)
**Complexity**: Medium-High (multi-phase workflow, dual-language support, evaluation system)

---

## Purpose

This verification guide ensures that the mcp-builder skill is correctly installed, functional across all four development phases (Research, Implementation, Review/Test, Evaluation), and capable of guiding users through creating high-quality MCP servers in both TypeScript and Python.

**Verification Scope**:
- ✅ File structure completeness (SKILL.md, Pack files, reference files, scripts)
- ✅ Skill loading and activation
- ✅ Development prerequisites (Node.js OR Python)
- ✅ Reference documentation accessibility
- ✅ Evaluation script functionality
- ✅ Functional testing across all 4 development phases
- ✅ BOSS Ghost MCP reference implementation documentation access
- ✅ Integration with other PAI skills (research, fabric)
- ✅ Edge case handling
- ✅ Performance benchmarks

---

## Prerequisites for Verification

### Required
- ✅ Claude Code CLI installed and working
- ✅ PAI_DIR environment variable set (`~/.claude/` or `C:\Users\<Username>\.claude\`)
- ✅ Active Claude Code session

### Optional (For Full Verification)
- ✅ Node.js 18.0.0+ installed (for TypeScript MCP server testing)
- ✅ Python 3.8+ installed (for Python MCP server testing OR evaluation scripts)
- ✅ npm installed (comes with Node.js)
- ✅ pip installed (comes with Python)

**Note**: You can verify the skill without Node.js/Python installed, but full MCP server creation verification requires at least one language stack.

---

## Section 1: File Structure Verification ✅

### 1.1 Core Skill Files

**Test**: Verify all core skill files exist

**Unix/Mac**:
```bash
ls -la "$HOME/.claude/skills/mcp-builder/"
```

**Windows (PowerShell)**:
```powershell
Get-ChildItem "$env:USERPROFILE\.claude\skills\mcp-builder\" -Force
```

**Expected Files**:
```
mcp-builder/
├── SKILL.md              # Main skill documentation (376 lines)
├── LICENSE.txt           # License information
├── PACK_README.md        # Pack overview (~700 lines)
├── PACK_INSTALL.md       # Installation guide (~600 lines)
├── PACK_VERIFY.md        # This verification guide (~700 lines)
├── reference/            # Reference documentation directory
└── scripts/              # Evaluation scripts directory
```

**Checklist**:
- [ ] SKILL.md exists (376 lines, ~11,000 bytes)
- [ ] LICENSE.txt exists
- [ ] PACK_README.md exists (~700 lines, ~24,000 bytes)
- [ ] PACK_INSTALL.md exists (~600 lines, ~17,000 bytes)
- [ ] PACK_VERIFY.md exists (~700 lines, ~24,000 bytes)
- [ ] reference/ directory exists
- [ ] scripts/ directory exists

**If any files are missing**: Reinstall mcp-builder skill from PAI source.

---

### 1.2 Reference Files

**Test**: Verify all reference documentation files exist

**Unix/Mac**:
```bash
ls -la "$HOME/.claude/skills/mcp-builder/reference/"
```

**Windows (PowerShell)**:
```powershell
Get-ChildItem "$env:USERPROFILE\.claude\skills\mcp-builder\reference\" -Force
```

**Expected Files**:
```
reference/
├── mcp_best_practices.md    # Universal MCP guidelines (469 lines)
├── python_mcp_server.md     # Python/FastMCP implementation guide (503 lines)
├── node_mcp_server.md       # TypeScript/MCP SDK implementation guide (609 lines)
└── evaluation.md            # Evaluation creation guide (392 lines)
```

**Checklist**:
- [ ] mcp_best_practices.md exists (469 lines, ~13,500 bytes)
- [ ] python_mcp_server.md exists (503 lines, ~14,500 bytes)
- [ ] node_mcp_server.md exists (609 lines, ~17,500 bytes)
- [ ] evaluation.md exists (392 lines, ~11,300 bytes)
- [ ] Total of 4 reference files present

**If any reference files are missing**: Reinstall mcp-builder skill or contact PAI administrator.

---

### 1.3 Evaluation Scripts

**Test**: Verify evaluation scripts exist

**Unix/Mac**:
```bash
ls -la "$HOME/.claude/skills/mcp-builder/scripts/"
```

**Windows (PowerShell)**:
```powershell
Get-ChildItem "$env:USERPROFILE\.claude\skills\mcp-builder\scripts\" -Force
```

**Expected Files**:
```
scripts/
├── evaluation.py              # Main evaluation runner script
├── connections.py             # MCP connection utilities
├── example_evaluation.xml     # Example evaluation format
└── requirements.txt           # Python dependencies
```

**Checklist**:
- [ ] evaluation.py exists
- [ ] connections.py exists
- [ ] example_evaluation.xml exists
- [ ] requirements.txt exists
- [ ] Total of 4 script files present

**If scripts are missing**: Not critical for basic skill usage, but limits evaluation creation capabilities.

---

## Section 2: Skill Loading Verification ✅

### 2.1 Basic Skill Activation

**Test**: Start Claude Code session and activate mcp-builder skill

**Steps**:
1. Open terminal in any project directory
2. Run: `claude`
3. In session, type: `@mcp-builder`

**Expected Behavior**:
- ✅ Skill activates immediately
- ✅ Kai loads mcp-builder context
- ✅ Ready to guide MCP server development
- ✅ No error messages

**Checklist**:
- [ ] Skill activates with @mcp-builder trigger
- [ ] No "skill not found" errors
- [ ] Context loads without warnings
- [ ] Ready to accept MCP development requests

**If skill doesn't activate**:
- Verify SKILL.md exists at `~/.claude/skills/mcp-builder/SKILL.md`
- Check SKILL.md frontmatter (name: mcp-builder)
- Restart Claude Code session
- Try explicit activation: "Use mcp-builder skill to guide me through creating an MCP server"

---

### 2.2 Auto-Detection Triggers

**Test**: Verify skill auto-activates on relevant keywords

**Test Cases**:

**Test 1 - MCP Server Creation**:
```
Help me create an MCP server for Slack
```

**Expected**: mcp-builder skill activates, enters Phase 1 (Research)

**Test 2 - TypeScript MCP**:
```
Build a TypeScript MCP server for GitHub API
```

**Expected**: mcp-builder activates, recommends TypeScript approach

**Test 3 - Python/FastMCP**:
```
Create a Python FastMCP server for database access
```

**Expected**: mcp-builder activates, provides Python implementation guide

**Test 4 - Evaluation Creation**:
```
Create evaluations for my MCP server
```

**Expected**: mcp-builder activates, loads evaluation.md reference

**Checklist**:
- [ ] Auto-activates on "create MCP server" phrases
- [ ] Auto-activates on "TypeScript MCP" keywords
- [ ] Auto-activates on "Python FastMCP" keywords
- [ ] Auto-activates on "evaluation" + "MCP" context
- [ ] Doesn't activate on unrelated requests

**If auto-detection fails**: Use explicit `@mcp-builder` trigger, verify SKILL.md description field includes trigger keywords.

---

## Section 3: Development Prerequisites Verification ✅

### 3.1 Node.js + npm (TypeScript Stack)

**Test**: Verify Node.js and npm are installed (optional but recommended)

**Unix/Mac & Windows**:
```bash
node --version
npm --version
```

**Expected Output**:
```
v18.0.0 (or higher)
9.0.0 (or higher)
```

**Checklist**:
- [ ] Node.js 18.0.0+ installed (if planning TypeScript MCP servers)
- [ ] npm 9.0.0+ installed
- [ ] Both commands run without errors

**If Node.js not installed**:
- **Not critical** - Skill still works for learning, research, Python development
- **Install if needed**: Download from https://nodejs.org/ (LTS version recommended)
- **TypeScript MCP servers require Node.js**

---

### 3.2 Python + pip (Python Stack OR Evaluation Scripts)

**Test**: Verify Python and pip are installed

**Unix/Mac & Windows**:
```bash
python --version
pip --version
```

**Expected Output**:
```
Python 3.8.0 (or higher)
pip 21.0 (or higher)
```

**Checklist**:
- [ ] Python 3.8+ installed (if planning Python MCP servers OR using evaluation scripts)
- [ ] pip installed
- [ ] Both commands run without errors

**If Python not installed**:
- **Not critical** - Skill works for learning, research, TypeScript development
- **Install if needed**: Download from https://www.python.org/ (3.10+ recommended)
- **Required for**: Python MCP servers, evaluation scripts

---

### 3.3 MCP Inspector (Optional Testing Tool)

**Test**: Verify MCP Inspector can be launched

**Prerequisites**: Node.js installed

**Command**:
```bash
npx @modelcontextprotocol/inspector
```

**Expected Output**:
```
Starting MCP Inspector...
Inspector available at http://localhost:5173
```

**Checklist**:
- [ ] MCP Inspector launches without errors
- [ ] Web interface accessible at localhost:5173
- [ ] Can connect to MCP servers

**If MCP Inspector fails**:
- Verify Node.js 18+ installed
- Check network/firewall (port 5173)
- Not critical for skill verification - used during actual MCP development

---

## Section 4: Reference Documentation Access ✅

### 4.1 MCP Best Practices Reference

**Test**: Load universal MCP guidelines

**In Claude Code session**:
```
Load the mcp-builder MCP best practices reference
```

**Expected Behavior**:
- ✅ Kai reads `reference/mcp_best_practices.md`
- ✅ Provides guidelines on server naming, tool naming, response formats, pagination, transport methods, tool annotations

**Checklist**:
- [ ] File loads without errors
- [ ] Guidelines on server naming (Python: {service}_mcp, TypeScript: {service}-mcp-server)
- [ ] Tool naming conventions (snake_case, {service}_{action}_{resource})
- [ ] Response format recommendations (JSON + Markdown)
- [ ] Pagination standards (limit, has_more, next_offset, total_count)
- [ ] Transport method guidance (streamable HTTP vs stdio)
- [ ] Tool annotation types (readOnlyHint, destructiveHint, idempotentHint, openWorldHint)

**If file doesn't load**: Verify `reference/mcp_best_practices.md` exists, check file permissions.

---

### 4.2 TypeScript Implementation Guide

**Test**: Load TypeScript/MCP SDK implementation guide

**In Claude Code session**:
```
Load the mcp-builder TypeScript implementation guide
```

**Expected Behavior**:
- ✅ Kai reads `reference/node_mcp_server.md`
- ✅ Provides TypeScript project setup, MCP SDK usage, tool implementation patterns, Zod schema examples

**Checklist**:
- [ ] File loads without errors (609 lines)
- [ ] Project setup instructions (package.json, tsconfig.json, dependencies)
- [ ] MCP SDK initialization patterns
- [ ] Tool implementation examples with Zod schemas
- [ ] Error handling patterns
- [ ] Transport configuration (stdio vs streamable HTTP)

**If file doesn't load**: Verify `reference/node_mcp_server.md` exists.

---

### 4.3 Python Implementation Guide

**Test**: Load Python/FastMCP implementation guide

**In Claude Code session**:
```
Load the mcp-builder Python implementation guide
```

**Expected Behavior**:
- ✅ Kai reads `reference/python_mcp_server.md`
- ✅ Provides FastMCP setup, tool implementation patterns, Pydantic models

**Checklist**:
- [ ] File loads without errors (503 lines)
- [ ] FastMCP installation instructions
- [ ] Server initialization patterns
- [ ] Tool implementation examples with Pydantic models
- [ ] Error handling patterns
- [ ] Transport configuration

**If file doesn't load**: Verify `reference/python_mcp_server.md` exists.

---

### 4.4 Evaluation Creation Guide

**Test**: Load evaluation creation guide

**In Claude Code session**:
```
Load the mcp-builder evaluation guide
```

**Expected Behavior**:
- ✅ Kai reads `reference/evaluation.md`
- ✅ Provides evaluation requirements (10 questions, read-only, independent, complex, realistic, verifiable, stable)
- ✅ XML format specification
- ✅ Example evaluations

**Checklist**:
- [ ] File loads without errors (392 lines)
- [ ] Evaluation requirements clearly defined
- [ ] XML format specification (<evaluation>, <qa_pair>, <question>, <answer>)
- [ ] Example evaluations provided
- [ ] Quality metric explanation (LLM effectiveness, not tool coverage)

**If file doesn't load**: Verify `reference/evaluation.md` exists.

---

## Section 5: Evaluation Scripts Verification ✅

### 5.1 Evaluation Script Dependencies

**Test**: Verify Python dependencies for evaluation scripts can be installed

**Prerequisites**: Python 3.8+ installed

**Command**:
```bash
cd ~/.claude/skills/mcp-builder/scripts/
pip install -r requirements.txt
```

**Expected Output**:
```
Successfully installed anthropic-X.X.X
```

**Checklist**:
- [ ] requirements.txt exists
- [ ] Dependencies install without errors
- [ ] anthropic package installed (for Claude SDK)

**If installation fails**:
- Verify Python 3.8+ installed
- Check pip is up to date: `pip install --upgrade pip`
- Not critical if not using evaluation scripts

---

### 5.2 Example Evaluation Format

**Test**: Verify example_evaluation.xml is valid

**Command**:
```bash
cat ~/.claude/skills/mcp-builder/scripts/example_evaluation.xml
```

**Expected Structure**:
```xml
<evaluation>
   <qa_pair>
      <question>Example question requiring multiple tool calls</question>
      <answer>Single verifiable answer</answer>
   </qa_pair>
   <!-- More qa_pairs... -->
</evaluation>
```

**Checklist**:
- [ ] File exists and is readable
- [ ] Valid XML structure
- [ ] Contains <evaluation> root element
- [ ] Contains multiple <qa_pair> elements
- [ ] Each qa_pair has <question> and <answer>
- [ ] Questions are complex (require multiple tool calls)
- [ ] Answers are single, verifiable values

**If file invalid**: Reinstall mcp-builder skill.

---

### 5.3 Evaluation Runner Script

**Test**: Verify evaluation.py can be executed

**Prerequisites**: Python installed, dependencies installed

**Command**:
```bash
cd ~/.claude/skills/mcp-builder/scripts/
python evaluation.py --help
```

**Expected Output** (or similar):
```
Usage: evaluation.py [OPTIONS]
Options:
  --evaluation-file PATH  Path to evaluation XML file
  --mcp-config PATH       Path to MCP configuration
  --help                  Show this message and exit
```

**Checklist**:
- [ ] Script runs without import errors
- [ ] Help message displays
- [ ] Command-line options documented

**If script fails**:
- Verify Python 3.8+ installed
- Verify dependencies installed (`pip install -r requirements.txt`)
- Not critical if not using evaluation scripts - manual evaluation still possible

---

## Section 6: Functional Testing - Phase 1 (Research) ✅

### 6.1 Modern MCP Design Understanding

**Test**: Verify skill guides research on modern MCP design principles

**In Claude Code session**:
```
Guide me through understanding modern MCP design for a Slack MCP server
```

**Expected Behavior**:
- ✅ Kai explains API Coverage vs. Workflow Tools
- ✅ Recommends comprehensive API coverage (send messages, list channels, create channels, manage users, search messages, reactions, threads, files)
- ✅ Explains quality metric: LLM effectiveness, not tool count
- ✅ Provides examples of well-designed MCP servers

**Checklist**:
- [ ] Explains API Coverage approach (comprehensive tool set)
- [ ] Explains Workflow Tools approach (higher-level operations)
- [ ] Recommends API Coverage for most cases
- [ ] Provides service-specific tool suggestions
- [ ] Emphasizes quality = LLM can accomplish realistic tasks

**If guidance missing**: Verify SKILL.md Phase 1 section exists, reload skill.

---

### 6.2 MCP Protocol Documentation Study

**Test**: Verify skill can guide protocol documentation study

**In Claude Code session**:
```
Help me study the MCP protocol documentation
```

**Expected Behavior**:
- ✅ Kai recommends starting at modelcontextprotocol.io
- ✅ Suggests using WebFetch to load specific protocol pages
- ✅ Highlights key concepts: tools, resources, prompts, sampling
- ✅ Provides sitemap URL for comprehensive exploration

**Checklist**:
- [ ] Recommends modelcontextprotocol.io as primary source
- [ ] Can use WebFetch to load protocol documentation
- [ ] Explains core MCP concepts (tools, resources, prompts)
- [ ] Provides sitemap URL for navigation

**If WebFetch fails**: Check network connectivity, MCP docs may be temporarily unavailable - skill still functional for other phases.

---

### 6.3 Framework Documentation Study (TypeScript)

**Test**: Verify skill guides TypeScript SDK documentation study

**In Claude Code session**:
```
Guide me through the TypeScript MCP SDK documentation
```

**Expected Behavior**:
- ✅ Kai recommends official MCP SDK documentation
- ✅ Highlights key SDK features (Server class, tool registration, Zod schemas, transport methods)
- ✅ Provides code examples from node_mcp_server.md reference

**Checklist**:
- [ ] Recommends official TypeScript SDK docs
- [ ] Explains Server class initialization
- [ ] Explains tool registration patterns
- [ ] Explains Zod schema usage for input/output validation
- [ ] Explains transport methods (stdio, streamable HTTP)

**If guidance incomplete**: Read `reference/node_mcp_server.md` directly.

---

### 6.4 Framework Documentation Study (Python)

**Test**: Verify skill guides FastMCP documentation study

**In Claude Code session**:
```
Guide me through the Python FastMCP documentation
```

**Expected Behavior**:
- ✅ Kai recommends FastMCP documentation
- ✅ Highlights FastMCP features (decorator-based tools, Pydantic models, automatic schema generation)
- ✅ Provides code examples from python_mcp_server.md reference

**Checklist**:
- [ ] Recommends FastMCP documentation
- [ ] Explains decorator-based tool registration (@mcp.tool())
- [ ] Explains Pydantic model usage for schemas
- [ ] Explains automatic schema generation
- [ ] Explains transport configuration

**If guidance incomplete**: Read `reference/python_mcp_server.md` directly.

---

### 6.5 Implementation Planning

**Test**: Verify skill helps plan MCP server implementation

**In Claude Code session**:
```
Help me plan implementation for a GitHub MCP server
```

**Expected Behavior**:
- ✅ Kai asks discovery questions (API coverage needs, authentication method, key operations)
- ✅ Recommends tool list (create_issue, list_issues, create_pr, get_file_contents, search_repositories, etc.)
- ✅ Suggests project structure
- ✅ Recommends TypeScript vs Python based on requirements
- ✅ Highlights authentication considerations (GitHub token)

**Checklist**:
- [ ] Asks about required API coverage
- [ ] Suggests comprehensive tool list
- [ ] Recommends project structure
- [ ] Provides language recommendation (TypeScript vs Python)
- [ ] Identifies authentication requirements
- [ ] Considers pagination needs
- [ ] Plans error handling strategy

**If planning guidance missing**: Explicitly request "Create implementation plan using mcp-builder framework".

---

## Section 7: Functional Testing - Phase 2 (Implementation) ✅

### 7.1 TypeScript Project Setup

**Test**: Verify skill guides TypeScript MCP project setup

**Prerequisites**: Node.js 18+ installed

**In Claude Code session**:
```
Guide me through setting up a TypeScript MCP server project for Stripe
```

**Expected Behavior**:
- ✅ Kai provides package.json structure
- ✅ Recommends dependencies (@modelcontextprotocol/sdk, zod, typescript)
- ✅ Provides tsconfig.json configuration
- ✅ Suggests project directory structure
- ✅ Provides initialization code example

**Checklist**:
- [ ] package.json structure provided
- [ ] Dependencies listed (@modelcontextprotocol/sdk, zod, typescript, @types/node)
- [ ] tsconfig.json configuration provided
- [ ] Project structure recommended (src/, dist/, tools/, types/)
- [ ] Server initialization code example provided

**Verification Steps**:
1. Create test directory: `mkdir ~/test-mcp-stripe`
2. Follow Kai's setup instructions
3. Verify `package.json` created
4. Run: `npm install`
5. Verify `node_modules/` created without errors

**If setup fails**: Check Node.js version (18+), verify npm working, read `reference/node_mcp_server.md` for manual setup.

---

### 7.2 Python Project Setup

**Test**: Verify skill guides Python FastMCP project setup

**Prerequisites**: Python 3.8+ installed

**In Claude Code session**:
```
Guide me through setting up a Python FastMCP server for PostgreSQL
```

**Expected Behavior**:
- ✅ Kai provides requirements.txt (fastmcp, pydantic, psycopg2)
- ✅ Suggests project directory structure
- ✅ Provides server initialization code example
- ✅ Explains virtual environment setup

**Checklist**:
- [ ] requirements.txt structure provided
- [ ] Dependencies listed (fastmcp, pydantic, service-specific libraries)
- [ ] Project structure recommended (server.py, models/, tools/)
- [ ] Virtual environment setup explained
- [ ] Server initialization code example provided

**Verification Steps**:
1. Create test directory: `mkdir ~/test-mcp-postgres`
2. Follow Kai's setup instructions
3. Create virtual environment: `python -m venv venv`
4. Activate: `source venv/bin/activate` (Unix) or `venv\Scripts\activate` (Windows)
5. Verify `requirements.txt` created
6. Run: `pip install -r requirements.txt`
7. Verify installation without errors

**If setup fails**: Check Python version (3.8+), verify pip working, read `reference/python_mcp_server.md` for manual setup.

---

### 7.3 API Client Implementation

**Test**: Verify skill guides API client setup

**In Claude Code session**:
```
Help me implement the API client for a Twilio MCP server
```

**Expected Behavior**:
- ✅ Kai recommends authentication approach (API keys, OAuth)
- ✅ Provides HTTP client setup (fetch, axios, requests)
- ✅ Suggests error handling patterns
- ✅ Recommends rate limiting considerations

**Checklist**:
- [ ] Authentication method recommended
- [ ] HTTP client library suggested
- [ ] Error handling patterns provided
- [ ] Rate limiting strategy discussed
- [ ] Retry logic recommended
- [ ] Timeout configuration suggested

**If guidance incomplete**: Request "Show API client implementation pattern from mcp-builder".

---

### 7.4 Tool Implementation (TypeScript)

**Test**: Verify skill guides TypeScript tool implementation

**In Claude Code session**:
```
Show me how to implement a 'send_message' tool for Slack MCP server in TypeScript
```

**Expected Behavior**:
- ✅ Kai provides complete tool implementation with Zod schemas
- ✅ Input schema (channel, message, optional params)
- ✅ Output schema (success, message_id, timestamp)
- ✅ Error handling
- ✅ Tool annotations (destructiveHint: false, openWorldHint: true)

**Example Expected Code**:
```typescript
server.tool(
  "slack_send_message",
  "Send a message to a Slack channel",
  {
    channel: z.string().describe("Channel ID or name"),
    text: z.string().describe("Message content"),
    thread_ts: z.string().optional().describe("Thread timestamp for replies")
  },
  async ({ channel, text, thread_ts }) => {
    // Implementation
  }
);
```

**Checklist**:
- [ ] Tool name follows convention (slack_send_message)
- [ ] Description is clear and concise
- [ ] Input schema uses Zod with descriptions
- [ ] Output schema defined
- [ ] Error handling implemented
- [ ] Tool annotations present
- [ ] Async/await used correctly

**If implementation incomplete**: Read `reference/node_mcp_server.md` section on tool implementation.

---

### 7.5 Tool Implementation (Python)

**Test**: Verify skill guides Python tool implementation

**In Claude Code session**:
```
Show me how to implement a 'create_database' tool for PostgreSQL MCP server in Python
```

**Expected Behavior**:
- ✅ Kai provides complete tool implementation with Pydantic models
- ✅ Decorator-based registration (@mcp.tool())
- ✅ Input model with field descriptions
- ✅ Output model
- ✅ Error handling

**Example Expected Code**:
```python
from pydantic import BaseModel, Field

class CreateDatabaseInput(BaseModel):
    name: str = Field(description="Database name")
    owner: str = Field(description="Database owner")

@mcp.tool()
async def postgres_create_database(input: CreateDatabaseInput) -> dict:
    """Create a new PostgreSQL database"""
    # Implementation
    return {"success": True, "database": input.name}
```

**Checklist**:
- [ ] Tool name follows convention (postgres_create_database)
- [ ] Decorator @mcp.tool() used
- [ ] Docstring provides clear description
- [ ] Pydantic model for input with Field descriptions
- [ ] Output type defined
- [ ] Error handling implemented
- [ ] Async function

**If implementation incomplete**: Read `reference/python_mcp_server.md` section on tool implementation.

---

### 7.6 Pagination Implementation

**Test**: Verify skill guides pagination implementation

**In Claude Code session**:
```
Show me how to implement pagination for a 'list_repositories' tool in TypeScript
```

**Expected Behavior**:
- ✅ Kai provides pagination parameters (limit, offset)
- ✅ Provides pagination response fields (items, has_more, next_offset, total_count)
- ✅ Recommends default limit (20-50)
- ✅ Implements offset/limit logic correctly

**Example Expected Pattern**:
```typescript
{
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
}
// Output:
{
  items: [...],
  has_more: boolean,
  next_offset: number,
  total_count: number
}
```

**Checklist**:
- [ ] Input includes limit parameter (default 20-50, max 100)
- [ ] Input includes offset parameter (default 0)
- [ ] Output includes items array
- [ ] Output includes has_more boolean
- [ ] Output includes next_offset (for convenience)
- [ ] Output includes total_count (if available)

**If pagination guidance missing**: Reference mcp_best_practices.md section on pagination.

---

## Section 8: Functional Testing - Phase 3 (Review/Test) ✅

### 8.1 Code Quality Review

**Test**: Verify skill provides code quality checklist

**In Claude Code session**:
```
Review my MCP server code quality using mcp-builder standards
```

**Expected Behavior**:
- ✅ Kai provides quality checklist
- ✅ Checks tool naming conventions
- ✅ Checks schema completeness
- ✅ Checks error handling
- ✅ Checks pagination implementation
- ✅ Checks tool annotations
- ✅ Checks documentation

**Checklist Items Kai Should Verify**:
- [ ] Tool names follow {service}_{action}_{resource} convention
- [ ] All tools have clear, concise descriptions
- [ ] Input schemas use Zod (TS) or Pydantic (Python) with descriptions
- [ ] Output schemas defined
- [ ] Error handling implemented (try/catch, specific error messages)
- [ ] Pagination implemented for list operations
- [ ] Tool annotations present (readOnlyHint, destructiveHint, etc.)
- [ ] API client has retry logic
- [ ] Authentication handled securely

**If review incomplete**: Request "Run complete code quality review using mcp-builder checklist".

---

### 8.2 MCP Inspector Testing

**Test**: Verify skill guides MCP Inspector usage

**Prerequisites**: Node.js installed, MCP server implemented

**In Claude Code session**:
```
Guide me through testing my MCP server with MCP Inspector
```

**Expected Behavior**:
- ✅ Kai provides MCP Inspector launch command
- ✅ Explains configuration setup
- ✅ Guides through connecting to server
- ✅ Guides through testing tools
- ✅ Explains how to verify tool schemas

**Checklist**:
- [ ] Inspector launch command provided (`npx @modelcontextprotocol/inspector`)
- [ ] Configuration format explained (stdio vs streamable HTTP)
- [ ] Connection process explained
- [ ] Tool testing process explained
- [ ] Schema validation guidance provided
- [ ] Error interpretation guidance provided

**Verification Steps** (if Node.js installed):
1. Launch Inspector: `npx @modelcontextprotocol/inspector`
2. Navigate to http://localhost:5173
3. Connect to test MCP server
4. Verify tools appear in Inspector
5. Test a tool with sample input
6. Verify output format

**If Inspector testing fails**: Not critical for skill verification - indicates Node.js/server issue, not skill issue.

---

### 8.3 Manual Testing Guidance

**Test**: Verify skill provides manual testing strategy

**In Claude Code session**:
```
Create a manual testing plan for my GitHub MCP server
```

**Expected Behavior**:
- ✅ Kai creates test plan covering all tools
- ✅ Provides test cases with inputs and expected outputs
- ✅ Includes edge cases (errors, empty results, pagination)
- ✅ Suggests testing order (read-only first, then destructive)

**Checklist**:
- [ ] Test cases for each tool
- [ ] Happy path scenarios
- [ ] Error scenarios (invalid input, API errors, rate limits)
- [ ] Edge cases (empty results, large datasets, pagination boundaries)
- [ ] Authentication testing
- [ ] Recommended testing order (safe operations first)

**If testing plan incomplete**: Request "Create comprehensive test plan using mcp-builder framework".

---

## Section 9: Functional Testing - Phase 4 (Evaluation) ✅

### 9.1 Evaluation Question Creation

**Test**: Verify skill guides evaluation question creation

**In Claude Code session**:
```
Help me create 10 evaluation questions for my Stripe MCP server
```

**Expected Behavior**:
- ✅ Kai creates 10 questions following evaluation.md requirements
- ✅ Questions are read-only (no creation/modification)
- ✅ Questions are independent (can run in any order)
- ✅ Questions are complex (require multiple tool calls)
- ✅ Questions are realistic (real-world use cases)
- ✅ Answers are single, verifiable values
- ✅ Answers are stable (won't change over time)

**Example Expected Question**:
```
Question: What was the total amount of successful charges processed in USD for customer cus_test123 in January 2024?
Answer: 15420.50
```

**Checklist**:
- [ ] 10 questions created
- [ ] All questions are read-only (no create/update/delete operations)
- [ ] All questions are independent (no dependencies on other questions)
- [ ] All questions require multiple tool calls (list + get + filter + aggregate)
- [ ] All questions are realistic (actual use cases)
- [ ] All answers are single values (number, string, boolean)
- [ ] All answers are verifiable (can be checked against API)
- [ ] All answers are stable (won't change with time)

**If evaluation questions don't meet requirements**: Reference evaluation.md requirements, regenerate questions.

---

### 9.2 Evaluation XML Format

**Test**: Verify skill generates correct XML format

**In Claude Code session**:
```
Format the evaluation questions into the required XML structure
```

**Expected Behavior**:
- ✅ Kai generates XML with correct structure
- ✅ Uses <evaluation> root element
- ✅ Uses <qa_pair> for each question/answer
- ✅ Uses <question> and <answer> tags
- ✅ Properly escapes XML special characters

**Expected XML Structure**:
```xml
<evaluation>
   <qa_pair>
      <question>What was the total amount of successful charges processed in USD for customer cus_test123 in January 2024?</question>
      <answer>15420.50</answer>
   </qa_pair>
   <qa_pair>
      <question>How many payment methods does customer cus_test456 have attached to their account?</question>
      <answer>3</answer>
   </qa_pair>
   <!-- 8 more qa_pairs... -->
</evaluation>
```

**Checklist**:
- [ ] Valid XML structure
- [ ] <evaluation> root element present
- [ ] 10 <qa_pair> elements
- [ ] Each qa_pair has <question> and <answer>
- [ ] XML special characters escaped (&, <, >, ", ')
- [ ] Proper indentation (for readability)

**If XML invalid**: Request "Fix XML formatting to match example_evaluation.xml structure".

---

### 9.3 Evaluation Script Usage (Optional)

**Test**: Verify evaluation scripts can run (if Python installed)

**Prerequisites**: Python 3.8+, dependencies installed, evaluation XML file created

**Command**:
```bash
cd ~/.claude/skills/mcp-builder/scripts/
python evaluation.py --evaluation-file ~/test-mcp-stripe/evaluation.xml --mcp-config ~/test-mcp-stripe/.mcp.json
```

**Expected Behavior**:
- ✅ Script runs without errors
- ✅ Connects to MCP server
- ✅ Executes each evaluation question
- ✅ Reports results (pass/fail for each question)
- ✅ Provides summary statistics

**Checklist**:
- [ ] Script executes without import errors
- [ ] Successfully connects to MCP server
- [ ] Runs all 10 evaluation questions
- [ ] Reports individual question results
- [ ] Provides summary (X/10 passed)
- [ ] Logs detailed error messages for failures

**If script fails**:
- Verify Python dependencies installed (`pip install -r requirements.txt`)
- Verify MCP server running and accessible
- Verify evaluation XML valid
- Not critical for skill verification - manual evaluation still possible

---

## Section 10: BOSS Ghost MCP Reference Documentation ✅

### 10.1 BOSS Ghost Protocol Access

**Test**: Verify BOSS Ghost MCP documentation is accessible

**In Claude Code session**:
```
Load BOSS Ghost MCP documentation for reference implementation examples
```

**Expected Behavior**:
- ✅ Kai can access BOSS Ghost MCP protocol documentation (if installed)
- ✅ OR Kai acknowledges BOSS Ghost as reference implementation pattern
- ✅ Provides autonomous exploration example
- ✅ Provides session persistence example
- ✅ Provides self-healing selectors example

**Checklist**:
- [ ] BOSS Ghost recognized as reference implementation
- [ ] Autonomous exploration pattern explained (BFS crawling, bug detection)
- [ ] Session persistence pattern explained (save/restore state)
- [ ] Self-healing selectors pattern explained (multi-tier fallback)
- [ ] CAPTCHA detection pattern explained (detection + waiting)

**If BOSS Ghost docs not available**: Not critical - skill still functional, examples available in PACK_README.md.

---

### 10.2 Advanced Pattern Examples

**Test**: Verify skill can reference BOSS Ghost patterns for complex MCP servers

**In Claude Code session**:
```
Show me how to implement autonomous exploration like BOSS Ghost for my web scraping MCP server
```

**Expected Behavior**:
- ✅ Kai references BOSS Ghost autonomous_explore pattern
- ✅ Explains BFS (breadth-first search) crawling
- ✅ Explains bug detection (console errors, network failures)
- ✅ Explains screenshot capture
- ✅ Explains sitemap generation

**Checklist**:
- [ ] BFS crawling algorithm explained
- [ ] Queue management pattern explained
- [ ] Bug detection implementation explained
- [ ] Screenshot capture integration explained
- [ ] Sitemap/report generation explained

**If pattern guidance incomplete**: Read PACK_README.md "Use Case 4: Enhancing an Existing MCP Server" section.

---

## Section 11: Integration Verification ✅

### 11.1 Integration with Research Skill

**Test**: Verify mcp-builder works with research skill for API research

**In Claude Code session**:
```
Use research skill to gather information about the Notion API, then use mcp-builder to plan a Notion MCP server
```

**Expected Behavior**:
- ✅ Research skill activates, gathers Notion API documentation
- ✅ mcp-builder skill activates, uses research findings to plan MCP server
- ✅ Seamless workflow between research and planning phases

**Checklist**:
- [ ] Both skills activate correctly
- [ ] Research findings inform MCP planning
- [ ] No conflicts between skills
- [ ] Smooth workflow transition

**If integration fails**: Use skills sequentially (research first, then mcp-builder), verify both skills installed.

---

### 11.2 Integration with Fabric Skill

**Test**: Verify mcp-builder works with fabric for documentation analysis

**In Claude Code session**:
```
Use fabric to analyze this API documentation [paste docs], then use mcp-builder to suggest MCP tools
```

**Expected Behavior**:
- ✅ Fabric skill analyzes documentation
- ✅ mcp-builder uses analysis to suggest tools
- ✅ Tools align with API capabilities

**Checklist**:
- [ ] Both skills activate correctly
- [ ] Fabric analysis informs tool design
- [ ] Tool suggestions match API coverage
- [ ] No skill conflicts

**If integration fails**: Use sequentially, verify fabric skill installed.

---

## Section 12: Edge Cases ✅

### 12.1 Missing Development Prerequisites

**Test**: Verify skill works when neither Node.js nor Python installed

**Setup**: Test on system without Node.js or Python (or temporarily unset PATH)

**In Claude Code session**:
```
@mcp-builder Guide me through creating an MCP server
```

**Expected Behavior**:
- ✅ Skill still activates
- ✅ Provides research and planning guidance
- ✅ Warns that implementation requires Node.js OR Python
- ✅ Provides installation instructions
- ✅ Doesn't fail or crash

**Checklist**:
- [ ] Skill activates normally
- [ ] Research phase guidance works
- [ ] Planning phase guidance works
- [ ] Clear warning about missing prerequisites
- [ ] Installation instructions provided
- [ ] No errors or crashes

**If skill fails**: Verify SKILL.md doesn't have hard dependencies on external tools.

---

### 12.2 WebFetch Failures (MCP Protocol Docs)

**Test**: Verify skill handles WebFetch failures gracefully

**Simulate**: Disconnect from network or block WebFetch domains

**In Claude Code session**:
```
Load MCP protocol documentation from modelcontextprotocol.io
```

**Expected Behavior**:
- ✅ WebFetch fails gracefully
- ✅ Kai acknowledges docs unavailable
- ✅ Provides alternative: use cached knowledge, reference files
- ✅ Workflow continues without protocol docs

**Checklist**:
- [ ] WebFetch failure handled gracefully
- [ ] Clear error message ("unable to fetch")
- [ ] Alternative guidance provided
- [ ] Workflow not blocked
- [ ] Reference files still accessible

**If skill crashes on WebFetch failure**: Report bug - skill should handle network failures gracefully.

---

### 12.3 Conflicting Tool Naming Conventions

**Test**: Verify skill handles users with different naming preferences

**In Claude Code session**:
```
I prefer camelCase for tool names instead of snake_case, can I use that?
```

**Expected Behavior**:
- ✅ Kai acknowledges user preference
- ✅ Explains MCP best practices recommend snake_case
- ✅ Provides rationale (consistency, Python compatibility)
- ✅ Acknowledges camelCase will still work technically
- ✅ Recommends following conventions for ecosystem compatibility

**Checklist**:
- [ ] User preference acknowledged
- [ ] Best practices explained (snake_case recommended)
- [ ] Rationale provided (consistency, ecosystem)
- [ ] Technical feasibility confirmed (both work)
- [ ] Gentle recommendation toward standards

**If skill is inflexible**: Should support user preferences while recommending best practices.

---

## Section 13: Performance Benchmarks ✅

### 13.1 Simple REST API MCP Server

**Scenario**: Creating an MCP server for a simple REST API (Twilio, SendGrid, Mailchimp)

**Expected Time**: 6-12 hours (for experienced developer)

**Workflow**:
1. Research: 1-2 hours (API docs, authentication, key endpoints)
2. Implementation: 3-6 hours (project setup, 5-10 tools, pagination, error handling)
3. Review/Test: 1-2 hours (MCP Inspector, manual testing)
4. Evaluation: 1-2 hours (create 10 questions, format XML)

**Complexity Factors**:
- Number of tools (5-10 typical)
- Authentication complexity (API key simple, OAuth complex)
- Pagination requirements
- Rate limiting handling

**Checklist**:
- [ ] Research phase completes in ~1-2 hours
- [ ] Implementation phase completes in ~3-6 hours
- [ ] Review/Test phase completes in ~1-2 hours
- [ ] Evaluation phase completes in ~1-2 hours
- [ ] Total time 6-12 hours

**If significantly slower**: Check developer experience level, API complexity, mcp-builder guidance clarity.

---

### 13.2 Database MCP Server

**Scenario**: Creating an MCP server for database access (PostgreSQL, MongoDB, Redis)

**Expected Time**: 8-16 hours (for experienced developer)

**Workflow**:
1. Research: 2-3 hours (database client libraries, connection management, security)
2. Implementation: 4-8 hours (10-20 tools, connection pooling, transaction handling, query building)
3. Review/Test: 1-3 hours (test queries, transaction rollback, error scenarios)
4. Evaluation: 1-2 hours (create 10 read-only query questions)

**Complexity Factors**:
- Number of tools (10-20 typical)
- Transaction handling
- Connection pooling
- Query complexity
- Security (SQL injection prevention)

**Checklist**:
- [ ] Research phase completes in ~2-3 hours
- [ ] Implementation phase completes in ~4-8 hours
- [ ] Review/Test phase completes in ~1-3 hours
- [ ] Evaluation phase completes in ~1-2 hours
- [ ] Total time 8-16 hours

**If significantly slower**: Check database-specific complexity (NoSQL vs SQL), security requirements.

---

### 13.3 Cloud Storage MCP Server

**Scenario**: Creating an MCP server for cloud storage (S3, Google Drive, Dropbox)

**Expected Time**: 10-20 hours (for experienced developer)

**Workflow**:
1. Research: 2-4 hours (API docs, authentication, file operations, permissions)
2. Implementation: 5-10 hours (15-25 tools, file upload/download, streaming, permissions, sharing)
3. Review/Test: 2-4 hours (test file operations, large files, error handling)
4. Evaluation: 1-2 hours (create 10 read-only questions about files/folders)

**Complexity Factors**:
- Number of tools (15-25 typical)
- File upload/download streaming
- Large file handling
- Permission management
- Sharing/collaboration features

**Checklist**:
- [ ] Research phase completes in ~2-4 hours
- [ ] Implementation phase completes in ~5-10 hours
- [ ] Review/Test phase completes in ~2-4 hours
- [ ] Evaluation phase completes in ~1-2 hours
- [ ] Total time 10-20 hours

**If significantly slower**: Check file streaming complexity, permission model complexity.

---

### 13.4 Migration/Enhancement Pattern (BOSS Ghost Example)

**Scenario**: Enhancing an existing MCP server with advanced features (autonomous exploration, session persistence, self-healing selectors)

**Expected Time**: 15-30 hours (for experienced developer)

**Workflow**:
1. Research: 3-5 hours (existing codebase, new feature requirements, backward compatibility)
2. Implementation: 8-15 hours (new tools, refactoring, testing backward compatibility)
3. Review/Test: 3-8 hours (comprehensive testing, regression testing, performance testing)
4. Evaluation: 1-2 hours (update evaluations, add new questions for new features)

**Complexity Factors**:
- Existing codebase size
- Backward compatibility requirements
- New feature complexity
- Testing coverage requirements

**Checklist**:
- [ ] Research phase completes in ~3-5 hours
- [ ] Implementation phase completes in ~8-15 hours
- [ ] Review/Test phase completes in ~3-8 hours
- [ ] Evaluation phase completes in ~1-2 hours
- [ ] Total time 15-30 hours

**If significantly slower**: Check backward compatibility requirements, test coverage requirements.

---

## Section 14: Sign-Off Checklist ✅

### Installation Verification Complete
- [ ] All core skill files present (SKILL.md, LICENSE.txt, PACK_*.md)
- [ ] All reference files accessible (4 files in reference/)
- [ ] All evaluation scripts present (4 files in scripts/)
- [ ] Skill loads correctly with @mcp-builder
- [ ] Pack documentation accessible on-demand

### Development Prerequisites Verified
- [ ] Node.js OR Python installation verified (at least one)
- [ ] npm OR pip working correctly
- [ ] MCP Inspector launches (optional, if Node.js installed)
- [ ] Evaluation script dependencies installable (optional, if Python installed)

### Functional Testing Complete - All 4 Phases
**Phase 1: Research**
- [ ] Modern MCP design guidance works
- [ ] MCP protocol documentation study guidance works
- [ ] Framework documentation study guidance works (TypeScript/Python)
- [ ] Implementation planning guidance works

**Phase 2: Implementation**
- [ ] Project setup guidance works (TypeScript OR Python)
- [ ] API client implementation guidance works
- [ ] Tool implementation guidance works (with schemas)
- [ ] Pagination implementation guidance works

**Phase 3: Review/Test**
- [ ] Code quality review checklist provided
- [ ] MCP Inspector testing guidance works
- [ ] Manual testing strategy provided

**Phase 4: Evaluation**
- [ ] Evaluation question creation guidance works (10 questions, read-only, complex)
- [ ] XML format generation works
- [ ] Evaluation scripts usable (optional, if Python installed)

### Integration Verification Complete
- [ ] Works with research skill (API research workflow)
- [ ] Works with fabric skill (documentation analysis workflow)
- [ ] No skill conflicts

### Edge Cases Verified
- [ ] Works without Node.js/Python (research/planning only)
- [ ] Handles WebFetch failures gracefully
- [ ] Handles user preference variations (tool naming)

### Performance Benchmarks Reviewed
- [ ] Simple REST API MCP server: 6-12 hours
- [ ] Database MCP server: 8-16 hours
- [ ] Cloud storage MCP server: 10-20 hours
- [ ] Migration/enhancement: 15-30 hours

### Final Sign-Off
- [ ] All verification sections completed
- [ ] All critical tests passed
- [ ] Any failures documented and understood
- [ ] Ready for production use

---

## Troubleshooting Reference

### Common Issues Quick Reference

| Issue | Likely Cause | Quick Fix |
|-------|-------------|-----------|
| Skill doesn't activate | SKILL.md missing or corrupted | Reinstall mcp-builder skill |
| Reference files not loading | File permissions or path issues | Check file permissions, use absolute paths |
| Node.js setup fails | Node.js version < 18 | Install Node.js 18+ LTS |
| Python setup fails | Python version < 3.8 | Install Python 3.10+ |
| MCP Inspector won't start | Node.js not installed or port conflict | Install Node.js, check port 5173 availability |
| Evaluation scripts fail | Missing dependencies | Run `pip install -r requirements.txt` |
| WebFetch fails | Network issue or site down | Use reference files instead of live docs |
| Tool naming conflicts | User preference vs best practices | Follow snake_case convention recommended |

---

## Next Steps After Verification

### 1. Build Your First MCP Server
Choose a simple REST API service:
- Twilio (SMS/voice)
- SendGrid (email)
- Mailchimp (marketing)
- Stripe (payments - read-only operations)

**Estimated Time**: 6-12 hours for first server

### 2. Study BOSS Ghost MCP Reference
Review advanced patterns:
- Autonomous exploration (BFS crawling)
- Session persistence (save/restore state)
- Self-healing selectors (fallback strategies)
- CAPTCHA detection suite

### 3. Create Comprehensive Evaluations
Practice creating 10 evaluation questions:
- Ensure read-only (no create/update/delete)
- Ensure independent (no dependencies)
- Ensure complex (multiple tool calls)
- Ensure realistic (real-world use cases)

### 4. Join MCP Community
- Share your MCP server
- Learn from other implementations
- Contribute to best practices evolution

---

**Verification Guide Version**: 2.0
**Last Updated**: 2026-01-03
**Estimated Verification Time**: 90-120 minutes (comprehensive)
**Complexity**: Medium-High

---

**VERIFICATION COMPLETE**: If all sections checked off, mcp-builder skill is ready for production use in guiding MCP server development.
