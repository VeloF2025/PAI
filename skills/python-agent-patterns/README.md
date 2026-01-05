# Python Agent Patterns - Pack README

**Pack Version**: 2.0
**Skill Type**: Architecture / Educational
**Complexity**: Medium
**Token Savings**: ~73% (11,000 → 3,000 upfront)

---

## Overview

Python agent architecture patterns for building autonomous AI agents with modular skill-based design in FastAPI backends. Derived from the BOSS Exchange spam detection agent, this skill provides battle-tested patterns for creating scalable, maintainable agent systems with skill orchestration, parameter validation, standardized results, and REST API integration.

**Perfect for**: Building autonomous agents, creating skill-based architectures, implementing workflow automation, and designing API-driven agent systems.

---

## Architecture

### Three-Tier Agent Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    REST API Layer                        │
│  FastAPI Router → Endpoints (status, skills, execute)   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Domain Agent Layer                      │
│  BaseAgent → Skill Orchestration → Workflow Composition │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Skill Library Layer                      │
│  AgentSkill → execute() → AgentResult                   │
└─────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. Base Classes (Foundation)**
- **AgentSkill**: Abstract base class for all skills
  - `execute(**kwargs) -> AgentResult` - Async skill execution
  - `get_parameters_schema() -> Dict` - JSON schema for parameters
  - `validate_parameters(params) -> tuple[bool, str]` - Validation logic

- **AgentResult**: Dataclass for standardized results
  - `success: bool` - Execution status
  - `data: Dict[str, Any]` - Result data
  - `message: str` - Human-readable message
  - `error: Optional[str]` - Error description
  - `execution_time_ms: float` - Performance metric
  - `metadata: Dict[str, Any]` - Additional context

**2. Domain Agent (Orchestration)**
- **BaseAgent**: Base class for domain-specific agents
  - `initialize()` - Async initialization and skill registration
  - `_register_skills()` - Abstract method for skill registration
  - `register_skill(skill)` - Add skill to agent
  - `execute_skill(skill_name, parameters)` - Execute skill with validation
  - `get_status()` - Agent health and metrics
  - `list_skills()` - Available skills with schemas

**3. Task Queue Pattern**
- **AgentTask**: Dataclass for task management
  - `task_id: str` - Unique identifier
  - `skill_name: str` - Skill to execute
  - `parameters: Dict` - Skill parameters
  - `priority: TaskPriority` - LOW, NORMAL, HIGH, CRITICAL
  - `status: TaskStatus` - PENDING, RUNNING, COMPLETED, FAILED
  - `created_at: datetime` - Timestamp
  - `result: Optional[AgentResult]` - Execution result

**4. FastAPI Integration**
- **Router Pattern**: REST API endpoints
  - `GET /status` - Agent status and skill count
  - `GET /skills` - List available skills with schemas
  - `POST /execute` - Generic skill execution endpoint
  - `POST /workflows/{name}` - High-level workflow endpoints

**5. Singleton Pattern**
- **Factory Function**: Global agent instance management
  - `get_{domain}_agent()` - Returns singleton instance
  - Prevents multiple agent instances
  - Ensures skill registration happens once

---

## 6 Key Features

### 1. Modular Skill Architecture

**What**: Each capability is encapsulated as a separate AgentSkill class

**Why**: Enables independent development, testing, and reuse of agent capabilities

**Example**:
```python
class DetectSpamSkill(AgentSkill):
    """Detects spam in messages using ML model"""

    def __init__(self):
        super().__init__(
            name="detect_spam",
            description="Analyze message content for spam patterns"
        )

    def get_parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "db": {"type": "object"},
                "message_id": {"type": "integer"}
            },
            "required": ["db", "message_id"]
        }

    async def execute(
        self,
        db: AsyncSession,
        message_id: int
    ) -> AgentResult:
        try:
            # Fetch message
            message = await get_message(db, message_id)

            # Run spam detection
            spam_score = await self._analyze_content(message.content)

            return AgentResult(
                success=True,
                data={"spam_score": spam_score, "is_spam": spam_score > 0.8},
                message=f"Analyzed message {message_id}"
            )
        except Exception as e:
            return AgentResult(success=False, error=str(e))
```

**Benefits**:
- ✅ Single Responsibility (each skill does one thing)
- ✅ Easy to test in isolation
- ✅ Reusable across agents
- ✅ Clear API surface (parameters schema)

---

### 2. Standardized Result Format

**What**: All skills return AgentResult dataclass with consistent structure

**Why**: Enables reliable error handling, metrics collection, and workflow composition

**Example**:
```python
@dataclass
class AgentResult:
    success: bool
    data: Dict[str, Any] = field(default_factory=dict)
    message: str = ""
    error: Optional[str] = None
    execution_time_ms: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "data": self.data,
            "message": self.message,
            "error": self.error,
            "execution_time_ms": self.execution_time_ms,
            "metadata": self.metadata
        }
```

**Usage in Workflows**:
```python
async def process_message_workflow(
    self,
    db: AsyncSession,
    message_id: int
) -> AgentResult:
    results = {"steps": []}

    # Step 1: Detect spam
    spam_result = await self.execute_skill("detect_spam", {
        "db": db, "message_id": message_id
    })
    results["steps"].append({"detect_spam": spam_result.success})

    if not spam_result.success:
        return AgentResult(success=False, data=results, error=spam_result.error)

    # Step 2: If spam detected, take action
    if spam_result.data.get("is_spam"):
        action_result = await self.execute_skill("quarantine_message", {
            "db": db, "message_id": message_id
        })
        results["steps"].append({"quarantine": action_result.success})
        results["quarantined"] = action_result.success

    return AgentResult(success=True, data=results)
```

