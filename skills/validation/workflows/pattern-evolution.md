# Pattern Evolution Workflow

**Protocol**: Autonomous Pattern Evolution
**Purpose**: Continuous improvement of gaming pattern detection
**Performance**: <5s per evolution cycle

---

## Overview

The Pattern Evolution Engine implements autonomous learning to continuously improve DGTS gaming detection. It analyzes DGTS history to:

1. **Remove noisy patterns** - Patterns with high false positive rates (>70%)
2. **Discover new patterns** - Common gaming behaviors not yet detected
3. **Optimize thresholds** - Adjust severity weights based on accuracy
4. **Update pattern library** - Automatically evolve base_patterns.json

**Key Principle**: The system learns from experience without human intervention.

---

## Evolution Cycle

### Weekly Auto-Evolution

Recommended schedule: Run every Sunday at 00:00 (weekly)

```bash
# Cron job (Linux/Mac)
0 0 * * 0 python ~/.claude/validation/learning/pattern_evolution.py

# Windows Task Scheduler
# Action: python C:\Users\<User>\.claude\validation\learning\pattern_evolution.py
```

### Manual Evolution

```bash
# Standard evolution (30 days of history)
python ~/.claude/validation/learning/pattern_evolution.py

# Custom lookback period
python ~/.claude/validation/learning/pattern_evolution.py --lookback-days 60

# Custom directories
python ~/.claude/validation/learning/pattern_evolution.py \
  --patterns-dir ~/custom/patterns \
  --history-dir ~/custom/history
```

---

## 4-Step Evolution Process

### Step 1: Analyze Pattern Statistics

**Purpose**: Calculate false positive rates for all patterns

**Process**:
1. Read DGTS history from last N days (default: 30)
2. Count detections per pattern
3. Calculate false positive rate (FP / Total)
4. Identify noisy patterns

**Metrics**:
- Total detections per pattern
- False positives vs true positives
- False positive rate (0.0 to 1.0)

**Example Output**:
```
Pattern TEST_001: 45 detections, 32 FP, 13 TP → 71% FP rate
Pattern FAKE_002: 12 detections, 1 FP, 11 TP → 8% FP rate
```

**Thresholds**:
- **Remove**: FP rate ≥ 70% (pattern is too noisy)
- **Warn**: FP rate ≥ 40% (pattern needs review)
- **Keep**: FP rate < 40% (pattern is accurate)

---

### Step 2: Remove Noisy Patterns

**Purpose**: Eliminate patterns causing too many false positives

**Criteria**:
- False positive rate ≥ 70%
- Minimum 10 detections (statistical significance)

**Process**:
1. Identify patterns meeting removal criteria
2. Remove from base_patterns.json
3. Log removal reason and stats

**Example**:
```
🗑️  Removing noisy pattern TEST_001: 71% FP rate
    - 45 total detections
    - 32 false positives
    - Description: "assert True always passes"
    - Reason: Too many false alarms on valid assertions
```

**Impact**:
- Reduces false positive alerts
- Improves developer trust in DGTS
- Focuses on high-signal patterns

---

### Step 3: Discover New Patterns

**Purpose**: Find common gaming behaviors not yet detected

**Process**:
1. Extract all violation texts from history
2. Count occurrence frequency
3. Identify common patterns (≥5 occurrences)
4. Check if covered by existing patterns
5. Generate new pattern definitions

**Discovery Thresholds**:
- **Minimum occurrences**: 5 (pattern must appear at least 5 times)
- **Minimum violation rate**: 30% (must be in >30% of violations)

**Pattern Generation**:
```python
# Code snippet found 8 times in violations:
"return {'status': 'success'}"  # Hardcoded success response

# Generated pattern:
{
  "id": "DISCOVERED_20251115_042",
  "severity": "MINOR",
  "regex": "return\\s*\\{\\s*['\"]status['\"]\\s*:\\s*['\"]success['\"]",
  "description": "Discovered pattern: return {'status': 'success'}",
  "example": "return {'status': 'success'}",
  "category": "feature_faking",
  "discovered_date": "2025-11-15T10:30:00Z",
  "occurrence_count": 8
}
```

**Severity Assignment**:
- 20+ occurrences → CRITICAL
- 10-19 occurrences → MAJOR
- 5-9 occurrences → MINOR
- <5 occurrences → Not added (insufficient data)

---

### Step 4: Optimize Thresholds

**Purpose**: Adjust severity weights based on pattern accuracy

