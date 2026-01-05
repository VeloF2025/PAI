# Prompt Enhancement Pack - Verification Guide

**Comprehensive verification and testing procedures for the Prompt Enhancement Pack v2.0**

---

## Table of Contents

1. [Quick Verification](#quick-verification)
2. [Tool Availability Tests](#tool-availability-tests)
3. [Integration Tests](#integration-tests)
4. [Performance Benchmarks](#performance-benchmarks)
5. [MCP Server Tests](#mcp-server-tests)
6. [Quality Gate Tests](#quality-gate-tests)
7. [Framework Integration Tests](#framework-integration-tests)
8. [Troubleshooting Verification Failures](#troubleshooting-verification-failures)

---

## Quick Verification

**Purpose**: Verify basic installation and MCP server connectivity in <5 minutes

### Test 1: MCP Server Connection

**Objective**: Confirm MCP server is running and accessible

**Steps**:

1. Start a new Claude Code session:
```bash
claude
```

2. Check for MCP tools availability:
```
List all available MCP tools
```

**Expected Output**:
```
Available MCP tools:
- mcp__claude-prompts__prompt_engine
- [other MCP tools...]
```

**✅ Pass Criteria**: `mcp__claude-prompts__prompt_engine` appears in tool list

**❌ Fail**: If tool doesn't appear, see PACK_INSTALL.md Troubleshooting Issue 1

---

### Test 2: Basic Enhancement

**Objective**: Verify basic research prompt enhancement works

**Test Command**:
```typescript
Use the prompt_engine tool to enhance this research prompt:
"research JWT security"
```

**Expected Behavior**:
- Tool executes without errors
- Returns enhanced prompt with structure (objectives, key areas, deliverables)
- Enhancement includes security-specific research areas
- Completion time: <2 seconds

**Sample Expected Output**:
```xml
<research_task>
  <objective>
    Comprehensive investigation of JWT (JSON Web Token) security
  </objective>

  <key_areas>
    <area>JWT structure and cryptographic signing</area>
    <area>Common JWT vulnerabilities (algorithm confusion, weak secrets)</area>
    <area>Best practices for JWT implementation</area>
    <area>Token storage and transmission security</area>
  </key_areas>

  <deliverables>
    <format>Markdown report with sections per key area</format>
    <citations>Include source URLs for all claims</citations>
  </deliverables>
</research_task>
```

**✅ Pass Criteria**:
- Tool executes successfully
- Output contains structured enhancement
- Security-specific areas mentioned (vulnerabilities, signing, storage)
- Response time <2 seconds

**❌ Fail**: See PACK_INSTALL.md Troubleshooting Issue 2

---

### Test 3: Coding Prompt Enhancement

**Objective**: Verify coding enhancement generates actionable specs

**Test Command**:
```typescript
Use prompt_engine to enhance this coding prompt:
"add user authentication"
```

**Expected Behavior**:
- Returns detailed implementation specification
- Includes technical approach, database changes, API endpoints
- Specifies security considerations
- Completion time: <3 seconds

**Sample Expected Output** (abbreviated):
```xml
<coding_task>
  <feature>User authentication system</feature>

  <technical_approach>
    <option_1 recommended="true">
      Clerk authentication integration
    </option_1>
    <option_2>
      NextAuth.js with credentials provider
    </option_2>
  </technical_approach>

  <database_changes>
    <table name="users">
      id, email, password_hash, created_at
    </table>
  </database_changes>

  <api_endpoints>
    <endpoint method="POST" path="/api/auth/login">
      Purpose: User login
    </endpoint>
    <endpoint method="POST" path="/api/auth/register">
      Purpose: User registration
    </endpoint>
  </api_endpoints>

  <security_considerations>
    - Password hashing (bcrypt)
    - JWT token storage
    - CSRF protection
  </security_considerations>
</coding_task>
```

**✅ Pass Criteria**:
- Detailed implementation spec returned
- Technical approach options provided
- Database schema included
- API endpoints defined
- Security considerations listed
- Response time <3 seconds

**❌ Fail**: See PACK_INSTALL.md Troubleshooting Issue 2

---

### Test 4: Chain of Thought Enhancement

**Objective**: Verify ReACT framework reasoning added correctly

**Test Command**:
```typescript
Use prompt_engine with add_chain_of_thought:
Original prompt: "debug why the API is returning 500 errors"
```

**Expected Behavior**:
- Returns prompt with Thought → Action → Observation cycles
- Multiple reasoning steps included
- Clear debugging workflow
- Completion time: <2 seconds

**Sample Expected Output**:
```
Thought: Need to identify the root cause of 500 errors
Action: Check API server logs for error messages
Observation: [Placeholder for results]

Thought: Analyze error patterns to categorize failures
Action: Review error stack traces and frequency
Observation: [Placeholder for results]

Thought: Isolate the failing endpoint or component
Action: Test individual endpoints and services
Observation: [Placeholder for results]
```

**✅ Pass Criteria**:
- Thought → Action → Observation structure present
- Multiple reasoning cycles (3+)
- Logical debugging progression
- Response time <2 seconds

**❌ Fail**: See PACK_INSTALL.md Troubleshooting Issue 2

---

### Test 5: Multi-Agent Routing

**Objective**: Verify complex task decomposition works

**Test Command**:
```typescript
Use prompt_engine with multi_agent_router:
Complex task: "build a secure payment processing system"
Available agents: "engineer,architect,pentester"
```

**Expected Behavior**:
- Returns task decomposition plan
- Multiple agents assigned to specialized tasks
- Dependency graph included (architect first, then parallel)
- Estimated timeframes provided
- Completion time: <5 seconds

**Sample Expected Output**:
```json
{
  "task_decomposition": [
    {
      "agent": "architect",
      "task": "Design payment processing architecture",
      "priority": 1,
      "estimated_time": "1 hour"
    },
    {
      "agent": "engineer",
      "task": "Implement payment gateway integration",
      "priority": 2,
      "depends_on": ["architect"],
      "estimated_time": "3 hours"
    },
    {
      "agent": "pentester",
      "task": "Security audit of payment flow",
      "priority": 2,
      "depends_on": ["architect"],
      "estimated_time": "1.5 hours"
    }
  ],
  "parallel_execution": true
}
```

**✅ Pass Criteria**:
- Task decomposition into 3 agent-specific tasks
- Architect task has priority 1 (runs first)
- Engineer and pentester tasks can run in parallel (priority 2)
- Dependencies correctly specified
- Estimated times provided
- Response time <5 seconds

**❌ Fail**: See PACK_INSTALL.md Troubleshooting Issue 2

---

## Tool Availability Tests

**Purpose**: Verify all 8 enhancement tools are accessible and functional

### Test 6: enhance_research_prompt

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_research_prompt short_prompt=\"research GraphQL best practices\" agent_type=\"perplexity-researcher\" depth_level=\"extensive\""
})
```

**✅ Pass Criteria**:
- Tool executes without error
- Returns comprehensive research specification
- Depth level "extensive" reflected in output detail
- Agent type "perplexity-researcher" mentioned or optimized for

**❌ Fail Indicators**:
- `Unknown command: >>enhance_research_prompt`
- `Tool not found`
- Timeout error

---

### Test 7: enhance_coding_prompt

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_coding_prompt short_prompt=\"add file upload feature\" project_context=\"Next.js app with S3\" complexity=\"high\""
})
```

**✅ Pass Criteria**:
- Returns detailed coding specification
- Technical approach for S3 integration included
- Complexity "high" reflected in comprehensive scope
- Security considerations for file uploads mentioned

**❌ Fail Indicators**:
- `Unknown command: >>enhance_coding_prompt`
- Missing technical details
- No S3-specific guidance

---

### Test 8: enhance_agent_task

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_agent_task short_prompt=\"optimize database queries\" agent_type=\"engineer\" context=\"PostgreSQL database with slow dashboard\""
})
```

**✅ Pass Criteria**:
- Returns engineer-optimized task specification
- PostgreSQL-specific optimization strategies
- Performance metrics and benchmarks included
- Context about "slow dashboard" incorporated

**❌ Fail Indicators**:
- Generic optimization advice (not PostgreSQL-specific)
- No mention of dashboard context
- Missing performance benchmarks

---

### Test 9: add_chain_of_thought

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>add_chain_of_thought original_prompt=\"investigate why tests are failing\" reasoning_depth=\"detailed\""
})
```

**✅ Pass Criteria**:
- Thought → Action → Observation structure present
- Multiple reasoning cycles (5+)
- "Detailed" depth reflected in thorough analysis
- Logical investigation workflow

**❌ Fail Indicators**:
- No reasoning structure
- Only 1-2 cycles
- Shallow analysis

---

### Test 10: add_few_shot_examples

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>add_few_shot_examples original_prompt=\"write Drizzle ORM migration\" num_examples=\"3\" example_type=\"code\""
})
```

**✅ Pass Criteria**:
- Returns prompt with exactly 3 code examples
- Examples are relevant to Drizzle ORM migrations
- Examples show progressive complexity
- Code is syntactically valid

**❌ Fail Indicators**:
- Wrong number of examples (not 3)
- Examples not code-based
- Syntax errors in examples

---

### Test 11: optimize_for_claude

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>optimize_for_claude original_prompt=\"analyze this codebase for bugs\" claude_model=\"sonnet\" optimization_level=\"standard\""
})
```

**✅ Pass Criteria**:
- Returns XML-structured prompt
- Sonnet-specific optimizations applied
- Standard optimization level reflected in balanced detail
- Clear task structure with sections

**❌ Fail Indicators**:
- No XML structure
- Plain text output
- No model-specific optimizations

---

### Test 12: compress_prompt

**Test Command**:
```typescript
// Create a long prompt first
const longPrompt = "I need you to conduct comprehensive research on modern authentication strategies including session-based authentication with cookie security and session storage, token-based authentication with JWT implementation and storage strategies, OAuth 2.0 and OpenID Connect flows, passwordless authentication with magic links and WebAuthn, and multi-factor authentication with TOTP and SMS codes.";

mcp__claude-prompts__prompt_engine({
  command: `>>compress_prompt original_prompt="${longPrompt}" compression_level=\"aggressive\" preserve_quality=\"true\"`
})
```

**✅ Pass Criteria**:
- Output is 40-60% shorter than input
- All key topics preserved (session, JWT, OAuth, passwordless, MFA)
- Uses compact formatting (XML, bullets, pipes)
- Quality preserved (no loss of requirements)

**❌ Fail Indicators**:
- <30% compression (not aggressive enough)
- Missing key topics
- Quality degraded (unclear requirements)

---

### Test 13: multi_agent_router

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>multi_agent_router complex_task=\"implement real-time chat with encryption\" available_agents=\"engineer,architect,pentester,designer\""
})
```