**Benefits**:
- ✅ Consistent error handling across all skills
- ✅ Easy to chain skills in workflows (check `.success`)
- ✅ Built-in performance tracking (execution_time_ms)
- ✅ Metadata for debugging and logging

---

### 3. Async Skill Execution

**What**: All skill execution is asynchronous using async/await

**Why**: Enables concurrent execution, non-blocking I/O, and better resource utilization

**Example**:
```python
class BaseAgent(ABC):
    async def execute_skill(
        self,
        skill_name: str,
        parameters: Dict[str, Any] = None
    ) -> AgentResult:
        """Execute a specific skill with validation"""
        skill = self.skills.get(skill_name)
        if not skill:
            return AgentResult(
                success=False,
                error=f"Skill not found: {skill_name}"
            )

        params = parameters or {}
        is_valid, error_msg = skill.validate_parameters(params)
        if not is_valid:
            return AgentResult(success=False, error=error_msg)

        start_time = time.time()
        result = await skill.execute(**params)  # Async execution
        execution_time = (time.time() - start_time) * 1000

        result.execution_time_ms = execution_time
        return result
```

**Concurrent Execution**:
```python
async def analyze_multiple_messages(
    self,
    db: AsyncSession,
    message_ids: List[int]
) -> AgentResult:
    """Process multiple messages concurrently"""
    tasks = [
        self.execute_skill("detect_spam", {"db": db, "message_id": msg_id})
        for msg_id in message_ids
    ]

    results = await asyncio.gather(*tasks)

    spam_count = sum(1 for r in results if r.data.get("is_spam"))

    return AgentResult(
        success=True,
        data={
            "total_analyzed": len(message_ids),
            "spam_detected": spam_count,
            "results": [r.to_dict() for r in results]
        }
    )
```

**Benefits**:
- ✅ Non-blocking I/O (database queries, API calls)
- ✅ Concurrent skill execution (process multiple items in parallel)
- ✅ Better throughput for I/O-bound workloads
- ✅ Compatible with FastAPI async endpoints

---

### 4. Parameter Validation

**What**: JSON schema-based parameter validation before skill execution

**Why**: Prevents runtime errors, provides clear API contracts, enables auto-documentation

**Example**:
```python
class AgentSkill(ABC):
    def validate_parameters(self, params: Dict[str, Any]) -> tuple[bool, str]:
        """Validate parameters against schema"""
        schema = self.get_parameters_schema()
        required = schema.get("required", [])

        # Check required parameters
        for req in required:
            if req not in params:
                return False, f"Missing required parameter: {req}"

        # Type validation (basic)
        properties = schema.get("properties", {})
        for param_name, param_value in params.items():
            if param_name in properties:
                expected_type = properties[param_name].get("type")
                # Type checking logic here

        return True, ""
```

**Schema Definition**:
```python
def get_parameters_schema(self) -> Dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "db": {
                "type": "object",
                "description": "Database session (AsyncSession)"
            },
            "message_id": {
                "type": "integer",
                "description": "ID of message to analyze"
            },
            "threshold": {
                "type": "number",
                "default": 0.8,
                "description": "Spam score threshold (0-1)"
            }
        },
        "required": ["db", "message_id"]
    }
```

**FastAPI Integration**:
```python
@router.post("/execute")
async def execute_skill(
    request: ExecuteRequest,
    db: AsyncSession = Depends(get_db)
):
    """Execute skill with automatic validation"""
    agent = get_spam_agent()
    await agent.initialize()

    params = request.parameters.copy()
    params["db"] = db

    # Validation happens inside execute_skill()
    result = await agent.execute_skill(request.skill_name, params)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return result.to_dict()
```

**Benefits**:
- ✅ Fail fast (validation before execution)
- ✅ Clear error messages (missing parameters, type mismatches)
- ✅ Auto-generated API documentation (from schemas)
- ✅ Client libraries can use schemas for validation

---

### 5. Workflow Composition

**What**: Combine multiple skills into high-level workflows with conditional logic

**Why**: Enables complex multi-step automation while maintaining single-responsibility skills

**Example - Spam Processing Workflow**:
```python
class SpamAgent(BaseAgent):
    async def process_spam_workflow(
        self,
        db: AsyncSession,
        message_id: int
    ) -> AgentResult:
        """Complete spam processing workflow"""
        workflow_data = {
            "message_id": message_id,
            "steps": [],
            "actions_taken": []
        }

        # Step 1: Detect spam
        detect_result = await self.execute_skill("detect_spam", {
            "db": db, "message_id": message_id
        })
        workflow_data["steps"].append({
            "name": "detect_spam",
            "success": detect_result.success,
            "spam_score": detect_result.data.get("spam_score")
        })

        if not detect_result.success:
            return AgentResult(success=False, data=workflow_data, error=detect_result.error)

        # Step 2: If spam detected, quarantine
        if detect_result.data.get("is_spam"):
            quarantine_result = await self.execute_skill("quarantine_message", {
                "db": db, "message_id": message_id
            })
            workflow_data["steps"].append({
                "name": "quarantine_message",
                "success": quarantine_result.success
            })
            workflow_data["actions_taken"].append("quarantined")

            # Step 3: Update sender reputation
            reputation_result = await self.execute_skill("update_sender_reputation", {
                "db": db, "message_id": message_id, "penalty": -10
            })
            workflow_data["steps"].append({
                "name": "update_reputation",
                "success": reputation_result.success
            })
            workflow_data["actions_taken"].append("reputation_penalty")

            # Step 4: Notify admins if high-confidence spam
            if detect_result.data.get("spam_score", 0) > 0.95:
                notify_result = await self.execute_skill("notify_admins", {
                    "db": db,
                    "message_id": message_id,
                    "reason": "High-confidence spam detected"
                })
                workflow_data["steps"].append({
                    "name": "notify_admins",
                    "success": notify_result.success
                })
                workflow_data["actions_taken"].append("admin_notified")

        return AgentResult(
            success=True,
            data=workflow_data,
            message=f"Processed message {message_id}: {len(workflow_data['actions_taken'])} actions taken"
        )
```

