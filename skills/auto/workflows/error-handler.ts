#!/usr/bin/env bun
/**
 * Error Handler - Intelligent Error Recovery for Autonomous Workflow
 * ===================================================================
 *
 * Handles errors across all workflow stages with intelligent retry logic:
 * 1. PAI Phase Validation Failures - Retry with protocol-specific fixes (max 3 attempts)
 * 2. ACH Session Crashes - Cleanup + retry with fresh context
 * 3. Max Iterations Reached - Generate partial completion report
 * 4. User Interrupt - Graceful shutdown + state preservation
 *
 * Intelligent Retry System:
 * - Analyzes error type (which protocol? which validation layer?)
 * - Generates protocol-specific fix suggestions
 * - Retries with intelligent fixes (max 3 attempts)
 * - Detects gaming patterns (identical errors, protocol switching)
 * - Escalates to user if retries exhausted
 *
 * Gaming Detection During Retries:
 * - Identical errors across attempts → Gaming score +0.2
 * - Protocol switching (trying different validators) → Gaming score +0.1
 * - Gaming score >0.5 → Warning + possible agent blocking
 */

import type { ValidationResult } from './completion-validator';
import type { WorkflowState } from './state-manager';
import type { ACHSessionResult } from './learning-integration';

/**
 * Error types
 */
export type ErrorType =
  | 'phase_validation_failure'
  | 'ach_session_crash'
  | 'max_iterations_reached'
  | 'user_interrupt'
  | 'handoff_failure'
  | 'learning_failure'
  | 'unknown';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Error context
 */
export interface ErrorContext {
  errorType: ErrorType;
  severity: ErrorSeverity;
  stage: number;
  phase?: string;
  sessionId?: string;
  error: Error | string;
  validationResult?: ValidationResult;
  state?: WorkflowState;
  retryCount?: number;
  metadata?: any;
}

/**
 * Error handling result
 */
export interface ErrorHandlingResult {
  handled: boolean;
  shouldRetry: boolean;
  shouldContinue: boolean;
  retryAttempt?: number;
  fixSuggestions?: string[];
  partialCompletion?: any;
  gamingScore?: number;
  error?: string;
}

/**
 * Protocol-specific fix suggestions
 */
interface ProtocolFixSuggestion {
  protocol: string;
  suggestion: string;
  autoFix?: boolean;
}

export class ErrorHandler {
  private maxRetries: number = 3;
  private retryHistory: Map<string, number> = new Map();
  private errorHistory: Map<string, string[]> = new Map();
  private gamingScores: Map<string, number> = new Map();

  constructor(maxRetries: number = 3) {
    this.maxRetries = maxRetries;
  }

  /**
   * Handle error with intelligent retry and recovery
   *
   * Main entry point for all error handling
   *
   * @param context - Error context
   * @returns Error handling result with retry/continue decisions
   */
  async handleError(context: ErrorContext): Promise<ErrorHandlingResult> {
    console.log(`\n⚠️  [Error Handler] Handling ${context.errorType} error`);

    // Route to specific handler
    switch (context.errorType) {
      case 'phase_validation_failure':
        return await this.handlePhaseValidationFailure(context);

      case 'ach_session_crash':
        return await this.handleACHSessionCrash(context);

      case 'max_iterations_reached':
        return await this.handleMaxIterations(context);

      case 'user_interrupt':
        return await this.handleUserInterrupt(context);

      case 'handoff_failure':
        return await this.handleHandoffFailure(context);

      default:
        return await this.handleUnknownError(context);
    }
  }