**✅ Pass Criteria**:
- Returns task decomposition for all 4 agents
- Architect task has highest priority
- Parallel execution plan included
- Dependencies correctly specified
- Integration plan provided

**❌ Fail Indicators**:
- Not all agents utilized
- No dependency management
- Missing integration plan

---

## Integration Tests

**Purpose**: Verify multi-stage enhancement pipelines and agent integration

### Test 14: Auto-Enhancement Before Agent Calls

**Integration Pattern 1**: Enhance → Execute

**Test Workflow**:

```typescript
// Step 1: Enhance vague research prompt
const enhanced = await mcp__claude-prompts__prompt_engine({
  command: ">>enhance_research_prompt short_prompt=\"research API security\" agent_type=\"perplexity-researcher\" depth_level=\"extensive\""
});

// Step 2: Pass enhanced prompt to research agent
const result = await Task({
  subagent_type: "perplexity-researcher",
  prompt: enhanced.result,
  description: "Research API security"
});
```

**✅ Pass Criteria**:
- Enhancement completes successfully
- Enhanced prompt is comprehensive (>500 words)
- Research agent accepts enhanced prompt
- Research agent produces higher quality output than with original vague prompt
- Total workflow time: <3 minutes

**Validation**:
- Compare research quality with original prompt "research API security" (control)
- Enhanced prompt should yield 50%+ more comprehensive research
- Enhanced prompt should have clear structure and deliverables