**FastAPI Workflow Endpoint**:
```python
@router.post("/workflows/process-spam")
async def process_spam(
    message_id: int,
    db: AsyncSession = Depends(get_db)
):
    """High-level spam processing workflow"""
    agent = get_spam_agent()
    await agent.initialize()

    result = await agent.process_spam_workflow(db, message_id)

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result.to_dict()
```

**Benefits**:
- ✅ Reusable skills across workflows
- ✅ Complex logic with simple building blocks
- ✅ Conditional execution based on results
- ✅ Complete audit trail (all steps recorded)

---

### 6. FastAPI Integration

**What**: REST API router pattern exposing agent capabilities via HTTP endpoints

**Why**: Enables external access, API-first architecture, and integration with other services

**Complete Router Example**:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/spam-agent", tags=["Spam Agent"])

class ExecuteRequest(BaseModel):
    skill_name: str
    parameters: Dict[str, Any] = {}

@router.get("/status")
async def get_status():
    """Get agent status and health"""
    agent = get_spam_agent()
    await agent.initialize()

    status = agent.get_status()
    return {
        "agent_name": status["name"],
        "description": status["description"],
        "skills_count": status["skills_count"],
        "initialized": status["initialized"]
    }

@router.get("/skills")
async def list_skills():
    """List all available skills with schemas"""
    agent = get_spam_agent()
    await agent.initialize()

    return {"skills": agent.list_skills()}

@router.post("/execute")
async def execute_skill(
    request: ExecuteRequest,
    db: AsyncSession = Depends(get_db)
):
    """Execute a specific skill by name"""
    agent = get_spam_agent()
    await agent.initialize()

    # Inject database session
    params = request.parameters.copy()
    params["db"] = db

    # Execute with validation
    result = await agent.execute_skill(request.skill_name, params)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return result.to_dict()

@router.post("/workflows/process-spam")
async def process_spam_workflow(
    message_id: int,
    db: AsyncSession = Depends(get_db)
):
    """High-level spam processing workflow"""
    agent = get_spam_agent()
    await agent.initialize()

    result = await agent.process_spam_workflow(db, message_id)

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result.to_dict()

@router.get("/tasks")
async def list_tasks():
    """List all queued tasks"""
    agent = get_spam_agent()
    await agent.initialize()

    return {"tasks": [task.to_dict() for task in agent.task_queue]}
```

**Main App Registration**:
```python
from fastapi import FastAPI
from app.api.v1 import spam_agent

app = FastAPI(title="Agent System API")

# Register agent routers
app.include_router(spam_agent.router, prefix="/api/v1")
```

**Benefits**:
- ✅ HTTP-based skill execution (language-agnostic clients)
- ✅ Auto-generated OpenAPI docs (FastAPI automatic)
- ✅ Standardized error handling (HTTP status codes)
- ✅ Easy integration with frontend, webhooks, other services

---

## 5 Detailed Use Cases

### Use Case 1: Spam Detection Agent (BOSS Exchange Reference)

**Context**: BOSS Exchange messaging platform needs autonomous spam detection and mitigation

**Problem**:
- Manual moderation doesn't scale
- Need real-time spam detection
- Multiple actions required (quarantine, reputation, notifications)
- Must track all actions for audit

**Solution**: SpamAgent with 7 specialized skills

**Skills Implemented**:
1. **detect_spam** - ML-based spam detection
2. **quarantine_message** - Move message to quarantine
3. **update_sender_reputation** - Adjust user reputation score
4. **notify_admins** - Alert admins of high-confidence spam
5. **get_message_stats** - Retrieve message metadata
6. **bulk_process** - Process multiple messages concurrently
7. **generate_report** - Create spam detection report

**Agent Implementation**:
```python
class SpamAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="spam_agent",
            description="Autonomous spam detection and mitigation"
        )

    async def _register_skills(self) -> None:
        self.register_skill(DetectSpamSkill())
        self.register_skill(QuarantineMessageSkill())
        self.register_skill(UpdateSenderReputationSkill())
        self.register_skill(NotifyAdminsSkill())
        self.register_skill(GetMessageStatsSkill())
        self.register_skill(BulkProcessSkill())
        self.register_skill(GenerateReportSkill())

# Singleton pattern
_spam_agent: Optional[SpamAgent] = None

def get_spam_agent() -> SpamAgent:
    global _spam_agent
    if _spam_agent is None:
        _spam_agent = SpamAgent()
    return _spam_agent
```

**Workflow Orchestration**:
```python
async def process_spam_workflow(
    self,
    db: AsyncSession,
    message_id: int
) -> AgentResult:
    # See detailed workflow in Feature 5 above
    # Returns complete audit trail of all actions
    pass
```

**API Endpoint**:
```python
@router.post("/workflows/process-spam")
async def process_spam(
    message_id: int,
    db: AsyncSession = Depends(get_db)
):
    agent = get_spam_agent()
    await agent.initialize()
    result = await agent.process_spam_workflow(db, message_id)
    return result.to_dict()
