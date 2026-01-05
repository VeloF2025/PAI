---
name: python-agent-patterns
description: Python Agent/Skills architecture patterns for FastAPI backends. Use when building autonomous agents with modular skills, task queuing, and REST APIs. Patterns derived from BOSS Exchange spam agent implementation.
---

# Python Agent Architecture Patterns

## When to Activate This Skill

- Building an autonomous agent system in Python/FastAPI
- Creating modular skills for agent capabilities
- Designing REST APIs for agent interaction
- Implementing task queues with priority
- Building workflow orchestration with multiple skills
- "Create an agent for X"
- "Build skills architecture"
- "Agent pattern in FastAPI"

## Core Architecture Pattern

### Directory Structure

```
app/
├── agents/
│   ├── __init__.py           # Export BaseAgent, AgentSkill, etc.
│   ├── base_agent.py         # Base classes (AgentSkill, BaseAgent)
│   ├── spam_agent.py         # Concrete agent implementation
│   └── skills/
│       ├── __init__.py       # Export all skills
│       └── spam_skills.py    # Domain-specific skills
├── api/
│   └── v1/
│       └── spam_agent.py     # REST API endpoints
└── main.py                   # Router registration
```

## Key Components

### 1. AgentSkill Base Class

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, Any, Optional

@dataclass
class AgentResult:
    """Standardized result from skill execution"""
    success: bool
    data: Dict[str, Any] = field(default_factory=dict)
    message: str = ""
    error: Optional[str] = None
    execution_time_ms: float = 0
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
```

### 2. BaseAgent Class

```python
class BaseAgent(ABC):
    """Base class for AI agents with skill orchestration"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.skills: Dict[str, AgentSkill] = {}
        self.task_queue: List[AgentTask] = []
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

        return await skill.execute(**params)
```

### 3. Concrete Skill Implementation

```python
class AnalyzeDataSkill(AgentSkill):
    """Example concrete skill implementation"""

    def __init__(self):
        super().__init__(
            name="analyze_data",
            description="Analyze data and return insights"
        )

    def get_parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "db": {"type": "object", "description": "Database session"},
                "data_id": {"type": "string", "description": "Data identifier"},
                "options": {"type": "object", "default": {}}
            },
            "required": ["db", "data_id"]
        }

    async def execute(self, db, data_id: str, options: dict = None) -> AgentResult:
        try:
            # Skill logic here
            result = await self._analyze(db, data_id, options or {})
            return AgentResult(
                success=True,
                data=result,
                message=f"Analysis complete for {data_id}"
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
                message="Analysis failed"
            )
```

### 4. Concrete Agent with Workflows

```python
class DataAgent(BaseAgent):
    """Agent with skills and high-level workflows"""

    def __init__(self):
        super().__init__(
            name="data_agent",
            description="Autonomous data processing agent"
        )

    async def _register_skills(self) -> None:
        """Register all domain skills"""
        self.register_skill(AnalyzeDataSkill())
        self.register_skill(ProcessDataSkill())
        self.register_skill(ExportDataSkill())

    async def run_full_workflow(
        self,
        db: AsyncSession,
        data_id: str,
        auto_export: bool = False
    ) -> AgentResult:
        """High-level workflow combining multiple skills"""
        workflow_results = {"steps": []}

        # Step 1: Analyze
        analysis = await self.execute_skill("analyze_data", {
            "db": db, "data_id": data_id
        })
        workflow_results["steps"].append({
            "name": "analyze",
            "success": analysis.success,
            "data": analysis.data
        })

        if not analysis.success:
            return AgentResult(
                success=False,
                data=workflow_results,
                error=analysis.error
            )

        # Step 2: Process
        processed = await self.execute_skill("process_data", {
            "db": db,
            "data_id": data_id,
            "analysis": analysis.data
        })
        workflow_results["steps"].append({
            "name": "process",
            "success": processed.success
        })

        # Step 3: Export (conditional)
        if auto_export and processed.success:
            export = await self.execute_skill("export_data", {
                "db": db, "data_id": data_id
            })
            workflow_results["steps"].append({
                "name": "export",
                "success": export.success
            })

        return AgentResult(
            success=True,
            data=workflow_results,
            message="Workflow completed"
        )


# Singleton pattern for agent instance
_agent: Optional[DataAgent] = None

def get_data_agent() -> DataAgent:
    global _agent
    if _agent is None:
        _agent = DataAgent()
    return _agent
```

### 5. FastAPI Router Pattern

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/data-agent", tags=["Data Agent"])

class ExecuteRequest(BaseModel):
    skill_name: str = Field(..., description="Skill to execute")
    parameters: dict = Field(default_factory=dict)

@router.get("/status")
async def get_status():
    """Get agent status and available skills"""
    agent = get_data_agent()
    await agent.initialize()
    return agent.get_status()

@router.get("/skills")
async def list_skills():
    """List all available skills"""
    agent = get_data_agent()
    await agent.initialize()
    return {"skills": agent.list_skills()}

@router.post("/execute")
async def execute_skill(
    request: ExecuteRequest,
    db: AsyncSession = Depends(get_db)
):
    """Execute any skill by name"""
    agent = get_data_agent()
    await agent.initialize()

    params = request.parameters.copy()
    params["db"] = db

    result = await agent.execute_skill(request.skill_name, params)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)
    return result.to_dict()

@router.post("/workflows/full-analysis")
async def run_workflow(
    data_id: str,
    auto_export: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """Run complete analysis workflow"""
    agent = get_data_agent()
    await agent.initialize()
    result = await agent.run_full_workflow(db, data_id, auto_export)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)
    return result.to_dict()
```

## Task Queue Pattern (Optional)

```python
from enum import Enum
from dataclasses import dataclass
from datetime import datetime

class TaskPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class AgentTask:
    id: UUID
    skill_name: str
    parameters: Dict[str, Any]
    priority: TaskPriority = TaskPriority.NORMAL
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = field(default_factory=datetime.utcnow)
    result: Optional[AgentResult] = None
```

## Best Practices

1. **Single Responsibility**: Each skill does one thing well
2. **Standardized Results**: All skills return `AgentResult`
3. **Parameter Validation**: Use schemas for input validation
4. **Async Everything**: All skill execution is async
5. **Error Handling**: Catch exceptions, return meaningful errors
6. **Singleton Agent**: Use factory function for agent instance
7. **Workflow Composition**: Combine skills in high-level workflows
8. **Database Injection**: Pass db session through parameters

## Reference Implementation

See BOSS Exchange spam agent:
- `app/agents/base_agent.py` - Base classes
- `app/agents/skills/spam_skills.py` - 7 concrete skills
- `app/agents/spam_agent.py` - Agent with workflows
- `app/api/v1/spam_agent.py` - REST API endpoints

## Supplementary Resources

For workflow templates: `read ~/.claude/skills/python-agent-patterns/workflows/`
For full examples: See BOSS Exchange autonomous-coding backend