**❌ Fail Indicators**:
- Enhancement doesn't improve research quality
- Agent fails to execute with enhanced prompt
- Workflow takes >5 minutes

---

### Test 15: Multi-Stage Enhancement Pipeline

**Integration Pattern 2**: Clarify → Reason → Optimize → Examples

**Test Workflow**:

```typescript
// Stage 1: Clarify vague prompt
const clarified = await mcp__claude-prompts__prompt_engine({
  command: ">>enhance_coding_prompt short_prompt=\"improve performance\" project_context=\"Next.js app\" complexity=\"medium\""
});

// Stage 2: Add reasoning steps
const reasoned = await mcp__claude-prompts__prompt_engine({
  command: `>>add_chain_of_thought original_prompt="${clarified.result}" reasoning_depth=\"detailed\"`
});

// Stage 3: Optimize for Claude
const optimized = await mcp__claude-prompts__prompt_engine({
  command: `>>optimize_for_claude original_prompt="${reasoned.result}" claude_model=\"sonnet\" optimization_level=\"standard\"`
});

// Stage 4: Add examples
const with_examples = await mcp__claude-prompts__prompt_engine({
  command: `>>add_few_shot_examples original_prompt="${optimized.result}" num_examples=\"2\" example_type=\"code\"`
});

// Stage 5: Execute with engineer agent
const result = await Task({
  subagent_type: "engineer",
  prompt: with_examples.result,
  description: "Improve Next.js performance"
});
```

**✅ Pass Criteria**:
- All 4 enhancement stages complete successfully
- Final prompt is comprehensive and structured
- Engineer agent executes successfully
- Total pipeline time: <15 seconds (enhancement only)
- Agent execution produces actionable optimization plan

**Validation Metrics**:
- **Stage 1 Output**: Specific optimization targets identified (e.g., "reduce bundle size", "optimize rendering")
- **Stage 2 Output**: Thought → Action → Observation cycles for each target
- **Stage 3 Output**: XML-structured with Claude Sonnet optimizations
- **Stage 4 Output**: 2 code examples showing before/after optimizations
- **Final Quality**: Engineer agent produces implementation plan with specific file changes

**❌ Fail Indicators**:
- Any stage fails or times out
- Final prompt is incoherent (stages don't integrate well)
- Agent fails to execute
- Pipeline takes >30 seconds

---

### Test 16: Multi-Agent Routing with Parallel Execution

**Integration Pattern 3**: Route → Parallel Enhance → Execute → Integrate

**Test Workflow**:

```typescript
// Stage 1: Route complex task to multiple agents
const routing = await mcp__claude-prompts__prompt_engine({
  command: ">>multi_agent_router complex_task=\"build authentication system with OAuth and 2FA\" available_agents=\"engineer,architect,pentester\""
});

