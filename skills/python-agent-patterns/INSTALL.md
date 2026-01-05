# Python Agent Patterns - Installation Guide

**Pack Version**: 2.0
**Installation Time**: 30-45 minutes
**Complexity**: Medium (Python backend setup)

---

## Prerequisites

### Required

**1. Claude Code CLI**
- **Minimum Version**: Latest stable release
- **Check**: `claude --version`
- **Install**: See [Claude Code documentation](https://github.com/anthropics/claude-code)

**2. PAI Environment**
- **Required**: PAI_DIR environment variable set
- **Check**: `echo $PAI_DIR` (Unix/Mac) or `echo %PAI_DIR%` (Windows)
- **Typical Location**: `~/.claude/` or `C:\Users\<Username>\.claude\`

**3. Python**
- **Minimum Version**: Python 3.8+
- **Check**: `python --version` or `python3 --version`
- **Install**: Download from [python.org](https://www.python.org/downloads/)
- **Why**: Async/await syntax, dataclasses, type hints

**4. FastAPI**
- **Minimum Version**: fastapi>=0.104.0
- **Check**: `pip show fastapi`
- **Install**: `pip install fastapi uvicorn[standard]`
- **Why**: Async web framework for REST API endpoints

**5. SQLAlchemy (Async)**
- **Minimum Version**: sqlalchemy[asyncio]>=2.0.0
- **Check**: `pip show sqlalchemy`
- **Install**: `pip install sqlalchemy[asyncio] asyncpg`
- **Why**: Async database ORM for skill database operations

**6. Pydantic**
- **Minimum Version**: pydantic>=2.0.0
- **Check**: `pip show pydantic`
- **Install**: `pip install pydantic`
- **Why**: Request/response models, parameter validation

### Optional

**Redis** (For Distributed Task Queue):
- **Use Case**: Multi-worker task processing
- **Install**: `pip install redis`
- **Service**: Requires Redis server running

**Celery** (For Background Tasks):
- **Use Case**: Scheduled tasks, long-running jobs
- **Install**: `pip install celery`
- **Requires**: Redis or RabbitMQ message broker

**APScheduler** (For Cron-Like Scheduling):
- **Use Case**: Periodic task execution
- **Install**: `pip install apscheduler`

---

## Installation Steps

### Step 1: Verify Skill Files Exist

The python-agent-patterns skill should already be installed in your PAI skills directory.

**Unix/Mac:**
```bash
ls -la "$HOME/.claude/skills/python-agent-patterns/"
```

**Windows (PowerShell):**
```powershell
Get-ChildItem "$env:USERPROFILE\.claude\skills\python-agent-patterns\" -Force
```

**Expected Files:**
```
python-agent-patterns/
├── SKILL.md              # Main skill documentation (loaded by Claude Code)
├── PACK_README.md        # Architecture overview (on-demand)
├── PACK_INSTALL.md       # This installation guide (on-demand)
├── PACK_VERIFY.md        # Verification checklist (on-demand)
└── workflows/
    ├── create-new-skill.md   # Skill creation workflow (160 lines)
    └── create-new-agent.md   # Agent creation workflow (402 lines)
```

**If files are missing**: The skill may not be installed. Check your PAI installation or contact your PAI administrator.

---

### Step 2: Verify Skill Loading

Start a Claude Code session in any Python project:

```bash
claude
```

In the session, type:
```
@python-agent-patterns
```

**Expected Behavior**:
- Skill activates
- Claude loads python-agent-patterns context
- Ready to guide agent/skill creation

**If skill doesn't load**:
- Check that SKILL.md exists in the skill directory
- Verify Claude Code is recognizing the ~/.claude/skills/ directory
- Try restarting Claude Code session

---

### Step 3: Set Up Python Project Structure

Create a new FastAPI project with the recommended directory structure.

**Option A: Manual Setup**

```bash
# Create project directory
mkdir my-agent-system
cd my-agent-system

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Unix/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Create directory structure
mkdir -p app/agents/skills
mkdir -p app/api/v1
mkdir -p app/core
mkdir -p app/models
mkdir -p app/schemas
mkdir -p tests

# Create __init__.py files
touch app/__init__.py
touch app/agents/__init__.py
touch app/agents/skills/__init__.py
touch app/api/__init__.py
touch app/api/v1/__init__.py
touch app/core/__init__.py
touch app/models/__init__.py
touch app/schemas/__init__.py
touch tests/__init__.py
```

**Expected Directory Structure:**
```
my-agent-system/
├── venv/                     # Virtual environment
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization (create next)
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base_agent.py    # Base classes (AgentSkill, BaseAgent)
│   │   ├── spam_agent.py    # Example domain agent
│   │   └── skills/
│   │       ├── __init__.py
│   │       └── spam_skills.py  # Example skills
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── spam_agent.py   # REST API endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # App configuration
│   │   └── database.py      # Database session management
│   ├── models/              # SQLAlchemy database models
│   │   └── __init__.py
│   └── schemas/             # Pydantic request/response schemas
│       └── __init__.py
├── tests/
│   └── __init__.py
├── requirements.txt         # Python dependencies (create next)
└── .env                     # Environment variables (create next)
```

---

### Step 4: Install Python Dependencies

Create `requirements.txt`:

```bash
cat > requirements.txt <<EOF
# Core dependencies
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
sqlalchemy[asyncio]>=2.0.0
pydantic>=2.0.0
pydantic-settings>=2.0.0

# Database drivers
asyncpg>=0.29.0           # PostgreSQL async driver
aiosqlite>=0.19.0         # SQLite async driver (for testing)

# Optional: Task queue
redis>=5.0.0
celery>=5.3.0

# Optional: Scheduling
apscheduler>=3.10.0

# Development
pytest>=7.4.0
pytest-asyncio>=0.21.0
httpx>=0.25.0             # For FastAPI test client
black>=23.10.0            # Code formatting
ruff>=0.1.0               # Linting
EOF
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Verify installation:**
```bash
pip list | grep -E "fastapi|sqlalchemy|pydantic"
```

**Expected output:**
```
fastapi                   0.104.1
pydantic                  2.5.0
pydantic-settings         2.1.0
sqlalchemy                2.0.23
```

---

### Step 5: Create Base Agent Classes

**File**: `app/agents/base_agent.py`

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
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

**Create file:**
```bash
# Copy the code above and save to app/agents/base_agent.py
# Or ask Claude Code to create it for you
```

**Verify:**
```bash
python -c "from app.agents.base_agent import BaseAgent, AgentSkill, AgentResult; print('✅ Base classes imported successfully')"
```

---

### Step 6: Create Example Skill

**File**: `app/agents/skills/example_skills.py`

```python
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.agents.base_agent import AgentSkill, AgentResult

class HelloWorldSkill(AgentSkill):
    """Simple example skill for testing"""

    def __init__(self):
        super().__init__(
            name="hello_world",
            description="Returns a greeting message"
        )

    def get_parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Name to greet",
                    "default": "World"
                }
            },
            "required": []
        }

    async def execute(self, name: str = "World", **kwargs) -> AgentResult:
        try:
            message = f"Hello, {name}!"

            return AgentResult(
                success=True,
                data={"greeting": message},
                message=f"Greeted {name}"
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
                message="Hello world skill failed"
            )
```

**Verify:**
```bash
python -c "from app.agents.skills.example_skills import HelloWorldSkill; print('✅ Example skill imported successfully')"
```

---

### Step 7: Create Example Agent

**File**: `app/agents/example_agent.py`

```python
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base_agent import BaseAgent, AgentResult
from app.agents.skills.example_skills import HelloWorldSkill

class ExampleAgent(BaseAgent):
    """Example agent for testing"""

    def __init__(self):
        super().__init__(
            name="example_agent",
            description="Simple agent for testing the framework"
        )

    async def _register_skills(self) -> None:
        """Register skills"""
        self.register_skill(HelloWorldSkill())

    async def greet_workflow(self, name: str) -> AgentResult:
        """Example workflow"""
        result = await self.execute_skill("hello_world", {"name": name})
        return result

# Singleton pattern
_example_agent: Optional[ExampleAgent] = None

def get_example_agent() -> ExampleAgent:
    """Get or create example agent singleton"""
    global _example_agent
    if _example_agent is None:
        _example_agent = ExampleAgent()
    return _example_agent
```

**Verify:**
```bash
python -c "from app.agents.example_agent import get_example_agent; print('✅ Example agent imported successfully')"
```

---

### Step 8: Create FastAPI Router

**File**: `app/api/v1/example_agent.py`

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from app.agents.example_agent import get_example_agent

router = APIRouter(prefix="/example-agent", tags=["Example Agent"])

class ExecuteRequest(BaseModel):
    skill_name: str
    parameters: Dict[str, Any] = {}

@router.get("/status")
async def get_status():
    """Get agent status"""
    agent = get_example_agent()
    await agent.initialize()
    return agent.get_status()

@router.get("/skills")
async def list_skills():
    """List all skills"""
    agent = get_example_agent()
    await agent.initialize()
    return {"skills": agent.list_skills()}

@router.post("/execute")
async def execute_skill(request: ExecuteRequest):
    """Execute skill"""
    agent = get_example_agent()
    await agent.initialize()

    result = await agent.execute_skill(request.skill_name, request.parameters)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return result.to_dict()

@router.post("/workflows/greet")
async def greet_workflow(name: str):
    """Example workflow endpoint"""
    agent = get_example_agent()
    await agent.initialize()

    result = await agent.greet_workflow(name)

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result.to_dict()
```

---

### Step 9: Create FastAPI Application

**File**: `app/main.py`

```python
from fastapi import FastAPI
from app.api.v1 import example_agent

app = FastAPI(
    title="Agent System API",
    version="1.0.0",
    description="Python agent architecture with skill orchestration"
)

# Register routers
app.include_router(example_agent.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Agent System API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

---

### Step 10: Test the Installation

**Start the FastAPI server:**
```bash
uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test endpoints:**

**1. Health check:**
```bash
curl http://localhost:8000/health
```
Expected: `{"status":"healthy"}`

**2. Agent status:**
```bash
curl http://localhost:8000/api/v1/example-agent/status
```
Expected: `{"name":"example_agent","description":"...","skills_count":1,"initialized":true}`

**3. List skills:**
```bash
curl http://localhost:8000/api/v1/example-agent/skills
```
Expected: JSON with `hello_world` skill details

**4. Execute skill:**
```bash
curl -X POST http://localhost:8000/api/v1/example-agent/execute \
  -H "Content-Type: application/json" \
  -d '{"skill_name":"hello_world","parameters":{"name":"Claude"}}'
```
Expected: `{"success":true,"data":{"greeting":"Hello, Claude!"},...}`

**5. Execute workflow:**
```bash
curl -X POST "http://localhost:8000/api/v1/example-agent/workflows/greet?name=Claude"
```
Expected: `{"success":true,"data":{"greeting":"Hello, Claude!"},...}`

**6. View OpenAPI docs:**
Open browser: `http://localhost:8000/docs`

**All tests pass?** ✅ Installation successful!

---

### Step 11: (Optional) Set Up Database

If your agent skills need database access:

**File**: `app/core/database.py`

```python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"

    class Config:
        env_file = ".env"

settings = Settings()

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # Set to False in production
    future=True
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()

async def get_db() -> AsyncSession:
    """Dependency for getting database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

**File**: `.env`

```bash
# For PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname

# For SQLite (testing)
DATABASE_URL=sqlite+aiosqlite:///./test.db
```

**Update router to use database:**
```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

@router.post("/execute")
async def execute_skill(
    request: ExecuteRequest,
    db: AsyncSession = Depends(get_db)
):
    agent = get_example_agent()
    await agent.initialize()

    # Inject database session
    params = request.parameters.copy()
    params["db"] = db

    result = await agent.execute_skill(request.skill_name, params)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return result.to_dict()
```

---

## Troubleshooting

### Issue 1: Import Errors

**Symptoms**:
```
ModuleNotFoundError: No module named 'app'
```

**Possible Causes**:
1. Not running from project root directory
2. Missing `__init__.py` files
3. Virtual environment not activated

**Solutions**:

**A. Verify working directory:**
```bash
pwd  # Should be in project root (my-agent-system/)
```

**B. Check `__init__.py` files exist:**
```bash
ls -la app/__init__.py
ls -la app/agents/__init__.py
ls -la app/api/v1/__init__.py
```

**C. Activate virtual environment:**
```bash
# Unix/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate

# Verify
which python  # Should point to venv/bin/python
```

**D. Install in editable mode:**
```bash
pip install -e .
```

---

### Issue 2: FastAPI Server Won't Start

**Symptoms**:
```
ERROR:    [Errno 98] Address already in use
```

**Possible Causes**:
1. Port 8000 already in use
2. Previous uvicorn instance still running

**Solutions**:

**A. Check for process on port 8000:**
```bash
# Unix/Mac
lsof -i :8000

# Windows
netstat -ano | findstr :8000
```

**B. Kill existing process:**
```bash
# Unix/Mac
kill <PID>

# Windows
taskkill /PID <PID> /F
```

**C. Use different port:**
```bash
uvicorn app.main:app --reload --port 8001
```

---

### Issue 3: Async Database Errors

**Symptoms**:
```
RuntimeError: Event loop is closed
```

**Possible Causes**:
1. Using sync database driver instead of async
2. Not awaiting async operations
3. Mixing sync and async code

**Solutions**:

**A. Verify async database driver installed:**
```bash
pip show asyncpg  # For PostgreSQL
pip show aiosqlite  # For SQLite
```

**B. Check DATABASE_URL format:**
```bash
# ✅ Correct (async)
postgresql+asyncpg://user:pass@localhost/db
sqlite+aiosqlite:///./test.db

# ❌ Wrong (sync)
postgresql://user:pass@localhost/db
sqlite:///./test.db
```

**C. Ensure all database operations are awaited:**
```python
# ✅ Correct
result = await session.execute(query)

# ❌ Wrong
result = session.execute(query)  # Missing await
```

---

### Issue 4: Skill Not Registered

**Symptoms**:
```
{"success": false, "error": "Skill not found: skill_name"}
```

**Possible Causes**:
1. Skill not registered in `_register_skills()`
2. Agent not initialized before use
3. Typo in skill name

**Solutions**:

**A. Check skill registration:**
```python
async def _register_skills(self) -> None:
    self.register_skill(YourSkill())  # Make sure this line exists
```

**B. Ensure agent initialization:**
```python
agent = get_example_agent()
await agent.initialize()  # MUST call before using agent
```

**C. Verify skill name:**
```python
# In skill __init__
super().__init__(name="exact_skill_name", ...)

# When executing
await agent.execute_skill("exact_skill_name", {})  # Must match exactly
```

**D. List registered skills:**
```bash
curl http://localhost:8000/api/v1/example-agent/skills
# Check if your skill appears in the list
```

---

### Issue 5: Parameter Validation Failing

**Symptoms**:
```
{"success": false, "error": "Missing required parameter: db"}
```

**Possible Causes**:
1. Required parameter not passed
2. Schema doesn't match actual parameters
3. Database session not injected

**Solutions**:

**A. Check parameter schema:**
```python
def get_parameters_schema(self) -> Dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "db": {"type": "object"},  # Required
            "message_id": {"type": "integer"}  # Required
        },
        "required": ["db", "message_id"]  # List required params
    }