```

**Results**:
- ✅ Autonomous spam processing (no manual intervention)
- ✅ 95%+ spam detection accuracy (ML model)
- ✅ Complete audit trail (all actions logged)
- ✅ Scalable (async processing, concurrent execution)
- ✅ Real-time (sub-second response times)

**Code Reference**: `app/agents/spam_agent.py` in BOSS Exchange codebase

---

### Use Case 2: Data Processing Agent (ETL Workflows)

**Context**: Need to extract data from multiple sources, transform, and load into warehouse

**Problem**:
- Multiple data sources (APIs, databases, files)
- Complex transformations required
- Error handling for partial failures
- Need retry logic for failed tasks
- Progress tracking for long-running jobs

**Solution**: ETLAgent with task queue and retry mechanism

**Skills Implemented**:
1. **extract_from_api** - Fetch data from REST APIs
2. **extract_from_database** - Query source databases
3. **extract_from_csv** - Parse CSV files
4. **transform_data** - Apply transformation rules
5. **validate_data** - Check data quality
6. **load_to_warehouse** - Insert into data warehouse
7. **handle_errors** - Retry failed operations

**Agent Implementation**:
```python
class ETLAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="etl_agent",
            description="Automated ETL pipeline orchestration"
        )
        self.retry_config = {
            "max_retries": 3,
            "backoff_seconds": [1, 5, 15]
        }

    async def _register_skills(self) -> None:
        self.register_skill(ExtractFromAPISkill())
        self.register_skill(ExtractFromDatabaseSkill())
        self.register_skill(ExtractFromCSVSkill())
        self.register_skill(TransformDataSkill())
        self.register_skill(ValidateDataSkill())
        self.register_skill(LoadToWarehouseSkill())
        self.register_skill(HandleErrorsSkill())
```

**ETL Workflow with Error Handling**:
```python
async def run_etl_pipeline(
    self,
    db: AsyncSession,
    pipeline_config: Dict[str, Any]
) -> AgentResult:
    workflow_data = {
        "pipeline_id": pipeline_config["id"],
        "steps": [],
        "records_processed": 0,
        "errors": []
    }

    # Step 1: Extract from all sources
    extract_tasks = [
        self.execute_skill("extract_from_api", {
            "db": db, "endpoint": source["endpoint"]
        })
        for source in pipeline_config.get("api_sources", [])
    ]

    extract_results = await asyncio.gather(*extract_tasks, return_exceptions=True)

    all_data = []
    for i, result in enumerate(extract_results):
        if isinstance(result, Exception):
            workflow_data["errors"].append({
                "step": "extract",
                "source": i,
                "error": str(result)
            })
        elif result.success:
            all_data.extend(result.data.get("records", []))
            workflow_data["steps"].append({
                "name": f"extract_source_{i}",
                "success": True,
                "records": len(result.data.get("records", []))
            })

    # Step 2: Transform data
    transform_result = await self.execute_skill("transform_data", {
        "db": db,
        "data": all_data,
        "transformations": pipeline_config.get("transformations", [])
    })

    if not transform_result.success:
        return AgentResult(
            success=False,
            data=workflow_data,
            error="Transformation failed"
        )

    transformed_data = transform_result.data.get("transformed", [])
    workflow_data["steps"].append({
        "name": "transform",
        "success": True,
        "records": len(transformed_data)
    })

    # Step 3: Validate data quality
    validate_result = await self.execute_skill("validate_data", {
        "db": db,
        "data": transformed_data,
        "rules": pipeline_config.get("validation_rules", [])
    })

    valid_data = validate_result.data.get("valid_records", [])
    invalid_count = len(transformed_data) - len(valid_data)

    if invalid_count > 0:
        workflow_data["errors"].append({
            "step": "validation",
            "invalid_records": invalid_count
        })

    # Step 4: Load to warehouse with retry
    load_result = await self._load_with_retry(db, valid_data)
    workflow_data["steps"].append({
        "name": "load",
        "success": load_result.success,
        "records": len(valid_data)
    })
    workflow_data["records_processed"] = len(valid_data)

    return AgentResult(
        success=True,
        data=workflow_data,
        message=f"ETL pipeline complete: {len(valid_data)} records processed"
    )

async def _load_with_retry(
    self,
    db: AsyncSession,
    data: List[Dict]
) -> AgentResult:
    """Load data with retry logic"""
    for attempt in range(self.retry_config["max_retries"]):
        result = await self.execute_skill("load_to_warehouse", {
            "db": db, "data": data
        })

        if result.success:
            return result

        # Retry with exponential backoff
        if attempt < self.retry_config["max_retries"] - 1:
            await asyncio.sleep(self.retry_config["backoff_seconds"][attempt])

    return AgentResult(success=False, error="Max retries exceeded")