// Stage 2: Enhance each sub-task in parallel
const tasks = routing.task_decomposition;
const enhanced_tasks = await Promise.all(
  tasks.map(task =>
    mcp__claude-prompts__prompt_engine({
      command: `>>enhance_agent_task short_prompt="${task.task}" agent_type="${task.agent}" context=\"OAuth + 2FA auth system\"`
    })
  )
);

// Stage 3: Execute agents in parallel (respect dependencies)
// First: architect (priority 1)
const architect_result = await Task({
  subagent_type: "architect",
  prompt: enhanced_tasks[0].result,
  description: "Design auth architecture"
});

// Then: engineer and pentester in parallel (priority 2)
const [engineer_result, pentester_result] = await Promise.all([
  Task({
    subagent_type: "engineer",
    prompt: enhanced_tasks[1].result,
    description: "Implement auth system"
  }),
  Task({
    subagent_type: "pentester",
    prompt: enhanced_tasks[2].result,
    description: "Security audit auth system"
  })
]);

// Stage 4: Integration
const integration = {
  architecture: architect_result,
  implementation: engineer_result,
  security_audit: pentester_result
};
```

**✅ Pass Criteria**:
- Routing identifies 3 agents (architect, engineer, pentester)
- All 3 sub-tasks enhanced successfully in parallel
- Architect task executes first (priority 1)
- Engineer and pentester execute in parallel
- All agents complete successfully
- Total workflow time: <5 minutes (significant savings vs sequential)

**Validation Metrics**:
- **Routing Output**: 3 tasks with correct priorities and dependencies
- **Parallel Enhancement**: 3 enhancements complete in ~5 seconds total (not 15 seconds sequential)
- **Architect Output**: System architecture diagram, component design
- **Engineer Output**: Implementation plan with code structure
- **Pentester Output**: Security assessment and vulnerability checklist
- **Integration**: All outputs are coherent and address the same auth system

**❌ Fail Indicators**:
- Routing doesn't create proper task decomposition
- Parallel enhancement fails or is slower than sequential
- Dependency order not respected (engineer runs before architect)
- Agent outputs are incoherent or contradictory

---

## Performance Benchmarks

**Purpose**: Verify enhancement performance meets expected targets

### Test 17: Prompt Mode Performance (<100ms)

**Test**: Simple variable substitution

**Command**:
```typescript
// Use template with simple variables (no LLM calls)
const start = Date.now();