```

**B. Inject database session in router:**
```python
@router.post("/execute")
async def execute_skill(
    request: ExecuteRequest,
    db: AsyncSession = Depends(get_db)  # Inject db
):
    params = request.parameters.copy()
    params["db"] = db  # Add db to parameters

    result = await agent.execute_skill(request.skill_name, params)
```

**C. Make parameter optional if not always needed:**
```python
def get_parameters_schema(self) -> Dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "name": {"type": "string", "default": "World"}
        },
        "required": []  # No required params
    }
```

---

### Issue 6: Workflow Errors Not Caught

**Symptoms**:
- Workflow crashes with unhandled exception
- No error returned to client

**Possible Causes**:
1. Missing try/except in skill execution
2. Workflow not checking `result.success`
3. Exceptions propagating uncaught

**Solutions**:

**A. Add try/except to all skills:**
```python
async def execute(self, **kwargs) -> AgentResult:
    try:
        # Skill logic here
        return AgentResult(success=True, data=result)
    except Exception as e:
        return AgentResult(success=False, error=str(e))
```

**B. Check result.success in workflows:**
```python
async def workflow(self, db, param):
    step1 = await self.execute_skill("skill1", {"db": db})

    if not step1.success:  # Check success
        return AgentResult(success=False, error=step1.error)

    # Continue only if step1 succeeded
    step2 = await self.execute_skill("skill2", {"db": db, "data": step1.data})

    return step2
