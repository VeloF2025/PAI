# Clarity Framework Workflow

## Overview

This workflow implements the 10-point clarity assessment framework for analyzing user prompts and generating targeted clarification questions. It is used by the auto-meta-prompt-clarification.ts hook to automatically improve vague or underspecified prompts.

## 10-Point Assessment Dimensions

### 1. Objective (Weight: 1.2x)
**What to assess**: Is the desired outcome clear?

**Scoring criteria**:
- **9-10**: Crystal clear goal with measurable success criteria
  - Example: "Add user authentication with email/password, return JWT token, include password reset flow"
- **6-8**: Clear goal but missing some success criteria
  - Example: "Add user authentication" (missing specifics on method, tokens, flows)
- **3-5**: Vague goal with implied meaning
  - Example: "Improve authentication" (unclear what aspects need improvement)
- **0-2**: No clear objective
  - Example: "Fix the code" (what needs fixing? what's the desired state?)

**Question templates when score < 7**:
- "What specific outcome should this accomplish?"
- "What does success look like for this task?"
- "What specific problem are you trying to solve?"
- "What should change from the current state?"

### 2. Scope (Weight: 1.0x)
**What to assess**: Are boundaries clearly defined?

**Scoring criteria**:
- **9-10**: Explicit boundaries with inclusions/exclusions
  - Example: "Refactor authentication service only - do NOT touch authorization or session management"
- **6-8**: Clear boundaries but some ambiguity
  - Example: "Refactor authentication logic" (unclear if includes middleware, hooks, etc.)
- **3-5**: Implied scope with significant ambiguity
  - Example: "Improve auth system" (which parts? how deep?)
- **0-2**: No scope definition
  - Example: "Fix authentication" (entire system? specific bug? feature addition?)

**Question templates when score < 7**:
- "Which files/components should be modified?"
- "What should NOT be changed?"
- "Should this affect existing functionality?"
- "Are there any off-limits areas?"

### 3. Context (Weight: 1.1x)
**What to assess**: Is necessary background provided?

**Scoring criteria**:
- **9-10**: Complete context with current state, history, and constraints
  - Example: "Current auth uses Firebase but we're migrating to Clerk because Firebase Admin SDK causes bundle size issues (1.2MB). Need to maintain existing user sessions during migration."
- **6-8**: Good context but missing some details
  - Example: "Migrating from Firebase to Clerk authentication" (missing why, constraints, migration requirements)
- **3-5**: Minimal context
  - Example: "Switch to Clerk" (missing current state, migration needs)
- **0-2**: No context
  - Example: "Add Clerk" (is this new? replacing something? alongside existing auth?)

**Question templates when score < 7**:
- "What is the current state/implementation?"
- "Why is this change needed?"
- "What constraints or requirements exist?"
- "What related work has been done?"

### 4. Technical Specificity (Weight: 1.3x)
**What to assess**: Are technical requirements explicit?

**Scoring criteria**:
- **9-10**: Explicit tech stack, versions, patterns, and architecture
  - Example: "Use Next.js 14 App Router with Clerk SDK v5, implement middleware in middleware.ts using matcher pattern, protect routes via clerkMiddleware(), use useUser() hook for client components"
- **6-8**: Tech stack specified but missing implementation details
  - Example: "Use Clerk with Next.js" (missing versions, patterns, specific APIs)
- **3-5**: General tech mentioned
  - Example: "Add authentication to Next.js app" (no specific library or approach)
- **0-2**: No technical details
  - Example: "Add login" (no technology specified)

**Question templates when score < 7**:
- "Which specific libraries/frameworks should be used?"
- "What versions are required?"
- "Which APIs or patterns should be followed?"
- "Are there existing patterns to match?"

### 5. Quality Standards (Weight: 1.2x)
**What to assess**: Are quality expectations defined?

**Scoring criteria**:
- **9-10**: Explicit quality gates with measurable criteria
  - Example: "Must pass TypeScript strict mode (noImplicitAny), 100% test coverage with Vitest, zero ESLint errors, <200ms API response time, pass Playwright E2E tests for auth flows"
- **6-8**: Quality standards mentioned but not measurable
  - Example: "Follow best practices, add tests" (which practices? how many tests? what coverage?)
- **3-5**: Implied quality expectations
  - Example: "Make it production-ready" (what does that mean specifically?)
- **0-2**: No quality standards mentioned
  - Example: "Add feature" (no quality requirements)

**Question templates when score < 7**:
- "What testing is required?"
- "What code quality standards apply?"
- "What performance requirements exist?"
- "What documentation is needed?"

### 6. Constraints (Weight: 1.0x)
**What to assess**: Are limitations and requirements clear?

**Scoring criteria**:
- **9-10**: All constraints explicitly listed
  - Example: "Must work with existing Firebase users (legacy), maintain session compatibility, bundle size <50KB, support offline mode, complete in 2 days, no breaking changes to API"
- **6-8**: Major constraints mentioned but some missing
  - Example: "Keep bundle size small, support existing users" (how small? what migration path?)
- **3-5**: Few constraints mentioned
  - Example: "Don't break existing code" (which code? what's the definition of "break"?)
- **0-2**: No constraints mentioned
  - Example: "Add authentication" (no limitations specified)

**Question templates when score < 7**:
- "What are the time/budget constraints?"
- "What compatibility requirements exist?"
- "What performance limits apply?"
- "What must NOT change?"

### 7. Input/Output (Weight: 1.1x)
**What to assess**: Are data structures and formats clear?

**Scoring criteria**:
- **9-10**: Complete I/O specifications with types
  - Example: "Accept { email: string, password: string } from login form, validate with Zod schema, return { user: User, token: string, expiresAt: number } or throw AuthError with code property"
- **6-8**: I/O mentioned but incomplete types
  - Example: "Accept email/password, return user object" (what's in user object? error handling?)
- **3-5**: General I/O mentioned
  - Example: "Handle login credentials" (what format? what's returned?)
- **0-2**: No I/O specification
  - Example: "Add login" (no mention of data flow)

**Question templates when score < 7**:
- "What data should be accepted as input?"
- "What should be returned/produced?"
- "What format should inputs/outputs use?"
- "How should errors be handled?"

### 8. Priority (Weight: 0.9x)
**What to assess**: Is urgency and importance clear?

**Scoring criteria**:
- **9-10**: Clear priority with justification
  - Example: "CRITICAL: Production auth is broken, users can't login since 2pm, blocking all revenue. Drop everything else."
- **6-8**: Priority mentioned but not justified
  - Example: "High priority" (why? compared to what?)
- **3-5**: Implied priority
  - Example: "Need this soon" (how soon? why?)
- **0-2**: No priority indication
  - Example: "Add feature when you can"

**Question templates when score < 7**:
- "How urgent is this task?"
- "What's blocking on this?"
- "What's the deadline?"
- "What happens if delayed?"

### 9. Execution Strategy (Weight: 1.0x)
**What to assess**: Is the approach/methodology clear?

**Scoring criteria**:
- **9-10**: Explicit strategy with steps or pattern
  - Example: "Use TDD approach: 1) Write tests from requirements, 2) Implement minimal code to pass, 3) Refactor. Follow existing auth patterns in auth.service.ts"
- **6-8**: Strategy mentioned but not detailed
  - Example: "Follow existing patterns" (which patterns? where?)
- **3-5**: Vague approach
  - Example: "Do it carefully" (what does that mean?)
- **0-2**: No strategy mentioned
  - Example: "Add feature" (no approach specified)

**Question templates when score < 7**:
- "Should this follow any specific methodology?"
- "Are there existing patterns to follow?"
- "Should this be done incrementally or all at once?"
- "What's the preferred approach?"

### 10. Verification (Weight: 1.1x)
**What to assess**: Is validation/testing strategy clear?

**Scoring criteria**:
- **9-10**: Complete verification plan with specific tests
  - Example: "Verify with: 1) Unit tests for auth.service.ts (login, logout, refresh), 2) Integration tests for API routes, 3) E2E Playwright tests (happy path + error cases), 4) Manual test: login with test@example.com, check session persists after refresh"
- **6-8**: Testing mentioned but not comprehensive
  - Example: "Add tests" (which tests? what scenarios?)
- **3-5**: Vague verification
  - Example: "Make sure it works" (how?)
- **0-2**: No verification mentioned
  - Example: "Implement feature" (no testing requirements)

**Question templates when score < 7**:
- "How should this be tested?"
- "What scenarios need verification?"
- "How will we know it works correctly?"
- "What edge cases should be tested?"

## Scoring Algorithm

### Individual Dimension Score
```typescript
interface DimensionScore {
  dimension: string;
  score: number;        // 0-10
  weight: number;       // 0.9-1.3
  weighted: number;     // score * weight
  confidence: number;   // 0-1 (how confident in this score)
}
```

### Overall Score Calculation
```typescript
function calculateOverallScore(dimensions: DimensionScore[]): number {
  const totalWeighted = dimensions.reduce((sum, d) => sum + d.weighted, 0);
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  return totalWeighted / totalWeight; // Normalized to 0-10
}
```

### Complexity Classification
```typescript
function classifyComplexity(overallScore: number, prompt: string): string {
  // Word count factor
  const wordCount = prompt.split(/\s+/).length;

  // Technical depth factor (presence of technical terms)
  const technicalTerms = [
    'api', 'database', 'authentication', 'algorithm', 'refactor',
    'architecture', 'migration', 'optimization', 'integration', 'deployment'
  ];
  const technicalDepth = technicalTerms.filter(term =>
    prompt.toLowerCase().includes(term)
  ).length;

  // Complexity matrix
  if (overallScore >= 8 && wordCount > 100) return 'simple';
  if (overallScore >= 6 && wordCount > 50) return 'moderate';
  if (overallScore >= 4) return 'complex';
  if (technicalDepth >= 3) return 'complex';
  return 'underspecified';
}
```

## Question Generation Strategy

### Priority-Based Question Selection
```typescript
function generateQuestions(scores: DimensionScore[]): string[] {
  // Sort by weighted score (lowest = highest priority)
  const sorted = [...scores].sort((a, b) => a.weighted - b.weighted);

  const questions: string[] = [];

  // Always ask about lowest 3 dimensions
  for (let i = 0; i < Math.min(3, sorted.length); i++) {
    const dimension = sorted[i];
    if (dimension.score < 7) {
      questions.push(getQuestionTemplate(dimension.dimension, dimension.score));
    }
  }

  // Add critical dimensions if score < 5 (regardless of ranking)
  const critical = ['objective', 'technical_specificity', 'quality_standards'];
  for (const dim of critical) {
    const score = scores.find(s => s.dimension === dim);
    if (score && score.score < 5 && !questions.some(q => q.includes(dim))) {
      questions.push(getQuestionTemplate(dim, score.score));
    }
  }

  // Limit to 5 questions max (avoid overwhelming user)
  return questions.slice(0, 5);
}
```

### Question Template Selection
```typescript
function getQuestionTemplate(dimension: string, score: number): string {
  const templates = DIMENSION_TEMPLATES[dimension];

  // For very low scores (0-3), use fundamental questions
  if (score <= 3) return templates.fundamental;

  // For medium scores (4-6), use clarifying questions
  if (score <= 6) return templates.clarifying;

  // For near-miss scores (7-8), use refinement questions
  return templates.refinement;
}

const DIMENSION_TEMPLATES = {
  objective: {
    fundamental: "What specific outcome should this accomplish?",
    clarifying: "What does success look like for this task?",
    refinement: "Are there any specific success metrics or criteria?"
  },
  technical_specificity: {
    fundamental: "Which technologies/libraries should be used?",
    clarifying: "What specific APIs or patterns should be followed?",
    refinement: "Are there version requirements or preferred implementations?"
  },
  // ... (templates for all 10 dimensions)
};
```

## Integration with PAI Enhancement Tools

### Enhancement Tool Selection
```typescript
function selectEnhancementTools(
  complexity: string,
  dimensions: DimensionScore[]
): string[] {
  const tools: string[] = [];

  // Base enhancement based on complexity
  if (complexity === 'complex' || complexity === 'underspecified') {
    tools.push('enhance_research_prompt');
  } else {
    tools.push('enhance_coding_prompt');
  }

  // Add chain-of-thought if objective or execution unclear
  const objective = dimensions.find(d => d.dimension === 'objective');
  const execution = dimensions.find(d => d.dimension === 'execution_strategy');
  if ((objective?.score ?? 10) < 6 || (execution?.score ?? 10) < 6) {
    tools.push('add_chain_of_thought');
  }

  // Add XML formatting for complex structured tasks
  if (complexity === 'complex') {
    tools.push('add_xml_formatting');
  }

  // Always optimize for Claude
  tools.push('optimize_for_claude');

  return tools;
}
```

### Execution Strategy Determination
```typescript
function determineExecutionStrategy(
  complexity: string,
  scope: number,
  technicalSpecificity: number
): ExecutionStrategy {
  // Simple tasks: single agent
  if (complexity === 'simple' && scope >= 7) {
    return {
      type: 'single_agent',
      agents: ['general-purpose'],
      parallelization: false
    };
  }

  // Complex tasks with clear technical spec: sequential
  if (complexity === 'complex' && technicalSpecificity >= 7) {
    return {
      type: 'sequential',
      agents: ['Plan', 'general-purpose', 'general-purpose'],
      parallelization: false
    };
  }

  // Complex tasks with unclear spec: parallel exploration
  if (complexity === 'complex' && technicalSpecificity < 7) {
    return {
      type: 'parallel',
      agents: ['Explore', 'Explore', 'Explore'],
      parallelization: true,
      consolidation: 'general-purpose'
    };
  }

  // Default: moderate complexity
  return {
    type: 'sequential',
    agents: ['Plan', 'general-purpose'],
    parallelization: false
  };
}
```

## Output Format

### Clarification Response Structure
```typescript
interface ClarificationResponse {
  original_prompt: string;
  clarity_assessment: {
    overall_score: number;
    complexity: string;
    dimensions: DimensionScore[];
  };
  questions: string[];
  suggested_enhancements: {
    pai_tools: string[];
    execution_strategy: ExecutionStrategy;
  };
  estimated_impact: {
    time_saved_minutes: number;
    accuracy_improvement: number; // 0-1
    confidence: number; // 0-1
  };
}
```

### Example Output
```json
{
  "original_prompt": "improve authentication",
  "clarity_assessment": {
    "overall_score": 3.2,
    "complexity": "underspecified",
    "dimensions": [
      { "dimension": "objective", "score": 2, "weight": 1.2, "weighted": 2.4 },
      { "dimension": "scope", "score": 1, "weight": 1.0, "weighted": 1.0 },
      { "dimension": "context", "score": 3, "weight": 1.1, "weighted": 3.3 },
      { "dimension": "technical_specificity", "score": 2, "weight": 1.3, "weighted": 2.6 },
      { "dimension": "quality_standards", "score": 0, "weight": 1.2, "weighted": 0.0 }
    ]
  },
  "questions": [
    "What specific outcome should this accomplish? (e.g., add new auth method, fix security issue, improve performance)",
    "Which files/components should be modified and which should NOT be changed?",
    "What is the current authentication implementation and why does it need improvement?",
    "Which specific libraries/frameworks should be used?",
    "What testing and quality standards are required?"
  ],
  "suggested_enhancements": {
    "pai_tools": [
      "enhance_research_prompt",
      "add_chain_of_thought",
      "optimize_for_claude"
    ],
    "execution_strategy": {
      "type": "sequential",
      "agents": ["Plan", "general-purpose"],
      "parallelization": false
    }
  },
  "estimated_impact": {
    "time_saved_minutes": 45,
    "accuracy_improvement": 0.7,
    "confidence": 0.85
  }
}
```

## Usage in Hook

The auto-meta-prompt-clarification.ts hook will:

1. **Detect vague prompts** using `shouldTriggerClarification()`
2. **Run clarity assessment** using this workflow
3. **Generate questions** using `generateQuestions()`
4. **Inject into conversation** before Claude processes the original prompt
5. **Wait for user responses** or proceed with current clarity if user skips
6. **Apply PAI enhancements** using selected tools
7. **Execute with strategy** (single/sequential/parallel agents)

## Opt-Out Mechanisms

Users can skip clarification by:
- Setting `PAI_META_PROMPT_ENABLED=false` in environment
- Including `[skip clarification]` in prompt
- Providing prompts with overall_score >= 8 (auto-bypassed)

## Performance Targets

- **Assessment time**: <2 seconds for clarity scoring
- **Question generation**: <1 second
- **Total overhead**: <5 seconds before execution begins
- **User interruption**: Only when score < 6 (about 20-30% of prompts)