const result = await mcp__claude-prompts__prompt_engine({
  command: ">>enhance_research_prompt short_prompt=\"test\" depth_level=\"quick\""
});

const duration = Date.now() - start;
```

**✅ Pass Criteria**:
- Execution time: <100ms
- Result returned successfully
- Simple enhancement without complex processing

**Benchmark Targets**:
- **Excellent**: <50ms
- **Good**: 50-100ms
- **Acceptable**: 100-200ms
- **Poor**: >200ms

**❌ Fail**: If execution time >200ms, see PACK_INSTALL.md Performance Tuning

---

### Test 18: Template Mode Performance (<500ms)

**Test**: Framework enhancement with single LLM call

**Command**:
```typescript
const start = Date.now();

const result = await mcp__claude-prompts__prompt_engine({
  command: ">>add_chain_of_thought original_prompt=\"debug API errors\" reasoning_depth=\"standard\""
});

const duration = Date.now() - start;
```

**✅ Pass Criteria**:
- Execution time: <500ms
- Framework structure applied correctly
- Single LLM enhancement call

**Benchmark Targets**:
- **Excellent**: <200ms
- **Good**: 200-500ms
- **Acceptable**: 500-1000ms
- **Poor**: >1000ms

**❌ Fail**: If execution time >1000ms, check network latency and MCP server performance

---

### Test 19: Chain Mode Performance (1-5s)

**Test**: Multi-step enhancement pipeline with multiple LLM calls

**Command**:
```typescript
const start = Date.now();

// Multi-stage enhancement
const stage1 = await mcp__claude-prompts__prompt_engine({
  command: ">>enhance_coding_prompt short_prompt=\"add feature\" complexity=\"high\""
});

const stage2 = await mcp__claude-prompts__prompt_engine({
  command: `>>add_chain_of_thought original_prompt="${stage1.result}" reasoning_depth=\"detailed\"`
});

const stage3 = await mcp__claude-prompts__prompt_engine({
  command: `>>optimize_for_claude original_prompt="${stage2.result}" claude_model=\"sonnet\"`
});

const duration = Date.now() - start;
```

**✅ Pass Criteria**:
- Execution time: 1-5 seconds
- All 3 stages complete successfully
- Quality gates validation passes

**Benchmark Targets**:
- **Excellent**: 1-2 seconds
- **Good**: 2-5 seconds
- **Acceptable**: 5-10 seconds
- **Poor**: >10 seconds

**❌ Fail**: If execution time >10 seconds, check:
- Network latency
- MCP server timeout settings
- LLM API response times

---

### Test 20: Token Compression Performance

**Test**: Aggressive compression achieving 40-60% reduction

**Command**:
```typescript
const longPrompt = `I need comprehensive research on authentication including session-based with cookies, token-based with JWT, OAuth 2.0 flows, passwordless with magic links, and MFA with TOTP. For each approach provide detailed implementation, security considerations, best practices, real-world examples, and code samples.`;

const originalTokens = longPrompt.split(/\s+/).length; // Rough estimate

const start = Date.now();

const result = await mcp__claude-prompts__prompt_engine({
  command: `>>compress_prompt original_prompt="${longPrompt}" compression_level=\"aggressive\" preserve_quality=\"true\"`
});