**Process**:
1. Calculate average accuracy per severity level
2. Compare to current weights
3. Adjust weights based on performance

**Current Weights**:
```json
{
  "CRITICAL": 0.50,
  "MAJOR": 0.25,
  "MINOR": 0.10,
  "WARNING": 0.05
}
```

**Adjustment Rules**:
- **High accuracy (>90%)**: Increase weight by 10% (max 0.60)
- **Low accuracy (<60%)**: Decrease weight by 10% (min 0.02)
- **Moderate accuracy (60-90%)**: No change

**Example**:
```
Severity: CRITICAL
  - Average accuracy: 92%
  - Current weight: 0.50
  - New weight: 0.55 (+0.05 increase)
  - Reason: High accuracy justifies higher weight

Severity: WARNING
  - Average accuracy: 55%
  - Current weight: 0.05
  - New weight: 0.045 (-0.005 decrease)
  - Reason: Low accuracy requires lower weight
```

---

## Evolution Result

### Result Structure

```python
@dataclass
class EvolutionResult:
    timestamp: datetime
    patterns_analyzed: int          # Total patterns evaluated
    patterns_removed: int            # Noisy patterns removed
    patterns_modified: int           # Patterns with threshold changes
    patterns_added: int              # New patterns discovered
    threshold_changes: Dict[str, float]  # Updated severity weights
    summary: str                     # Human-readable summary
    details: List[str]               # Detailed change log
```

### Example Result

```json
{
  "timestamp": "2025-11-15T10:30:00Z",
  "patterns_analyzed": 37,
  "patterns_removed": 2,
  "patterns_modified": 1,
  "patterns_added": 3,
  "threshold_changes": {
    "CRITICAL": 0.55,
    "WARNING": 0.045
  },
  "summary": "Evolution complete: -2 +3 patterns, 2 threshold updates",
  "details": [
    "Removed 2 noisy patterns: TEST_001, FAKE_005",
    "Discovered 3 new patterns: DISCOVERED_20251115_042, DISCOVERED_20251115_043, DISCOVERED_20251115_044",
    "Updated thresholds: CRITICAL=0.55 (+0.05), WARNING=0.045 (-0.005)"
  ]
}
```

---

## Pattern Library Updates

### Version Control

Each evolution increments the pattern library version:

```json
{
  "version": "1.0.5",  // Incremented from 1.0.4
  "last_evolution": "2025-11-15T10:30:00Z",
  "source": "Extracted from Veritas DGTS + Autonomous Evolution",
  "total_patterns": 38,  // 37 - 2 + 3
  ...
}
```

### Git Integration

Pattern library changes are Git-tracked:

```bash
# After evolution
git diff ~/.claude/validation/patterns/base_patterns.json

# Shows:
# - Removed patterns (noisy)
# + Added patterns (discovered)
# ~ Modified thresholds

# Commit evolution changes
git add ~/.claude/validation/patterns/base_patterns.json
git commit -m "chore: pattern evolution v1.0.5 - remove 2 noisy, add 3 discovered"
```

---

## History & Logging

### Evolution History

**File**: `~/.claude/validation/history/pattern-evolution-YYYY-MM-DD.jsonl`

**Format**:
```json
{
  "timestamp": "2025-11-15T10:30:00Z",
  "patterns_analyzed": 37,
  "patterns_removed": 2,
  "patterns_added": 3,
  "threshold_changes": {"CRITICAL": 0.55},
  "summary": "Evolution complete: -2 +3 patterns",
  "details": [
    "Removed 2 noisy patterns: TEST_001, FAKE_005",
    "Discovered 3 new patterns: DISCOVERED_20251115_042, ..."
  ]
}
```

**Retention**: 365 days (track evolution over time)

---

## Python API

### Basic Usage

```python
from claude.validation.learning import PatternEvolutionEngine

# Initialize engine
engine = PatternEvolutionEngine(
    lookback_days=30  # Analyze last 30 days
)

# Run evolution cycle
result = engine.evolve_patterns()

# Check results
print(f"Patterns analyzed: {result.patterns_analyzed}")
print(f"Patterns removed: {result.patterns_removed}")
print(f"Patterns added: {result.patterns_added}")
print(f"Summary: {result.summary}")

# Details
for detail in result.details:
    print(f"  - {detail}")
```

### Custom Configuration

