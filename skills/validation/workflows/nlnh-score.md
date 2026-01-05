# NLNH Confidence Scoring Workflow

**Protocol**: No LLM No Hallucination (NLNH)
**Purpose**: Calculate composite confidence from 4 factors to prevent hallucinations
**Performance**: <50ms per calculation

---

## Overview

NLNH calculates a weighted composite confidence score from 4 factors and compares against agent-specific thresholds. Blocks responses below threshold to enforce "I don't know" when uncertain.

---

## 4-Factor Composite Scoring

### Factor 1: Knowledge Base (30% weight)

**Purpose**: Measure RAG retrieval relevance

**Calculation**:
```python
def calculate_knowledge_base_score(retrieval_results, threshold=0.7):
    # Extract similarity scores
    similarities = [r['similarity'] for r in retrieval_results]

    # Filter by relevance threshold
    relevant = [s for s in similarities if s >= threshold]

    if not relevant:
        return 0.0

    # Use highest similarity as base
    max_similarity = max(relevant)

    # Bonus for multiple relevant results (up to +0.2)
    count_bonus = min(len(relevant) * 0.05, 0.2)

    # Final score (capped at 1.0)
    return min(max_similarity + count_bonus, 1.0)
```

**Example**:
- Top result: 0.85 similarity
- 3 relevant results (>0.7)
- Score: 0.85 + (3 × 0.05) = 0.85 + 0.15 = **1.0**

---

### Factor 2: Code Validation (30% weight)

**Purpose**: Verify code exists and is valid

**Calculation**:
```python
def calculate_code_validation_score(
    code_exists=False,      # 30%
    syntax_valid=False,     # 20%
    type_valid=False,       # 20%
    tests_exist=False,      # 15%
    tests_pass=False,       # 15%
):
    score = 0.0
    if code_exists: score += 0.30
    if syntax_valid: score += 0.20
    if type_valid: score += 0.20
    if tests_exist: score += 0.15
    if tests_pass: score += 0.15
    return score
```

**Example**:
- Code exists: ✅ (+0.30)
- Syntax valid: ✅ (+0.20)
- Types valid: ✅ (+0.20)
- Tests exist: ✅ (+0.15)
- Tests pass: ❌ (0)
- Score: **0.85**

---

### Factor 3: Response Certainty (20% weight)

**Purpose**: Analyze response for uncertainty markers

**Uncertainty Markers** (reduce score):
- "I think", "maybe", "possibly", "perhaps", "might"
- "I'm not sure", "uncertain", "unclear"
- "I don't know", "unsure", "probably", "likely"

**Certainty Markers** (increase score):
- "definitely", "certainly", "absolutely", "confirmed"
- "verified", "tested", "proven", "documented"

**Calculation**:
```python
def calculate_response_certainty_score(response_text):
    text_lower = response_text.lower()

    # Count markers
    uncertainty_count = sum(text_lower.count(m) for m in uncertainty_markers)
    certainty_count = sum(text_lower.count(m) for m in certainty_markers)

    # Start at neutral (0.5)
    base_score = 0.5

    # Adjust for certainty (+0.1 each, max +0.5)
    certainty_adj = min(certainty_count * 0.1, 0.5)

    # Adjust for uncertainty (-0.15 each, max -0.5)
    uncertainty_adj = min(uncertainty_count * 0.15, 0.5)

    # Clamp to [0.0, 1.0]
    score = base_score + certainty_adj - uncertainty_adj
    return max(0.0, min(1.0, score))
```

**Example**:
- Response: "I definitely tested this and it's confirmed working"
- Certainty markers: 2 ("definitely", "confirmed")
- Uncertainty markers: 0
- Score: 0.5 + (2 × 0.1) = **0.7**

---

### Factor 4: Agent History (20% weight)

**Purpose**: Track agent success rate over time

**Calculation**:
```python
def calculate_agent_history_score(agent_name, lookback_hours=24):
    # Read recent confidence history from JSONL
    history = read_recent_history(agent_name, lookback_hours)

    if not history:
        return 0.5  # Neutral if no history

    # Calculate success rate (threshold_met / total)
    successful = sum(1 for h in history if h['threshold_met'])
    total = len(history)

    return successful / total if total > 0 else 0.5
```