const compressedTokens = result.result.split(/\s+/).length;
const reduction = ((originalTokens - compressedTokens) / originalTokens * 100).toFixed(1);
const duration = Date.now() - start;
```

**✅ Pass Criteria**:
- Token reduction: 40-60%
- Quality preserved (all key topics remain)
- Execution time: <1 second
- Output is semantically equivalent

**Benchmark Targets**:
- **Token Reduction**:
  - Excellent: 50-65%
  - Good: 40-50%
  - Acceptable: 30-40%
  - Poor: <30%

**❌ Fail Indicators**:
- Reduction <30% (compression ineffective)
- Quality loss (missing key topics)
- Execution time >2 seconds

---

## MCP Server Tests

**Purpose**: Verify MCP server health and connectivity

### Test 21: MCP Server Startup

**Test**: Verify server starts without errors

**Command**:
```bash
# Manual server startup test
npx @minipuft/claude-prompts-mcp --version
```

**✅ Pass Criteria**:
- Server starts within 5 seconds
- Version number displayed
- No error messages

**❌ Fail Indicators**:
- `Error: Cannot find module`
- `Permission denied`
- Timeout after 10 seconds

---

### Test 22: MCP Server Logs

**Test**: Verify server logging and error reporting

**Command**:
```bash
# Check MCP server logs
cat ~/.claude/logs/mcp-claude-prompts.log
```

**✅ Pass Criteria**:
- Log file exists
- Contains initialization messages
- No critical errors
- Recent timestamps (within last session)

**Expected Log Entries**:
```
[INFO] MCP server started
[INFO] Prompts directory: ~/.claude/prompts
[INFO] Hot-reload: enabled
[INFO] 8 enhancement tools registered
```

**❌ Fail Indicators**:
- Log file missing or empty
- Errors: `Failed to initialize`, `Cannot load templates`
- No recent entries (server not running)

---

### Test 23: MCP Server Hot-Reload

**Test**: Verify template hot-reload functionality

**Steps**:

1. Enable hot-reload in settings.json:
```json
"env": {
  "HOT_RELOAD": "true",
  "WATCH_INTERVAL": "1000"
}
```

2. Start Claude Code session

3. Create test template:
```bash
echo "Test template content" > ~/.claude/prompts/research/test-hotreload.md
```

4. Wait 2 seconds

5. Check MCP server logs:
```bash
tail -f ~/.claude/logs/mcp-claude-prompts.log
```

**✅ Pass Criteria**:
- Log shows: `Templates reloaded`
- Timestamp within 2 seconds of file creation
- No errors during reload

**❌ Fail Indicators**:
- No reload message in logs
- Errors: `File watcher failed`, `Template load error`
- Reload takes >5 seconds

---

### Test 24: MCP Server Connection Stability

**Test**: Verify server maintains connection during extended session

**Steps**:

1. Start Claude Code session
2. Perform 10 consecutive enhancements (various tools)
3. Check for disconnections or errors

**Test Commands** (run sequentially):
```typescript
// Enhancement 1
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_research_prompt short_prompt=\"test 1\" depth_level=\"quick\""
})

// Enhancement 2-10: Similar commands with different parameters
```

**✅ Pass Criteria**:
- All 10 enhancements complete successfully
- No connection errors
- Consistent performance (no degradation)
- No memory leaks (server memory stable)

**❌ Fail Indicators**:
- Any enhancement fails with connection error
- Performance degrades over time
- Server memory increases significantly (>500MB)

---

## Quality Gate Tests

**Purpose**: Verify 4-layer quality gate validation

### Test 25: Content Structure Validation

**Test**: Verify prompts with poor structure are caught

**Bad Prompt Example**:
```
Make it faster
```

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_coding_prompt short_prompt=\"Make it faster\" complexity=\"low\""
})
```

**✅ Pass Criteria**:
- Enhancement identifies missing context
- Auto-fix adds: objective, scope, deliverables, success criteria
- Output is structured and comprehensive

**Enhanced Output Should Include**:
- Clear objective: "Improve application performance"
- Scope definition: Which component/feature to optimize
- Deliverables: Specific optimization targets
- Success criteria: Performance metrics (e.g., "50% faster load time")

**❌ Fail**: If enhancement doesn't improve structure or add missing elements

---

### Test 26: Technical Accuracy Validation

**Test**: Verify deprecated patterns are caught and fixed

**Bad Prompt Example**:
```
Use React.createClass to create a new component
```

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_coding_prompt short_prompt=\"Use React.createClass to create a new component\" project_context=\"React 18\" complexity=\"low\""
})
```

**✅ Pass Criteria**:
- Enhancement detects deprecated `React.createClass`
- Auto-fix suggests modern alternative (function component or `class` syntax)
- Warning about deprecation included

**Enhanced Output Should Include**:
- Modern approach: "Use function component with hooks"
- Explanation: "createClass deprecated since React 15.5"
- Example: Function component syntax

**❌ Fail**: If enhancement doesn't catch deprecation or suggest modern alternative

---

### Test 27: Security Awareness Validation

**Test**: Verify security considerations are added when missing

**Insecure Prompt Example**:
```
Create API endpoint that accepts user input and queries database
```

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_coding_prompt short_prompt=\"Create API endpoint that accepts user input and queries database\" project_context=\"Node.js + PostgreSQL\" complexity=\"medium\""
})
```

