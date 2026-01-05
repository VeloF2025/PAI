# Create New Agent Skill Workflow

## Overview

Step-by-step process for creating a new skill in the agent architecture.

## Prerequisites

- Existing agent with `BaseAgent` implementation
- `app/agents/skills/` directory structure
- FastAPI router for agent endpoints

## Steps

### 1. Define Skill Class

Create new skill in `app/agents/skills/{domain}_skills.py`:

```python
from app.agents.base_agent import AgentSkill, AgentResult

class YourNewSkill(AgentSkill):
    """Description of what this skill does"""

    def __init__(self):
        super().__init__(
            name="your_skill_name",  # snake_case, unique
            description="Clear description for API docs"
        )

    def get_parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "db": {"type": "object", "description": "Database session"},
                "required_param": {"type": "string", "description": "Required input"},
                "optional_param": {"type": "integer", "default": 10}
            },
            "required": ["db", "required_param"]
        }

    async def execute(
        self,
        db: AsyncSession,
        required_param: str,
        optional_param: int = 10
    ) -> AgentResult:
        try:
            # Your skill logic here
            result_data = await self._do_work(db, required_param, optional_param)

            return AgentResult(
                success=True,
                data=result_data,
                message=f"Processed {required_param}"
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
                message="Skill execution failed"
            )

    async def _do_work(self, db, param, opt) -> dict:
        """Internal implementation"""
        # Business logic
        return {"result": "data"}
```

### 2. Export from Skills Module

Update `app/agents/skills/__init__.py`:

```python
from app.agents.skills.{domain}_skills import (
    YourNewSkill,
    # ... other skills
)

__all__ = [
    "YourNewSkill",
    # ... other skills
]
```

### 3. Register Skill in Agent

Update your agent's `_register_skills()`:

```python
async def _register_skills(self) -> None:
    self.register_skill(ExistingSkill())
    self.register_skill(YourNewSkill())  # Add this
```

### 4. Add API Endpoint (Optional)

If skill needs dedicated endpoint beyond generic `/execute`:

```python
class YourSkillRequest(BaseModel):
    """Request model for your skill"""
    required_param: str = Field(..., description="Required input")
    optional_param: int = Field(default=10, ge=1, le=100)

@router.post("/your-skill")
async def run_your_skill(
    request: YourSkillRequest,
    db: AsyncSession = Depends(get_db)
):
    """Dedicated endpoint for your skill"""
    agent = get_agent()
    await agent.initialize()

    result = await agent.execute_skill("your_skill_name", {
        "db": db,
        "required_param": request.required_param,
        "optional_param": request.optional_param
    })

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)
    return result.to_dict()
```

### 5. Test the Skill

```bash
# Via generic execute endpoint
curl -X POST http://localhost:8000/api/v1/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"skill_name": "your_skill_name", "parameters": {"required_param": "test"}}'

# Via dedicated endpoint
curl -X POST http://localhost:8000/api/v1/agent/your-skill \
  -H "Content-Type: application/json" \
  -d '{"required_param": "test", "optional_param": 20}'
```

### 6. Verify in Skills List

```bash
curl http://localhost:8000/api/v1/agent/skills | python -m json.tool
```

Should show your new skill with its schema.

## Checklist

- [ ] Skill class inherits from `AgentSkill`
- [ ] `name` is snake_case and unique
- [ ] `description` is clear for API docs
- [ ] `get_parameters_schema()` returns valid JSON schema
- [ ] `execute()` is async and returns `AgentResult`
- [ ] All exceptions caught and returned as `AgentResult(success=False)`
- [ ] Skill exported from `__init__.py`
- [ ] Skill registered in agent's `_register_skills()`
- [ ] Skill appears in `/skills` endpoint
- [ ] Skill executes successfully via `/execute` endpoint