  /**
   * Handle PAI phase validation failure with intelligent retry
   *
   * Retry loop:
   * 1. Analyze validation errors (which protocol?)
   * 2. Generate protocol-specific fix suggestions
   * 3. Retry with fixes (max 3 attempts)
   * 4. Monitor for gaming patterns
   *
   * @param context - Error context
   * @returns Error handling result
   */
  async handlePhaseValidationFailure(context: ErrorContext): Promise<ErrorHandlingResult> {
    console.log(`🔄 [Error Handler] Phase validation failed: ${context.phase}`);

    const key = `phase_${context.phase}`;
    const retryCount = this.getRetryCount(key);

    // Check retry limit
    if (retryCount >= this.maxRetries) {
      console.log(`❌ [Error Handler] Max retries (${this.maxRetries}) reached for phase ${context.phase}`);

      return {
        handled: true,
        shouldRetry: false,
        shouldContinue: false,
        error: `Phase ${context.phase} validation failed after ${this.maxRetries} attempts`,
      };
    }

    // Analyze validation errors and generate fix suggestions
    const fixSuggestions = this.generateFixSuggestions(context.validationResult);

    // Check for gaming patterns
    const gamingScore = this.detectGamingPatterns(key, context.validationResult?.errors || []);

    if (gamingScore > 0.5) {
      console.log(`🚫 [Error Handler] Gaming detected (score: ${gamingScore.toFixed(2)}) - blocking retry`);

      return {
        handled: true,
        shouldRetry: false,
        shouldContinue: false,
        gamingScore,
        error: `Gaming patterns detected during phase ${context.phase} retries`,
      };
    }

    // Increment retry count
    this.incrementRetryCount(key);

    console.log(`🔄 [Error Handler] Retry attempt ${retryCount + 1}/${this.maxRetries}`);
    console.log(`💡 [Error Handler] Fix suggestions:`);
    fixSuggestions.forEach((fix) => console.log(`   - ${fix}`));

    return {
      handled: true,
      shouldRetry: true,
      shouldContinue: false,
      retryAttempt: retryCount + 1,
      fixSuggestions,
      gamingScore,
    };
  }

  /**
   * Handle ACH session crash with cleanup and retry
   *
   * Recovery steps:
   * 1. Cleanup MCP processes (Windows-compatible)
   * 2. Save current state
   * 3. Retry with fresh context (if within retry limit)
   *
   * @param context - Error context
   * @returns Error handling result
   */
  async handleACHSessionCrash(context: ErrorContext): Promise<ErrorHandlingResult> {
    console.log(`💥 [Error Handler] ACH session crashed: ${context.sessionId}`);

    const key = `ach_${context.sessionId}`;
    const retryCount = this.getRetryCount(key);

    // Check retry limit (ACH gets 2 retries per session)
    if (retryCount >= 2) {
      console.log(`❌ [Error Handler] Max retries (2) reached for session ${context.sessionId}`);

      return {
        handled: true,
        shouldRetry: false,
        shouldContinue: true, // Continue to next session
        error: `Session ${context.sessionId} failed after 2 attempts`,
      };
    }

    console.log(`🧹 [Error Handler] Step 1: Cleanup MCP processes`);
    // MCP cleanup handled by BOSS worker (autonomous_coding_worker.py)

    console.log(`💾 [Error Handler] Step 2: Saving state`);
    // State saved by state-manager

    console.log(`🔄 [Error Handler] Step 3: Retrying with fresh context`);
    this.incrementRetryCount(key);

    return {
      handled: true,
      shouldRetry: true,
      shouldContinue: false,
      retryAttempt: retryCount + 1,
      fixSuggestions: [
        'Spawn fresh ACH subprocess with clean context',
        'Ensure MCP processes cleaned up',
        'Verify feature_list.json is valid',
      ],
    };
  }

  /**
   * Handle max iterations reached - generate partial completion report
   *
   * Creates report of:
   * - Features completed vs total
   * - Tests passing vs failing
   * - Validation status
   * - Next steps for manual completion
   *
   * @param context - Error context
   * @returns Error handling result with partial completion report
   */
  async handleMaxIterations(context: ErrorContext): Promise<ErrorHandlingResult> {
    console.log(`⏱️  [Error Handler] Max iterations reached`);

    const partialCompletion = {
      status: 'partial_completion',
      stage: context.stage,
      phase: context.phase,
      sessionId: context.sessionId,
      metadata: context.metadata,
      nextSteps: [
        'Review completed features in project',
        'Check test results for failures',
        'Resume workflow with /auto resume',
        'Manually complete remaining features',
      ],
    };

    console.log(`📊 [Error Handler] Partial completion report generated`);
    console.log(`   Stage: ${context.stage}`);
    console.log(`   Phase: ${context.phase}`);
    console.log(`   Session: ${context.sessionId}`);
    console.log(`\n   Next steps:`);
    partialCompletion.nextSteps.forEach((step) => console.log(`   - ${step}`));

    return {
      handled: true,
      shouldRetry: false,
      shouldContinue: false,
      partialCompletion,
    };
  }