```

**C. Add error handling to router:**
```python
@router.post("/workflows/process")
async def workflow(db: AsyncSession = Depends(get_db)):
    try:
        agent = get_example_agent()
        await agent.initialize()
        result = await agent.process_workflow(db)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.error)

        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Production Deployment

### Environment Variables

**Create `.env.production`:**
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@prod-db-host/dbname

# API Settings
API_TITLE="Production Agent System"
API_VERSION="1.0.0"

# Security
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=https://yourdomain.com

# Logging
LOG_LEVEL=INFO
```

### Dockerfile

**Create `Dockerfile`:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: agentdb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Deploy:**
```bash
docker-compose up -d
```

---

## Next Steps

After successful installation:

1. **Read PACK_README.md** - Understand architecture, features, 5 use cases
2. **Create Your First Skill** - Follow `workflows/create-new-skill.md`
3. **Create Your First Agent** - Follow `workflows/create-new-agent.md`
4. **Run Verification** - Use PACK_VERIFY.md checklist to validate setup
5. **Build Your Domain Agent** - Apply patterns to your specific use case

---

## Support

### Documentation
- **PACK_README.md**: Architecture overview, 5 detailed use cases
- **PACK_VERIFY.md**: Comprehensive verification checklist
- **workflows/create-new-skill.md**: Step-by-step skill creation
- **workflows/create-new-agent.md**: Complete agent creation guide

### Reference Implementation
- **BOSS Exchange**: Spam detection agent with 7 skills
- **Location**: See PACK_README.md Use Case 1 for detailed breakdown

### Getting Help

**Within Claude Code Session**:
```
Help me troubleshoot python-agent-patterns - [describe issue]
```

**Common Issues**:
- Import errors → Check virtual environment, `__init__.py` files
- Database errors → Verify async driver, DATABASE_URL format
- Skill not found → Check registration, initialization
- Parameter validation → Review schema, parameter injection

---

**Installation Guide Version**: 2.0
**Last Updated**: 2026-01-04
**Estimated Installation Time**: 30-45 minutes
