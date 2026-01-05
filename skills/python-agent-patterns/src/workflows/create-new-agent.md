# Create New Agent Workflow

## Overview

Complete process for creating a new domain-specific agent with skills.

## Directory Setup

```bash
mkdir -p app/agents/skills
touch app/agents/__init__.py
touch app/agents/skills/__init__.py
```

## Step 1: Create Base Agent (If Not Exists)

Copy base classes to `app/agents/base_agent.py`:

```python
"""
Base Agent Framework
Provides foundational classes for building AI agents with skills.
"""
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from uuid import UUID, uuid4


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class AgentResult:
    """Result of an agent task or skill execution"""
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


@dataclass
class AgentTask:
    """A task for an agent to execute"""
    id: UUID = field(default_factory=uuid4)
    name: str = ""
    skill_name: str = ""
    parameters: Dict[str, Any] = field(default_factory=dict)
    priority: TaskPriority = TaskPriority.NORMAL
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    result: Optional[AgentResult] = None


class AgentSkill(ABC):
    """Base class for agent skills"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.logger = logging.getLogger(f"{__name__}.{name}")

    @abstractmethod
    async def execute(self, **kwargs) -> AgentResult:
        pass

    @abstractmethod
    def get_parameters_schema(self) -> Dict[str, Any]:
        pass

    def validate_parameters(self, params: Dict[str, Any]) -> tuple[bool, str]:
        schema = self.get_parameters_schema()
        required = schema.get("required", [])
        for req in required:
            if req not in params:
                return False, f"Missing required parameter: {req}"
        return True, ""


class BaseAgent(ABC):
    """Base class for AI agents"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.skills: Dict[str, AgentSkill] = {}
        self.task_queue: List[AgentTask] = []
        self.completed_tasks: List[AgentTask] = []
        self.logger = logging.getLogger(f"{__name__}.{name}")
        self._initialized = False

    async def initialize(self) -> None:
        if self._initialized:
            return
        await self._register_skills()
        self._initialized = True

    @abstractmethod
    async def _register_skills(self) -> None:
        pass

    def register_skill(self, skill: AgentSkill) -> None:
        self.skills[skill.name] = skill

    def list_skills(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": skill.name,
                "description": skill.description,
                "parameters": skill.get_parameters_schema()
            }
            for skill in self.skills.values()
        ]

    async def execute_skill(
        self,
        skill_name: str,
        parameters: Dict[str, Any] = None
    ) -> AgentResult:
        if not self._initialized:
            await self.initialize()

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

        start_time = datetime.now(timezone.utc)
        try:
            result = await skill.execute(**params)
            execution_time = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
            result.execution_time_ms = execution_time
            return result
        except Exception as e:
            return AgentResult(success=False, error=str(e))

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "initialized": self._initialized,
            "skills_count": len(self.skills),
            "skills": list(self.skills.keys()),
            "queued_tasks": len(self.task_queue),
            "completed_tasks": len(self.completed_tasks)
        }
```

## Step 2: Create Domain Skills

Create `app/agents/skills/{domain}_skills.py`:

```python
"""
{Domain} Agent Skills
Specialized skills for {domain} management.
"""
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base_agent import AgentSkill, AgentResult


class FirstSkill(AgentSkill):
    def __init__(self):
        super().__init__(
            name="first_skill",
            description="Description of first skill"
        )

    def get_parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "db": {"type": "object"},
                "param1": {"type": "string"}
            },
            "required": ["db", "param1"]
        }

    async def execute(self, db: AsyncSession, param1: str) -> AgentResult:
        try:
            # Skill logic
            return AgentResult(success=True, data={"result": param1})
        except Exception as e:
            return AgentResult(success=False, error=str(e))


class SecondSkill(AgentSkill):
    # ... similar pattern
    pass
```

## Step 3: Create Domain Agent

Create `app/agents/{domain}_agent.py`:

```python
"""
{Domain} Agent
Autonomous agent for {domain} management.
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base_agent import BaseAgent, AgentResult
from app.agents.skills.{domain}_skills import FirstSkill, SecondSkill


class {Domain}Agent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="{domain}_agent",
            description="Autonomous agent for {domain} management"
        )

    async def _register_skills(self) -> None:
        self.register_skill(FirstSkill())
        self.register_skill(SecondSkill())

    async def run_workflow(
        self,
        db: AsyncSession,
        param: str
    ) -> AgentResult:
        """High-level workflow combining skills"""
        results = {"steps": []}

        # Step 1
        step1 = await self.execute_skill("first_skill", {
            "db": db, "param1": param
        })
        results["steps"].append({"name": "step1", "success": step1.success})

        if not step1.success:
            return AgentResult(success=False, data=results, error=step1.error)

        # Step 2
        step2 = await self.execute_skill("second_skill", {
            "db": db, "data": step1.data
        })
        results["steps"].append({"name": "step2", "success": step2.success})

        return AgentResult(success=True, data=results)


# Singleton
_agent: Optional[{Domain}Agent] = None


def get_{domain}_agent() -> {Domain}Agent:
    global _agent
    if _agent is None:
        _agent = {Domain}Agent()
    return _agent
```

## Step 4: Create API Router

Create `app/api/v1/{domain}_agent.py`:

```python
"""
{Domain} Agent API Endpoints
REST API for interacting with the {Domain} Agent.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.agents.{domain}_agent import get_{domain}_agent

router = APIRouter(prefix="/{domain}-agent", tags=["{Domain} Agent"])


class ExecuteRequest(BaseModel):
    skill_name: str = Field(..., description="Skill to execute")
    parameters: dict = Field(default_factory=dict)


@router.get("/status")
async def get_status():
    agent = get_{domain}_agent()
    await agent.initialize()
    return agent.get_status()


@router.get("/skills")
async def list_skills():
    agent = get_{domain}_agent()
    await agent.initialize()
    return {"skills": agent.list_skills()}


@router.post("/execute")
async def execute_skill(
    request: ExecuteRequest,
    db: AsyncSession = Depends(get_db)
):
    agent = get_{domain}_agent()
    await agent.initialize()

    params = request.parameters.copy()
    params["db"] = db

    result = await agent.execute_skill(request.skill_name, params)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)
    return result.to_dict()
```

## Step 5: Register Router

Update `app/main.py`:

```python
from app.api.v1 import {domain}_agent

app.include_router(
    {domain}_agent.router,
    prefix="/api/v1",
    tags=["{Domain} Agent"]
)
```

## Step 6: Update Module Exports

Update `app/agents/__init__.py`:

```python
from app.agents.base_agent import BaseAgent, AgentSkill, AgentTask, AgentResult
from app.agents.{domain}_agent import {Domain}Agent, get_{domain}_agent

__all__ = [
    "BaseAgent", "AgentSkill", "AgentTask", "AgentResult",
    "{Domain}Agent", "get_{domain}_agent"
]
```

Update `app/agents/skills/__init__.py`:

```python
from app.agents.skills.{domain}_skills import FirstSkill, SecondSkill

__all__ = ["FirstSkill", "SecondSkill"]
```

## Step 7: Test

```bash
# Rebuild container (if Docker)
docker-compose build && docker-compose up -d

# Test endpoints
curl http://localhost:8000/api/v1/{domain}-agent/status
curl http://localhost:8000/api/v1/{domain}-agent/skills
```

## Checklist

- [ ] Base agent classes in `app/agents/base_agent.py`
- [ ] Domain skills in `app/agents/skills/{domain}_skills.py`
- [ ] Domain agent in `app/agents/{domain}_agent.py`
- [ ] API router in `app/api/v1/{domain}_agent.py`
- [ ] Router registered in `app/main.py`
- [ ] Module exports updated
- [ ] `/status` endpoint returns agent info
- [ ] `/skills` endpoint lists all skills
- [ ] `/execute` endpoint runs skills successfully