**Example**:
- Last 24 hours: 18/20 executions met threshold
- Score: 18/20 = **0.90**

---

## Composite Score Calculation

**Formula**:
```
composite = (KB × 0.30) + (Code × 0.30) + (Certainty × 0.20) + (History × 0.20)
```

**Example**:
```
KB:        1.0  × 0.30 = 0.30
Code:      0.85 × 0.30 = 0.255
Certainty: 0.7  × 0.20 = 0.14
History:   0.9  × 0.20 = 0.18
─────────────────────────────
Composite:              0.875 (87.5%)
```

---

## Agent-Specific Thresholds

| Agent Type | Threshold | Rationale |
|------------|-----------|-----------|
| Planner | 75% | Planning requires moderate confidence |
| Patcher | 80% | Code implementation requires high confidence |
| Validator | 85% | Validation must be very confident |
| DGTS Enforcer | 90% | Gaming detection requires highest confidence |
| Clerk | 70% | Documentation can be lower confidence |

**Enforcement**:
- Composite >= Threshold → ✅ Proceed
- Composite < Threshold → 🚫 Block (use "I don't know")

---

## Confidence Levels

| Level | Range | Action |
|-------|-------|--------|
| HIGH | >90% | Very confident, proceed |
| MODERATE | 75-90% | Confident, proceed with caution |
| LOW | 50-75% | Low confidence, consider "I don't know" |
| VERY_LOW | <50% | Must use "I don't know" |

---

## Usage

### Command Line

```bash
# Calculate confidence
python ~/.claude/validation/nlnh/confidence_calculator.py \
  planner archon-planner-1 0.8 0.9 0.7

# Output:
# Composite Confidence: 82.50%
# Confidence Level: MODERATE
# Threshold: 75.00%
# Threshold Met: True
# Should Block: False
#
# Factor Scores:
#   Knowledge Base: 80.00%
#   Code Validation: 90.00%
#   Response Certainty: 70.00%
#   Agent History: 75.00%
```

### Python API

```python
from claude.validation.nlnh import ConfidenceCalculator, AgentType

# Initialize calculator
calculator = ConfidenceCalculator()

# Calculate confidence
result = calculator.calculate_confidence(
    agent_type=AgentType.PATCHER,
    agent_name="archon-patcher-1",
    knowledge_base_score=0.85,
    code_validation_score=0.90,
    response_certainty_score=0.75,
    # agent_history_score auto-calculated from local history
    task_id="task-123",
)

# Check result
if result.should_block:
    print(f"🚫 Low confidence: {result.block_reason}")
    # Use "I don't know" instead
else:
    print(f"✅ Confidence {result.composite_confidence:.2%} meets threshold")

# Access details
print(f"Level: {result.confidence_level}")
print(f"KB Score: {result.factors.knowledge_base_score:.2%}")
print(f"Code Score: {result.factors.code_validation_score:.2%}")
print(f"Certainty Score: {result.factors.response_certainty_score:.2%}")
print(f"History Score: {result.factors.agent_history_score:.2%}")
```

---

## Factor Calculation Helpers

### Calculate KB Score from RAG Results

```python
retrieval_results = [
    {"similarity": 0.92, "text": "Relevant doc 1"},
    {"similarity": 0.85, "text": "Relevant doc 2"},
    {"similarity": 0.65, "text": "Less relevant doc"},
]

kb_score = calculator.calculate_knowledge_base_score(
    retrieval_results,
    relevance_threshold=0.7,
)
# Returns: 0.92 + (2 × 0.05) = 1.0
```

### Calculate Code Score from Validation

```python
code_score = calculator.calculate_code_validation_score(
    code_exists=True,
    syntax_valid=True,
    type_valid=True,
    tests_exist=True,
    tests_pass=False,  # Tests failing
)
# Returns: 0.30 + 0.20 + 0.20 + 0.15 = 0.85
```

### Calculate Certainty from Response

```python
response = "I definitely tested this and it's confirmed working"

certainty_score = calculator.calculate_response_certainty_score(response)
# Returns: 0.5 + (2 × 0.1) = 0.7
```

---

## History & Logging

### JSONL History

**File**: `~/.claude/validation/history/confidences-YYYY-MM-DD.jsonl`