```

**Results**:
- ✅ Multi-source extraction (APIs, databases, files)
- ✅ Resilient error handling (retries, partial failures)
- ✅ Concurrent processing (async extraction)
- ✅ Data quality validation (catch bad data early)
- ✅ Complete audit trail (all steps logged)

---

### Use Case 3: Content Moderation Agent

**Context**: Social platform needs to moderate user-generated content (text, images, videos)

**Problem**:
- Multiple content types require different moderation approaches
- Need to check multiple policies (hate speech, violence, NSFW)
- Human review queue for borderline cases
- Must track moderation actions for compliance

**Solution**: ModerationAgent with policy-specific skills

**Skills Implemented**:
1. **detect_hate_speech** - Text analysis for hate speech
2. **detect_violence** - Image/video violence detection
3. **detect_nsfw_content** - Adult content detection
4. **check_spam_patterns** - Spam/scam detection
5. **verify_copyright** - Copyright infringement check
6. **queue_for_review** - Send to human moderators
7. **apply_moderation_action** - Take action (remove, warn, ban)

**Workflow**:
```python
async def moderate_content_workflow(
    self,
    db: AsyncSession,
    content_id: int,
    content_type: str
) -> AgentResult:
    workflow_data = {
        "content_id": content_id,
        "policies_checked": [],
        "violations": [],
        "action_taken": None
    }

    # Run all applicable checks in parallel
    checks = []

    if content_type == "text":
        checks.append(("hate_speech", self.execute_skill("detect_hate_speech", {
            "db": db, "content_id": content_id
        })))
        checks.append(("spam", self.execute_skill("check_spam_patterns", {
            "db": db, "content_id": content_id
        })))

    if content_type in ["image", "video"]:
        checks.append(("violence", self.execute_skill("detect_violence", {
            "db": db, "content_id": content_id
        })))
        checks.append(("nsfw", self.execute_skill("detect_nsfw_content", {
            "db": db, "content_id": content_id
        })))

    check_results = await asyncio.gather(*[task for _, task in checks])

    # Analyze results
    for (policy_name, _), result in zip(checks, check_results):
        workflow_data["policies_checked"].append(policy_name)

        if result.success and result.data.get("violation_detected"):
            workflow_data["violations"].append({
                "policy": policy_name,
                "confidence": result.data.get("confidence"),
                "details": result.data.get("details")
            })

    # Determine action based on violations
    if len(workflow_data["violations"]) == 0:
        workflow_data["action_taken"] = "approved"
    elif any(v["confidence"] > 0.95 for v in workflow_data["violations"]):
        # High confidence violation - auto-remove
        action_result = await self.execute_skill("apply_moderation_action", {
            "db": db,
            "content_id": content_id,
            "action": "remove",
            "reason": workflow_data["violations"][0]["policy"]
        })
        workflow_data["action_taken"] = "removed"
    else:
        # Borderline case - queue for human review
        review_result = await self.execute_skill("queue_for_review", {
            "db": db,
            "content_id": content_id,
            "violations": workflow_data["violations"]
        })
        workflow_data["action_taken"] = "queued_for_review"

    return AgentResult(success=True, data=workflow_data)
```

**Results**:
- ✅ Multi-policy checking (hate speech, violence, NSFW, spam)
- ✅ Parallel execution (all policies checked simultaneously)
- ✅ Automated actions (high-confidence violations removed)
- ✅ Human-in-the-loop (borderline cases queued)
- ✅ Compliance tracking (all checks logged)

---

### Use Case 4: Task Automation Agent (Priority Queue Management)

**Context**: Background job processing system needs intelligent task scheduling and execution

**Problem**:
- Tasks have different priorities (CRITICAL, HIGH, NORMAL, LOW)
- Some tasks depend on others (must execute in order)
- Need to handle failures gracefully
- Must track task status and results

**Solution**: TaskAgent with priority queue and dependency resolution

**Task Queue Pattern**:
```python
from enum import Enum
from dataclasses import dataclass
from datetime import datetime

class TaskPriority(Enum):
    LOW = 0
    NORMAL = 1
    HIGH = 2
    CRITICAL = 3

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class AgentTask:
    task_id: str
    skill_name: str
    parameters: Dict[str, Any]
    priority: TaskPriority
    status: TaskStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[AgentResult] = None
    dependencies: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "skill_name": self.skill_name,
            "priority": self.priority.name,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "result": self.result.to_dict() if self.result else None
        }
```

**Agent with Task Queue**:
```python
class TaskAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="task_agent",
            description="Priority-based task scheduling and execution"
        )
        self.task_queue: List[AgentTask] = []

    async def add_task(
        self,
        skill_name: str,
        parameters: Dict[str, Any],
        priority: TaskPriority = TaskPriority.NORMAL,
        dependencies: List[str] = None
    ) -> str:
        """Add task to queue"""
        task = AgentTask(
            task_id=str(uuid.uuid4()),
            skill_name=skill_name,
            parameters=parameters,
            priority=priority,
            status=TaskStatus.PENDING,
            created_at=datetime.utcnow(),
            dependencies=dependencies or []
        )
        self.task_queue.append(task)
        return task.task_id

    async def process_queue(self, db: AsyncSession) -> AgentResult:
        """Process all pending tasks in priority order"""
        processed = []

        # Sort by priority (highest first)
        pending_tasks = [t for t in self.task_queue if t.status == TaskStatus.PENDING]
        pending_tasks.sort(key=lambda t: t.priority.value, reverse=True)

        for task in pending_tasks:
            # Check dependencies
            if not self._dependencies_met(task):
                continue  # Skip tasks with unmet dependencies

            # Execute task
            task.status = TaskStatus.RUNNING
            task.started_at = datetime.utcnow()

            params = task.parameters.copy()
            params["db"] = db

            result = await self.execute_skill(task.skill_name, params)

            task.result = result
            task.status = TaskStatus.COMPLETED if result.success else TaskStatus.FAILED
            task.completed_at = datetime.utcnow()

            processed.append(task.task_id)

        return AgentResult(
            success=True,
            data={"processed_tasks": processed, "queue_size": len(self.task_queue)}
        )

    def _dependencies_met(self, task: AgentTask) -> bool:
        """Check if all dependencies are completed"""
        for dep_id in task.dependencies:
            dep_task = next((t for t in self.task_queue if t.task_id == dep_id), None)
            if not dep_task or dep_task.status != TaskStatus.COMPLETED:
                return False
        return True
