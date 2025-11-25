---
name: docker
description: |
  Docker container management and orchestration for AI agent systems.
  Integrates with Veritas Docker infrastructure for coding assistant operations.

  USE WHEN user says 'docker', 'container', 'compose', 'veritas start', 'veritas stop',
  'start services', 'stop services', 'container logs', 'docker status', or needs
  container management for AI coding workflows.

  Provides:
  - Veritas infrastructure management (server, MCP, agents, frontend, monitoring)
  - Container lifecycle operations (start, stop, restart, logs)
  - Health monitoring and diagnostics
  - Resource management (CPU, memory, GPU)
  - Security best practices enforcement
  - Multi-stage build optimization

triggers:
  - docker
  - container
  - compose
  - veritas start
  - veritas stop
  - veritas status
  - start services
  - stop services
  - container logs

model: sonnet
---

# Docker Skill - Container Management for AI Agents

## Overview

This skill provides comprehensive Docker container management for PAI/Kai, with special integration for the **Veritas Docker Infrastructure** - a complete AI coding assistant stack.

## Veritas Infrastructure Components

### Core Services (Default Profile)

| Service | Port | Purpose |
|---------|------|---------|
| **veritas-server** | 8282 | FastAPI + Claude API + Socket.IO |
| **veritas-mcp** | 8061 | MCP Server with DGTS + NLNH |
| **veritas-frontend** | 3838 | Enhanced Archon UI |
| **veritas-redis** | 6379 (internal) | Caching layer |

### Agent Services (--profile agents)

| Service | Port | Purpose |
|---------|------|---------|
| **veritas-agents** | 8062 | Multi-agent system (Planner, Patcher, Validator, DGTS, Clerk) |

### Monitoring Services (--profile monitoring)

| Service | Port | Purpose |
|---------|------|---------|
| **prometheus** | 9090 | Metrics collection |
| **grafana** | 3050 | Visualization dashboards |
| **loki** | 3100 | Log aggregation |
| **promtail** | - | Log shipper |

## Quick Commands

### Start Veritas Stack

```bash
# Core services only
cd "C:/Jarvis/AI Workspace/Veritas"
docker compose -f docker-compose.veritas.yml up -d

# With AI agents
docker compose -f docker-compose.veritas.yml --profile agents up -d

# With monitoring
docker compose -f docker-compose.veritas.yml --profile monitoring up -d

# Full stack (agents + monitoring)
docker compose -f docker-compose.veritas.yml --profile agents --profile monitoring up -d
```

### Stop Veritas Stack

```bash
cd "C:/Jarvis/AI Workspace/Veritas"
docker compose -f docker-compose.veritas.yml down

# Remove volumes too
docker compose -f docker-compose.veritas.yml down -v
```

### Check Status

```bash
# Service status
docker compose -f docker-compose.veritas.yml ps

# Health checks
docker compose -f docker-compose.veritas.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

# Resource usage
docker stats --no-stream
```

### View Logs

```bash
# All services
docker compose -f docker-compose.veritas.yml logs -f

# Specific service
docker compose -f docker-compose.veritas.yml logs -f veritas-server
docker compose -f docker-compose.veritas.yml logs -f veritas-mcp
docker compose -f docker-compose.veritas.yml logs -f veritas-agents

# Last 100 lines
docker compose -f docker-compose.veritas.yml logs --tail=100 veritas-server
```

## Service URLs

When Veritas is running:

| Service | URL |
|---------|-----|
| **Veritas API** | http://localhost:8282 |
| **Veritas MCP** | http://localhost:8061 |
| **Veritas UI** | http://localhost:3838 |
| **Grafana** | http://localhost:3050 (admin/veritas2024) |
| **Prometheus** | http://localhost:9090 |

## Health Check Endpoints

```bash
# Veritas Server
curl http://localhost:8282/health

# Veritas MCP
curl http://localhost:8061/health

# Veritas Agents
curl http://localhost:8062/health
```

## Environment Configuration

Veritas uses `.env.veritas` for configuration:

```bash
# Key settings
CLAUDE_API_KEY=your-key
DATABASE_URL=your-neon-url
NLNH_CONFIDENCE_THRESHOLD=0.75
DGTS_ENFORCEMENT_ENABLED=true
VERITAS_SERVER_PORT=8282
VERITAS_MCP_PORT=8061
VERITAS_AGENTS_PORT=8062
VERITAS_UI_PORT=3838
```