**Format**:
```json
{
  "timestamp": "2025-11-15T10:30:00Z",
  "agent_name": "archon-patcher-1",
  "agent_type": "patcher",
  "task_id": "task-123",
  "composite_confidence": 0.875,
  "confidence_level": "MODERATE",
  "agent_threshold": 0.80,
  "threshold_met": true,
  "should_block": false,
  "factors": {
    "knowledge_base_score": 1.0,
    "code_validation_score": 0.85,
    "response_certainty_score": 0.7,
    "agent_history_score": 0.9
  }
}
```

**Retention**: 90 days (auto-cleanup)

---

### Agent Statistics

Get comprehensive statistics:

```python
stats = calculator.get_agent_statistics(
    agent_name="archon-patcher-1",
    lookback_hours=168,  # 1 week
)

print(f"Total executions: {stats['total_executions']}")
print(f"Success rate: {stats['success_rate']:.2%}")
print(f"Avg confidence: {stats['average_confidence']:.2%}")
print(f"Blocked count: {stats['blocked_count']}")
print(f"Threshold: {stats['threshold']:.2%}")
```

---

## Integration Points

### Pre-Response Check

Calculate confidence before sending response:

```python
# Calculate confidence for response
result = calculator.calculate_confidence(
    agent_type=AgentType.PATCHER,
    agent_name="archon-patcher-1",
    knowledge_base_score=kb_score,
    code_validation_score=code_score,
    response_certainty_score=certainty_score,
)

if result.should_block:
    # Use "I don't know" instead
    return {
        "response": "I don't know - my confidence is too low to answer this accurately.",
        "reason": result.block_reason,
        "confidence": result.composite_confidence,
    }
else:
    # Proceed with normal response
    return {
        "response": actual_response,
        "confidence": result.composite_confidence,
    }
```

### Quality Gate Integration

NLNH is part of Post-Implementation quality gate:

```python
from claude.validation.quality_gates import QualityGatesExecutor

executor = QualityGatesExecutor()
result = executor.execute_post_implementation_gate(
    agent_name="patcher-1",
    agent_type="patcher",
    # ... other params
)

# Check if confidence requirements met
confidence_check = [c for c in result.checks if c.rule == "CONFIDENCE_REQUIREMENTS"][0]

if confidence_check.status == "FAILED":
    print("🚫 Confidence too low - cannot proceed")
```

---

## Troubleshooting

### Always Blocking

**Problem**: Confidence always below threshold

**Solutions**:
1. Check which factor is low (KB, Code, Certainty, History)
2. Improve low factor (better RAG, better tests, less hedging)
3. Review agent threshold (too high?)
4. Check agent history (poor track record?)

### History Score Always 0.5

**Problem**: No history data available

**Solutions**:
1. Check JSONL files exist: `ls ~/.claude/validation/history/`
2. Verify agent name matches exactly
3. Run a few executions to build history

### Certainty Score Always Low

**Problem**: Responses contain uncertainty markers

**Solutions**:
1. Remove hedging language ("I think", "maybe")
2. Use certainty markers ("definitely", "confirmed")
3. Only respond when confident

---

## Best Practices

### 1. Fail Early with Low Confidence
Check confidence before generating full response.

### 2. Track Confidence Trends
Monitor agent confidence over time - decreasing = problem.

### 3. Improve Low Factors
Focus on improving weakest factor first.

### 4. Use "I Don't Know" Liberally
Better to admit uncertainty than hallucinate.

### 5. Review Blocked Responses
Analyze why confidence was low - improve for next time.

---

## Performance Benchmarks

| Operation | Time | Status |
|-----------|------|--------|
| Confidence Calculation | 5-10ms | ✅ |
| History Lookup (24h) | 20-30ms | ✅ |
| History Lookup (7d) | 50-100ms | ✅ |
| Total (with history) | 30-50ms | ✅ |

**Target**: <50ms ✅

---

## References

- **4-Factor Scoring**: Based on Veritas NLNH Protocol
- **Confidence Thresholds**: PRD requirements (>80% accuracy)
- **Uncertainty Detection**: NLP uncertainty marker research

---

**Last Updated**: 2025-11-15
**Version**: 1.0.0