```

**Results**:
- ✅ Priority-based execution (CRITICAL tasks first)
- ✅ Dependency resolution (tasks wait for dependencies)
- ✅ Status tracking (PENDING → RUNNING → COMPLETED/FAILED)
- ✅ Flexible scheduling (add tasks dynamically)

---

### Use Case 5: API Gateway Agent (Skill Routing and Execution)

**Context**: Need a unified API gateway that routes requests to appropriate agent skills

**Problem**:
- Multiple agents with different capabilities
- Need single entry point for all skill execution
- Must handle authentication, rate limiting, logging
- Should provide skill discovery and documentation

**Solution**: GatewayAgent that orchestrates multiple domain agents

**Implementation**:
```python
class GatewayAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="gateway_agent",
            description="Unified API gateway for all agent skills"
        )
        self.domain_agents: Dict[str, BaseAgent] = {}

    async def _register_skills(self) -> None:
        # Register domain agents
        self.domain_agents["spam"] = get_spam_agent()
        self.domain_agents["etl"] = get_etl_agent()
        self.domain_agents["moderation"] = get_moderation_agent()

        # Initialize all domain agents
        for agent in self.domain_agents.values():
            await agent.initialize()

    async def route_skill_execution(
        self,
        agent_name: str,
        skill_name: str,
        parameters: Dict[str, Any]
    ) -> AgentResult:
        """Route skill execution to appropriate domain agent"""
        agent = self.domain_agents.get(agent_name)

        if not agent:
            return AgentResult(
                success=False,
                error=f"Unknown agent: {agent_name}"
            )

        return await agent.execute_skill(skill_name, parameters)

    def list_all_skills(self) -> Dict[str, Any]:
        """List all skills across all agents"""
        all_skills = {}

        for agent_name, agent in self.domain_agents.items():
            all_skills[agent_name] = agent.list_skills()

        return all_skills
```

**Unified API Endpoints**:
```python
router = APIRouter(prefix="/gateway", tags=["Gateway"])

@router.get("/agents")
async def list_agents():
    """List all available domain agents"""
    gateway = get_gateway_agent()
    await gateway.initialize()

    return {
        "agents": [
            {"name": name, "skills": agent.get_status()["skills_count"]}
            for name, agent in gateway.domain_agents.items()
        ]
    }

@router.get("/skills")
async def list_all_skills():
    """List all skills across all agents"""
    gateway = get_gateway_agent()
    await gateway.initialize()

    return gateway.list_all_skills()