  /**
   * Handle user interrupt - graceful shutdown
   *
   * Graceful shutdown:
   * 1. Save current state to .auto-state.json
   * 2. Cleanup MCP processes
   * 3. Generate resume instructions
   *
   * @param context - Error context
   * @returns Error handling result
   */
  async handleUserInterrupt(context: ErrorContext): Promise<ErrorHandlingResult> {
    console.log(`🛑 [Error Handler] User interrupt detected`);

    console.log(`💾 [Error Handler] Step 1: Saving state`);
    // State saved by state-manager

    console.log(`🧹 [Error Handler] Step 2: Cleanup MCP processes`);
    // MCP cleanup handled by BOSS worker

    console.log(`📝 [Error Handler] Step 3: Generate resume instructions`);

    const partialCompletion = {
      status: 'user_interrupted',
      stage: context.stage,
      phase: context.phase,
      sessionId: context.sessionId,
      resumeInstructions: [
        'State saved to .auto-state.json',
        'To resume: /auto resume',
        'All progress preserved',
      ],
    };

    console.log(`\n🔄 [Error Handler] Resume instructions:`);
    partialCompletion.resumeInstructions.forEach((step) => console.log(`   - ${step}`));

    return {
      handled: true,
      shouldRetry: false,
      shouldContinue: false,
      partialCompletion,
    };
  }

  /**
   * Handle handoff failure between PAI and ACH
   *
   * @param context - Error context
   * @returns Error handling result
   */
  async handleHandoffFailure(context: ErrorContext): Promise<ErrorHandlingResult> {
    console.log(`🤝 [Error Handler] Handoff failure detected`);

    const fixSuggestions = [
      'Verify all PAI artifacts generated (PRD, feature_list.json)',
      'Check feature_list.json format is valid array',
      'Ensure project_root exists and is accessible',
      'Validate Stage 1 completion before handoff',
    ];

    console.log(`💡 [Error Handler] Fix suggestions:`);
    fixSuggestions.forEach((fix) => console.log(`   - ${fix}`));

    return {
      handled: true,
      shouldRetry: false,
      shouldContinue: false,
      fixSuggestions,
      error: 'Handoff from PAI to ACH failed - check artifacts',
    };
  }

  /**
   * Handle unknown error - log and escalate
   *
   * @param context - Error context
   * @returns Error handling result
   */
  async handleUnknownError(context: ErrorContext): Promise<ErrorHandlingResult> {
    console.log(`❓ [Error Handler] Unknown error type: ${context.errorType}`);
    console.error(context.error);

    return {
      handled: false,
      shouldRetry: false,
      shouldContinue: false,
      error: `Unknown error: ${context.error}`,
    };
  }

  /**
   * Generate protocol-specific fix suggestions
   *
   * Analyzes validation errors and suggests fixes based on protocol
   *
   * @param validationResult - Validation result with errors
   * @returns Array of fix suggestions
   */
  private generateFixSuggestions(validationResult?: ValidationResult): string[] {
    if (!validationResult || validationResult.errors.length === 0) {
      return ['No specific errors detected - retry may resolve transient issues'];
    }

    const suggestions: ProtocolFixSuggestion[] = [];

    validationResult.errors.forEach((error) => {
      // NLNH Protocol errors
      if (error.includes('NLNH confidence')) {
        suggestions.push({
          protocol: 'NLNH',
          suggestion: 'Add citations and references to increase confidence',
        });
        suggestions.push({
          protocol: 'NLNH',
          suggestion: 'Use "I don\'t know" when uncertain instead of guessing',
        });
      }

      // DGTS Protocol errors
      if (error.includes('DGTS') || error.includes('gaming')) {
        suggestions.push({
          protocol: 'DGTS',
          suggestion: 'Remove mock data and implement real functionality',
        });
        suggestions.push({
          protocol: 'DGTS',
          suggestion: 'Avoid commenting out validation rules',
        });
      }

      // Zero Tolerance errors
      if (error.includes('console.log')) {
        suggestions.push({
          protocol: 'Zero Tolerance',
          suggestion: 'Replace console.log with proper logger import',
          autoFix: true,
        });
      }

      if (error.includes('TypeScript')) {
        suggestions.push({
          protocol: 'Zero Tolerance',
          suggestion: 'Add explicit types, remove "any" types',
        });
      }

      // Doc-TDD errors
      if (error.includes('Tests missing')) {
        suggestions.push({
          protocol: 'Doc-TDD',
          suggestion: 'Create tests from PRD/PRP/ADR before implementation',
        });
      }

      // AntiHall errors
      if (error.includes('Code doesn\'t exist') || error.includes('AntiHall')) {
        suggestions.push({
          protocol: 'AntiHall',
          suggestion: 'Verify code exists with antihall:check command',
        });
      }
    });

    // Remove duplicates and return suggestions
    const uniqueSuggestions = Array.from(new Set(suggestions.map((s) => s.suggestion)));

    return uniqueSuggestions.length > 0
      ? uniqueSuggestions
      : ['Analyze validation errors and address root causes'];
  }