```python
from pathlib import Path

engine = PatternEvolutionEngine(
    patterns_dir=Path.home() / ".claude" / "validation" / "patterns",
    history_dir=Path.home() / ".claude" / "validation" / "history",
    lookback_days=60,  # 2 months of history
)

result = engine.evolve_patterns()
```

---

## Integration with Quality Gates

### Automatic Evolution Trigger

Run evolution after significant DGTS usage:

```python
from claude.validation.learning import PatternEvolutionEngine
from claude.validation.dgts import GamingDetector

# Count DGTS violations in last 7 days
detector = GamingDetector()
# ... analyze code files ...

# If >100 violations detected, trigger evolution
if total_violations > 100:
    engine = PatternEvolutionEngine(lookback_days=7)
    result = engine.evolve_patterns()

    if result.patterns_removed > 0 or result.patterns_added > 0:
        print("🧠 Pattern library evolved - reload DGTS detector")
        detector = GamingDetector()  # Reload patterns
```

---

## Performance Benchmarks

| Operation | Target | Typical | Status |
|-----------|--------|---------|--------|
| History parsing | <1s | 400-600ms | ✅ |
| Statistics analysis | <2s | 1.2-1.5s | ✅ |
| Pattern discovery | <1s | 600-800ms | ✅ |
| Library update | <500ms | 200-300ms | ✅ |
| **Total evolution** | **<5s** | **2.5-3.5s** | ✅ |

**Breakdown** (30 days of history, 1000 violations):
- Read JSONL files: 500ms
- Calculate statistics: 1200ms
- Discover patterns: 700ms
- Update library: 250ms
- Overhead: 350ms

---

## Troubleshooting

### No Patterns Removed

**Problem**: Evolution reports 0 patterns removed, but some seem noisy

**Solutions**:
1. Check minimum detections: Need ≥10 detections for statistical significance
2. Increase lookback period: `--lookback-days 60`
3. Check false positive rate: Must be ≥70% for removal
4. Manually mark false positives in DGTS history

### No New Patterns Discovered

**Problem**: Evolution reports 0 new patterns discovered

**Solutions**:
1. Check occurrence threshold: Need ≥5 occurrences
2. Verify DGTS history exists and has violations
3. Check if patterns already covered by existing patterns
4. Increase lookback period for more data

### Threshold Changes Seem Wrong

**Problem**: Severity weights not changing as expected

**Solutions**:
1. Check accuracy calculation: Need ≥10 detections per severity
2. Verify false positive rates in history
3. Check threshold adjustment rules (>90% or <60%)
4. Review pattern statistics manually

### Evolution Taking Too Long

**Problem**: Evolution cycle takes >5s

**Solutions**:
1. Reduce lookback period: `--lookback-days 14`
2. Check DGTS history file size (>100MB may be slow)
3. Archive old history files
4. Profile with `time python pattern_evolution.py`

---

## Best Practices

### 1. Run Weekly Evolution
Schedule automatic evolution every week to keep patterns fresh.

### 2. Review Evolution Results
Check evolution history monthly to understand pattern trends.

### 3. Git Commit Pattern Changes
Commit pattern library updates for version control and team sharing.

### 4. Monitor False Positive Rates
Track FP rates over time - increasing rates indicate pattern drift.

### 5. Validate Discovered Patterns
Manually review discovered patterns before widespread deployment.

---

## Federated Learning (Future)

### Optional Central Aggregation

**Current**: Local evolution only (private)

**Future**: Optional sharing with central pattern registry

```python
# Opt-in pattern sharing
engine = PatternEvolutionEngine(
    enable_federation=True,  # Share anonymized patterns
    pattern_registry_url="https://patterns.pai.anthropic.com"
)

result = engine.evolve_patterns()

# After local evolution, optionally share discoveries
if result.patterns_added > 0:
    engine.share_patterns(
        patterns=result.new_patterns,
        anonymize=True  # Remove project-specific details
    )
```

**Benefits**:
- Community-driven pattern improvement
- Faster discovery of new gaming behaviors
- Shared learning across PAI installations

**Privacy**:
- Optional (opt-in only)
- Anonymized (no code or project details)
- Local-first (works offline)

---

## References

- **Federated Learning**: Google's FL research (privacy-preserving learning)
- **Pattern Evolution**: ESLint rule evolution (community-driven)
- **Statistical Significance**: Minimum sample sizes for accuracy
- **Incremental Analysis**: Real-time pattern adaptation

---

**Last Updated**: 2025-11-15
**Version**: 1.0.0