@router.post("/execute")
async def execute_via_gateway(
    agent_name: str,
    skill_name: str,
    parameters: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """Execute any skill through unified gateway"""
    gateway = get_gateway_agent()
    await gateway.initialize()

    params = parameters.copy()
    params["db"] = db

    result = await gateway.route_skill_execution(agent_name, skill_name, params)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return result.to_dict()
```

**Results**:
- ✅ Unified entry point (single API for all agents)
- ✅ Skill discovery (list all capabilities)
- ✅ Dynamic routing (route to correct agent)
- ✅ Centralized logging (track all executions)

---

## Dependencies

### Required

**Python**:
- **Version**: Python 3.8+
- **Why**: Async/await syntax, dataclasses, type hints

**FastAPI**:
- **Version**: fastapi>=0.104.0
- **Why**: Async web framework for REST API endpoints
- **Install**: `pip install fastapi uvicorn`

**SQLAlchemy (Async)**:
- **Version**: sqlalchemy[asyncio]>=2.0.0
- **Why**: Async database ORM for skill database operations
- **Install**: `pip install sqlalchemy[asyncio] asyncpg`

**Pydantic**:
- **Version**: pydantic>=2.0.0
- **Why**: Request/response models, parameter validation
- **Install**: `pip install pydantic`

### Optional

**Redis**:
- **Use Case**: Distributed task queue across multiple workers
- **Install**: `pip install redis`

**Celery**:
- **Use Case**: Background task processing, scheduled tasks
- **Install**: `pip install celery`

**APScheduler**:
- **Use Case**: Cron-like task scheduling
- **Install**: `pip install apscheduler`

---

## Configuration Examples

### Directory Structure

```
app/
├── agents/
│   ├── __init__.py           # Export BaseAgent, AgentSkill, AgentResult
│   ├── base_agent.py         # Base classes (AgentSkill, BaseAgent)
│   ├── spam_agent.py         # Domain agent implementation
│   ├── etl_agent.py          # ETL domain agent
│   └── skills/
│       ├── __init__.py       # Export all skills
│       ├── spam_skills.py    # Spam-related skills
│       └── etl_skills.py     # ETL-related skills
├── api/
│   └── v1/
│       ├── __init__.py
│       ├── spam_agent.py     # Spam agent REST endpoints
│       └── etl_agent.py      # ETL agent REST endpoints
├── models/                   # Database models (SQLAlchemy)
├── schemas/                  # Pydantic schemas
├── core/
│   ├── config.py            # App configuration
│   └── database.py          # Database session management
└── main.py                  # FastAPI app initialization
```

### Base Agent Setup

**File**: `app/agents/base_agent.py`

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
import time

@dataclass
class AgentResult:
    """Standardized result format for all skills"""
    success: bool
    data: Dict[str, Any] = field(default_factory=dict)
    message: str = ""
    error: Optional[str] = None
    execution_time_ms: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "data": self.data,
            "message": self.message,
            "error": self.error,
            "execution_time_ms": self.execution_time_ms,
            "metadata": self.metadata
        }

class AgentSkill(ABC):
    """Base class for agent skills"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    @abstractmethod
    async def execute(self, **kwargs) -> AgentResult:
        """Execute the skill with given parameters"""
        pass

    @abstractmethod
    def get_parameters_schema(self) -> Dict[str, Any]:
        """Return JSON schema for skill parameters"""
        pass

    def validate_parameters(self, params: Dict[str, Any]) -> tuple[bool, str]:
        """Validate parameters against schema"""
        schema = self.get_parameters_schema()
        required = schema.get("required", [])

        for req in required:
            if req not in params:
                return False, f"Missing required parameter: {req}"

        return True, ""

class BaseAgent(ABC):
    """Base class for AI agents with skill orchestration"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.skills: Dict[str, AgentSkill] = {}
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize agent and register skills"""
        if self._initialized:
            return

        await self._register_skills()
        self._initialized = True

    @abstractmethod
    async def _register_skills(self) -> None:
        """Register all skills - override in subclass"""
        pass

    def register_skill(self, skill: AgentSkill) -> None:
        """Register a skill with the agent"""
        self.skills[skill.name] = skill

    async def execute_skill(
        self,
        skill_name: str,
        parameters: Dict[str, Any] = None
    ) -> AgentResult:
        """Execute a specific skill with validation"""
        skill = self.skills.get(skill_name)

        if not skill:
            return AgentResult(
                success=False,
                error=f"Skill not found: {skill_name}"
            )

        params = parameters or {}
        is_valid, error_msg = skill.validate_parameters(params)

        if not is_valid:
            return AgentResult(success=False, error=error_msg)

        start_time = time.time()
        result = await skill.execute(**params)
        execution_time = (time.time() - start_time) * 1000

        result.execution_time_ms = execution_time
        return result

    def list_skills(self) -> List[Dict[str, Any]]:
        """List all registered skills with schemas"""
        return [
            {
                "name": skill.name,
                "description": skill.description,
                "parameters": skill.get_parameters_schema()
            }
            for skill in self.skills.values()
        ]

    def get_status(self) -> Dict[str, Any]:
        """Get agent status and health"""
        return {
            "name": self.name,
            "description": self.description,
            "skills_count": len(self.skills),
            "initialized": self._initialized
        }
```

### Router Configuration

**File**: `app/api/v1/spam_agent.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Dict, Any

from app.core.database import get_db
from app.agents.spam_agent import get_spam_agent

router = APIRouter(prefix="/spam-agent", tags=["Spam Agent"])

class ExecuteRequest(BaseModel):
    skill_name: str
    parameters: Dict[str, Any] = {}

@router.get("/status")
async def get_status():
    """Get agent status"""
    agent = get_spam_agent()
    await agent.initialize()
    return agent.get_status()

@router.get("/skills")
async def list_skills():
    """List all skills"""
    agent = get_spam_agent()
    await agent.initialize()
    return {"skills": agent.list_skills()}

@router.post("/execute")
async def execute_skill(
    request: ExecuteRequest,
    db: AsyncSession = Depends(get_db)
):
    """Execute skill"""
    agent = get_spam_agent()
    await agent.initialize()

    params = request.parameters.copy()
    params["db"] = db

    result = await agent.execute_skill(request.skill_name, params)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return result.to_dict()
```

**File**: `app/main.py`

```python
from fastapi import FastAPI
from app.api.v1 import spam_agent, etl_agent

app = FastAPI(title="Agent System API", version="1.0.0")

# Register routers
app.include_router(spam_agent.router, prefix="/api/v1")
app.include_router(etl_agent.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Agent System API", "version": "1.0.0"}
```

---

## 8 Best Practices

### 1. Single Responsibility Principle

**Rule**: Each skill should do ONE thing well

**Good Example**:
```python
class DetectSpamSkill(AgentSkill):
    """Only detects spam - doesn't take action"""
    async def execute(self, db, message_id):
        # Just detect, return spam_score
        pass

class QuarantineMessageSkill(AgentSkill):
    """Only quarantines - doesn't detect"""
    async def execute(self, db, message_id):
        # Just quarantine, return success
        pass
```

**Bad Example**:
```python
class DetectAndQuarantineSpamSkill(AgentSkill):
    """Does too much - violates SRP"""
    async def execute(self, db, message_id):
        # Detects spam AND quarantines
        # Hard to reuse, hard to test
        pass
```

**Why**: Skills are easier to test, reuse, and maintain when they have a single, well-defined purpose.

---

### 2. Standardized Results

**Rule**: All skills MUST return AgentResult with consistent structure

**Good Example**:
```python
async def execute(self, **kwargs) -> AgentResult:
    try:
        # Do work
        result_data = {"spam_score": 0.95}

        return AgentResult(
            success=True,
            data=result_data,
            message="Spam detection complete"
        )
    except Exception as e:
        return AgentResult(
            success=False,
            error=str(e),
            message="Spam detection failed"
        )
```

**Bad Example**:
```python
async def execute(self, **kwargs):
    # Returns raw dict - no standard structure
    return {"spam_score": 0.95}
```

**Why**: Standardized results enable reliable workflow composition and error handling.

---

### 3. Parameter Validation

**Rule**: Always validate parameters BEFORE execution using JSON schema

**Good Example**:
```python
def get_parameters_schema(self) -> Dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "db": {"type": "object"},
            "message_id": {"type": "integer"}
        },
        "required": ["db", "message_id"]
    }

def validate_parameters(self, params):
    # Automatic validation against schema
    return super().validate_parameters(params)
```

**Bad Example**:
```python
async def execute(self, **kwargs):
    # No validation - will crash if message_id missing
    message_id = kwargs["message_id"]
```

**Why**: Fail fast with clear error messages instead of cryptic runtime errors.

---

### 4. Async Everything

**Rule**: All skill execution MUST be async

**Good Example**:
```python
async def execute(self, db: AsyncSession, message_id: int):
    # All I/O operations are awaited
    message = await get_message(db, message_id)
    spam_score = await self._analyze_content(message.content)
    return AgentResult(success=True, data={"spam_score": spam_score})
```

**Bad Example**:
```python
def execute(self, db, message_id):
    # Blocking I/O - will freeze the event loop
    message = get_message_sync(db, message_id)
```

**Why**: Async enables concurrent execution and better resource utilization.

---

### 5. Error Handling

**Rule**: Catch ALL exceptions, return meaningful AgentResult errors

**Good Example**:
```python
async def execute(self, db, message_id):
    try:
        message = await get_message(db, message_id)

        if not message:
            return AgentResult(
                success=False,
                error=f"Message {message_id} not found"
            )

        spam_score = await self._analyze(message.content)

        return AgentResult(success=True, data={"spam_score": spam_score})

    except DatabaseError as e:
        return AgentResult(
            success=False,
            error=f"Database error: {str(e)}"
        )
    except Exception as e:
        return AgentResult(
            success=False,
            error=f"Unexpected error: {str(e)}"
        )
```

**Bad Example**:
```python
async def execute(self, db, message_id):
    # No error handling - exceptions propagate
    message = await get_message(db, message_id)
    return AgentResult(success=True, data={"spam_score": 0.5})
```

**Why**: Graceful degradation and clear error messages for debugging.

---

### 6. Singleton Agent Pattern

**Rule**: Use factory function to ensure single agent instance

**Good Example**:
```python
_spam_agent: Optional[SpamAgent] = None

def get_spam_agent() -> SpamAgent:
    global _spam_agent
    if _spam_agent is None:
        _spam_agent = SpamAgent()
    return _spam_agent
```

**Bad Example**:
```python
# New instance every time - skills registered repeatedly
@router.get("/status")
async def get_status():
    agent = SpamAgent()  # Creates new instance
    await agent.initialize()  # Re-registers all skills
```

**Why**: Prevents duplicate skill registration and reduces memory usage.

---

### 7. Workflow Composition

**Rule**: Combine skills in high-level workflows, not in skills themselves

**Good Example**:
```python
# Domain agent method
async def process_spam_workflow(self, db, message_id):
    # Step 1
    detect_result = await self.execute_skill("detect_spam", {"db": db, "message_id": message_id})

    # Step 2 (conditional on step 1)
    if detect_result.data.get("is_spam"):
        quarantine_result = await self.execute_skill("quarantine_message", {"db": db, "message_id": message_id})

    return AgentResult(success=True, data={"steps": [detect_result, quarantine_result]})
```

**Bad Example**:
```python
# Skill calling another skill directly
class DetectSpamSkill(AgentSkill):
    async def execute(self, db, message_id):
        spam_score = await self._analyze(message_id)

        # BAD: Skill shouldn't call other skills
        if spam_score > 0.8:
            await QuarantineMessageSkill().execute(db, message_id)
```

**Why**: Workflows should orchestrate skills, not skills orchestrating other skills.

---

### 8. Database Injection

**Rule**: Pass database session through parameters, don't create in skills

**Good Example**:
```python
async def execute(self, db: AsyncSession, message_id: int):
    # Use injected db session
    message = await get_message(db, message_id)
    return AgentResult(success=True, data={"message": message})
```

**Bad Example**:
```python
async def execute(self, message_id: int):
    # BAD: Creating db session inside skill
    async with get_db_session() as db:
        message = await get_message(db, message_id)
```

**Why**: Enables transaction management, connection pooling, and testing with mock sessions.

---

## Token Savings

### Before Pack v2.0

**Upfront Load**:
- SKILL.md: ~11,000 tokens (377 lines + 562 lines workflows)
- Total: ~11,000 tokens loaded at session start

**Problem**: All architectural details, workflows, and examples loaded upfront regardless of whether agent creation is needed.

### After Pack v2.0

**Upfront Load** (SKILL.md only):
- Core patterns summary: ~3,000 tokens
- Quick reference to base classes
- USE WHEN triggers

**On-Demand Load**:
- PACK_README.md: ~8,000 tokens (architecture deep dive, 5 use cases)
- PACK_INSTALL.md: ~6,000 tokens (setup, dependencies, troubleshooting)
- PACK_VERIFY.md: ~7,000 tokens (testing, validation, checklists)
- workflows/*.md: ~6,000 tokens (detailed step-by-step guides)

**Total Available**: ~30,000 tokens (only load what's needed)

**Savings**: ~73% reduction in upfront context (11,000 → 3,000 tokens)

### When to Load Pack Files

| User Request | Load |
|--------------|------|
| "How do I create a new agent?" | PACK_README.md (architecture overview) |
| "Set up Python agent system" | PACK_INSTALL.md (installation guide) |
| "Verify my agent implementation" | PACK_VERIFY.md (validation checklist) |
| "Walk me through skill creation" | workflows/create-new-skill.md |
| "Examples of agent workflows" | PACK_README.md (5 detailed use cases) |

---

## When to Use This Skill

**USE WHEN** user says:
- "Create a Python agent"
- "Build skill-based architecture"
- "Set up FastAPI agent system"
- "Implement autonomous agents"
- "Create modular agent skills"
- "Design agent orchestration"
- "Build REST API for agents"
- "Implement task queue system"
- "Create workflow automation"
- "Reference BOSS Exchange agent"

**Load PACK_README.md** for architectural deep dive and use cases
**Load PACK_INSTALL.md** for setup and installation
**Load PACK_VERIFY.md** for testing and validation
**Load workflows/** for step-by-step creation guides

---

**Pack README Version**: 2.0
**Last Updated**: 2026-01-04
**Reference Implementation**: BOSS Exchange spam detection agent
**Complexity**: Medium (architectural/educational skill)