**✅ Pass Criteria**:
- Enhancement adds security requirements
- SQL injection prevention mentioned (parameterized queries)
- Input validation specified
- Authentication/authorization mentioned

**Enhanced Output Must Include**:
- **Input Validation**: Type checking, sanitization
- **SQL Injection Prevention**: Parameterized queries, ORM usage
- **Authentication**: Require valid user session
- **Authorization**: Check user permissions

**❌ Fail**: If enhancement doesn't add security considerations

---

### Test 28: Code Quality Validation

**Test**: Verify code quality requirements are added

**Low-Quality Prompt Example**:
```
Write function to fetch user data
```

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_coding_prompt short_prompt=\"Write function to fetch user data\" project_context=\"TypeScript + React\" complexity=\"low\""
})
```

**✅ Pass Criteria**:
- Enhancement adds type safety requirements (TypeScript types)
- Error handling specified
- Testing expectations included
- Code documentation standards mentioned

**Enhanced Output Must Include**:
- **TypeScript Types**: Function signature, return type, parameter types
- **Error Handling**: try/catch, error states, fallback behavior
- **Testing**: Unit test requirements
- **Documentation**: JSDoc comments

**❌ Fail**: If enhancement doesn't add quality requirements

---

## Framework Integration Tests

**Purpose**: Verify framework auto-selection and application

### Test 29: CAGEERF Framework Auto-Selection

**Test**: Verify CAGEERF selected for complex analytical tasks

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_research_prompt short_prompt=\"Analyze microservices vs monolithic architecture for enterprise application\" depth_level=\"extensive\""
})
```

**✅ Pass Criteria**:
- CAGEERF framework structure detected in output
- Contains sections: Context, Analysis, Goals, Execution, Evaluation, Refinement, Framework
- Comprehensive analytical approach
- Strategic planning elements

**❌ Fail**: If simpler framework used or no framework structure

---

### Test 30: ReACT Framework Auto-Selection

**Test**: Verify ReACT selected for debugging/investigation tasks

**Test Command**:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_coding_prompt short_prompt=\"Debug why database queries are slow\" project_context=\"PostgreSQL\" complexity=\"medium\""
})
```

**✅ Pass Criteria**:
- ReACT framework structure (Thought → Action → Observation)
- Multiple reasoning cycles for debugging
- Investigative approach with hypothesis testing

**❌ Fail**: If different framework used or no reasoning structure

---

## Troubleshooting Verification Failures

### Common Issues

**Issue 1: All Tests Fail**

**Likely Cause**: MCP server not configured

**Fix**: See PACK_INSTALL.md Step 2 - Configure Claude Code Settings

---

**Issue 2: Intermittent Failures**

**Likely Cause**: Network latency or timeout issues

**Fix**: Increase timeout in settings.json:
```json
"timeout": 60000
```

---

**Issue 3: Quality Gate Tests Fail**

**Likely Cause**: Quality gates disabled or not configured

**Fix**: Verify MCP server version supports quality gates (v1.0.0+)

---

**Issue 4: Performance Tests Fail**

**Likely Cause**: System resource constraints

**Fix**: Check system resources, close other applications, or adjust performance expectations

---

## Verification Summary

### Quick Verification Checklist

- [ ] Test 1: MCP server connection (✅ Pass)
- [ ] Test 2: Basic enhancement (✅ Pass)
- [ ] Test 3: Coding prompt enhancement (✅ Pass)
- [ ] Test 4: Chain of thought enhancement (✅ Pass)
- [ ] Test 5: Multi-agent routing (✅ Pass)

**If all 5 quick tests pass**: Installation verified successfully ✅

### Full Verification Checklist

- [ ] Tests 1-5: Quick verification (✅ All Pass)
- [ ] Tests 6-13: Tool availability (✅ All 8 tools work)
- [ ] Tests 14-16: Integration patterns (✅ All 3 patterns work)
- [ ] Tests 17-20: Performance benchmarks (✅ Meet targets)
- [ ] Tests 21-24: MCP server health (✅ Stable and connected)
- [ ] Tests 25-28: Quality gates (✅ All 4 layers validate)
- [ ] Tests 29-30: Framework integration (✅ Auto-selection works)

**If all 30 tests pass**: Pack fully verified ✅

---

**Verification Guide Version**: 1.0
**Pack Version**: 2.0
**Last Updated**: 2026-01-04

*Complete verification and testing guide for Prompt Enhancement Pack v2.0*