  /**
   * Detect gaming patterns during retries
   *
   * Gaming detection:
   * - Identical errors across attempts → Gaming score +0.2
   * - Protocol switching (trying different validators) → Gaming score +0.1
   * - Gaming score >0.5 → Warning + blocking
   *
   * @param key - Retry key (phase or session identifier)
   * @param currentErrors - Current validation errors
   * @returns Gaming score (0.0 = clean, 1.0 = heavily gamed)
   */
  private detectGamingPatterns(key: string, currentErrors: string[]): number {
    let gamingScore = this.gamingScores.get(key) || 0;

    // Get previous errors
    const previousErrors = this.errorHistory.get(key) || [];

    // Check for identical errors (gaming indicator)
    if (previousErrors.length > 0) {
      const identicalErrors = currentErrors.filter((err) => previousErrors.includes(err));

      if (identicalErrors.length === currentErrors.length && currentErrors.length > 0) {
        // All errors are identical - likely gaming
        gamingScore += 0.2;
        console.log(`⚠️  [Gaming Detection] Identical errors detected (+0.2 gaming score)`);
      }
    }

    // Check for protocol switching (trying different validators)
    const currentProtocols = this.extractProtocols(currentErrors);
    const previousProtocols = this.extractProtocols(previousErrors);

    if (previousProtocols.length > 0 && currentProtocols.length > 0) {
      const switched = currentProtocols.some((p) => !previousProtocols.includes(p));

      if (switched) {
        gamingScore += 0.1;
        console.log(`⚠️  [Gaming Detection] Protocol switching detected (+0.1 gaming score)`);
      }
    }

    // Save error history
    this.errorHistory.set(key, currentErrors);
    this.gamingScores.set(key, gamingScore);

    return gamingScore;
  }

  /**
   * Extract protocol names from error messages
   *
   * @param errors - Error messages
   * @returns Array of protocol names
   */
  private extractProtocols(errors: string[]): string[] {
    const protocols: string[] = [];

    errors.forEach((error) => {
      if (error.includes('NLNH')) protocols.push('NLNH');
      if (error.includes('DGTS')) protocols.push('DGTS');
      if (error.includes('Zero Tolerance')) protocols.push('Zero Tolerance');
      if (error.includes('Doc-TDD')) protocols.push('Doc-TDD');
      if (error.includes('AntiHall')) protocols.push('AntiHall');
    });

    return Array.from(new Set(protocols));
  }

  /**
   * Get retry count for a key
   *
   * @param key - Retry key
   * @returns Retry count
   */
  private getRetryCount(key: string): number {
    return this.retryHistory.get(key) || 0;
  }

  /**
   * Increment retry count for a key
   *
   * @param key - Retry key
   */
  private incrementRetryCount(key: string): void {
    const count = this.getRetryCount(key);
    this.retryHistory.set(key, count + 1);
  }

  /**
   * Reset retry count for a key
   *
   * @param key - Retry key
   */
  resetRetryCount(key: string): void {
    this.retryHistory.delete(key);
    this.errorHistory.delete(key);
    this.gamingScores.delete(key);
  }
}

// CLI support
if (import.meta.main) {
  console.log('Error Handler - Intelligent Error Recovery for Autonomous Workflow');
  console.log('Usage: Import and use in auto-orchestrator.ts');
  console.log('\nExample:');
  console.log('  import { ErrorHandler } from "./error-handler";');
  console.log('  const errorHandler = new ErrorHandler();');
  console.log('  const result = await errorHandler.handleError(errorContext);');
}