## Docker Best Practices (2025)

### Resource Limits

Always set resource limits for AI containers:

```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 8G
    reservations:
      cpus: '2.0'
      memory: 4G
```

### GPU Access (if available)

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

### Security Hardening

```bash
# Run containers with security best practices
docker run \
  --read-only \
  --security-opt=no-new-privileges \
  --cap-drop ALL \
  --user 1000:1000 \
  your-image
```

### Multi-Stage Builds

For 60-80% smaller images:

```dockerfile
# Stage 1: Build
FROM python:3.11 AS builder
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM python:3.11-slim
COPY --from=builder /root/.local /root/.local
COPY src/ .
CMD ["python", "app.py"]
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose -f docker-compose.veritas.yml logs veritas-server

# Check health
docker inspect veritas-server --format='{{.State.Health.Status}}'

# Restart service
docker compose -f docker-compose.veritas.yml restart veritas-server
```

### Port Conflicts

```bash
# Find what's using a port
netstat -ano | findstr :8282

# Kill process (Windows)
taskkill /PID <pid> /F
```

### Volume Issues

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect archon_qdrant-storage

# Clean up unused volumes
docker volume prune
```

### Network Issues

```bash
# List networks
docker network ls

# Inspect network
docker network inspect veritas-network

# Recreate network
docker compose -f docker-compose.veritas.yml down
docker network rm veritas-network
docker compose -f docker-compose.veritas.yml up -d
```

## PAI-Veritas Integration

### MCP Server Configuration

Add to `.claude/mcp.json` for PAI integration:

```json
{
  "mcpServers": {
    "veritas": {
      "url": "http://localhost:8061",
      "description": "Veritas truth-enforcing coding assistant"
    }
  }
}
```

### PAI Context Mounting

Veritas mounts PAI context read-only:

```yaml
volumes:
  - /c/Users/HeinvanVuuren/.claude:/root/.claude:ro
```

This gives Veritas agents access to:
- PAI skills and workflows
- Core context (SKILL.md)
- Research and fabric patterns

## Docker MCP Servers

### Docker MCP Toolkit (Docker Desktop 4.40+)

Access via Docker Desktop > MCP Toolkit tab:
- 100+ verified MCP servers
- Zero-setup installation
- Dynamic discovery

### Third-Party Docker MCP

```bash
# docker-mcp (container management)
npx @quantgeekdev/docker-mcp

# mcp-server-docker (natural language)
npx @ckreiling/mcp-server-docker
```

## Monitoring Integration

### Prometheus Metrics

Veritas exposes metrics at `/metrics` endpoint:
- Request latency
- Agent execution time
- DGTS violation counts
- NLNH confidence scores

### Grafana Dashboards

Pre-configured dashboards at http://localhost:3050:
- Veritas System Overview
- Agent Performance
- DGTS Enforcement
- Resource Usage

### Loki Log Queries

```logql
# Error logs from all services
{container_name=~"veritas-.*"} |= "error"

# DGTS violations
{container_name="veritas-agents"} |= "DGTS"

# Slow requests
{container_name="veritas-server"} | json | latency_ms > 1000
```

## Advanced Operations

### Scale Agents

```bash
docker compose -f docker-compose.veritas.yml up -d --scale veritas-agents=3
```

### Update Images

```bash
docker compose -f docker-compose.veritas.yml pull
docker compose -f docker-compose.veritas.yml up -d
```

### Backup Volumes

```bash
# Backup Qdrant storage
docker run --rm -v archon_qdrant-storage:/data -v $(pwd):/backup alpine tar czf /backup/qdrant-backup.tar.gz /data

# Backup Redis
docker exec veritas-redis redis-cli BGSAVE
```

### Clean Up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

## Success Criteria

- Veritas server responds at http://localhost:8282/health
- MCP server responds at http://localhost:8061
- UI accessible at http://localhost:3838
- All health checks passing
- No error logs in `docker compose logs`

---

**Version**: 1.0
**Last Updated**: 2025-11-25
**Integration**: Veritas Docker Infrastructure + PAI/Kai
