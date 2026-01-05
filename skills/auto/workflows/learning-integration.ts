#!/usr/bin/env bun
/**
 * Learning Integration Bridge - Autonomous Workflow → PAI Learning Systems
 * =========================================================================
 *
 * Captures execution data from all workflow stages and feeds PAI learning systems:
 * 1. ACH Session Data - After each autonomous coding session
 * 2. PAI Phase Data - After each planning phase
 * 3. Completion Data - Final aggregated metrics
 *
 * Learning Systems (5 Components):
 * - Performance: Metrics and timing data
 * - Preferences: Agent choice patterns
 * - Patterns: Success/failure modes
 * - Realtime: Live monitoring
 * - Adaptive: Threshold adjustments
 *
 * Data Captured:
 * - Session duration, features completed, test pass rate
 * - Validation failures, retry patterns, gaming violations
 * - Implementation method effectiveness (ACH vs direct)
 * - Optimal session counts, checkpoint intervals
 * - Error patterns and recovery strategies
 */

import { existsSync } from 'fs';
import { join } from 'path';
import type { ValidationResult } from './completion-validator';

/**
 * ACH session result data
 */
export interface ACHSessionResult {
  sessionId: string;
  success: boolean;
  duration: number;
  featuresCompleted: number;
  testsPassed: number;
  testsFailed: number;
  testPassRate: number;
  validationResult?: ValidationResult;
  error?: string;
  retryCount?: number;
  gamingViolations?: number;
}

/**
 * PAI phase result data
 */
export interface PAIPhaseResult {
  phase: string;
  success: boolean;
  duration: number;
  nlnhConfidence: number;
  dgtsScore: number;
  completeness: number;
  validationErrors: string[];
  artifactsGenerated: string[];
  retryCount?: number;
}

/**
 * Final completion data
 */
export interface CompletionData {
  sessionId: string;
  totalDuration: number;
  paiPhasesCompleted: number;
  achSessionsCompleted: number;
  achSessionsFailed: number;
  totalFeaturesImplemented: number;
  overallTestPassRate: number;
  validationsPassed: number;
  validationsFailed: number;
  gamingViolations: number;
  retryAttempts: number;
  finalValidation: ValidationResult;
  implementationMethod: 'ach_autonomous' | 'direct_implementation';
  success: boolean;
}

/**
 * Learning metric types
 */
export type LearningMetricType =
  | 'ach_session_duration'
  | 'ach_features_per_session'
  | 'ach_test_pass_rate'
  | 'pai_phase_duration'
  | 'pai_nlnh_confidence'
  | 'pai_dgts_score'
  | 'validation_pass_rate'
  | 'retry_success_rate'
  | 'gaming_violation_rate'
  | 'overall_success_rate';

/**
 * Learning preference contexts
 */
export type PreferenceContext =
  | 'implementation_method'
  | 'validation_level'
  | 'checkpoint_interval'
  | 'max_sessions'
  | 'retry_strategy';

/**
 * Learning pattern types
 */
export type PatternType = 'success' | 'failure' | 'gaming' | 'recovery';

export class LearningIntegration {
  private learningDir: string;
  private enabled: boolean;

  constructor(learningDir: string = './.auto-learning', enabled: boolean = true) {
    this.learningDir = learningDir;
    this.enabled = enabled;

    if (this.enabled && !existsSync(this.learningDir)) {
      Bun.spawn(['mkdir', '-p', this.learningDir]);
    }
  }

  /**
   * Capture ACH session data after each autonomous coding session
   *
   * Feeds performance metrics, test results, and validation data
   *
   * @param sessionResult - ACH session result data
   */
  async captureSessionData(sessionResult: ACHSessionResult): Promise<void> {
    if (!this.enabled) return;

    console.log(`📊 [Learning] Capturing ACH session data: ${sessionResult.sessionId}`);

    // Performance metrics
    await this.recordMetric('ach_session_duration', sessionResult.duration, {
      sessionId: sessionResult.sessionId,
      success: sessionResult.success,
    });

    await this.recordMetric('ach_features_per_session', sessionResult.featuresCompleted, {
      sessionId: sessionResult.sessionId,
      duration: sessionResult.duration,
    });

    await this.recordMetric('ach_test_pass_rate', sessionResult.testPassRate, {
      sessionId: sessionResult.sessionId,
      testsPassed: sessionResult.testsPassed,
      testsFailed: sessionResult.testsFailed,
    });

    // Preferences - ACH autonomous implementation choice
    await this.recordPreference(
      'implementation_method',
      'ach_autonomous',
      sessionResult.success ? 'success' : 'failure',
      {
        duration: sessionResult.duration,
        featuresCompleted: sessionResult.featuresCompleted,
        testPassRate: sessionResult.testPassRate,
      }
    );

    // Patterns - Success or failure modes
    if (sessionResult.success) {
      await this.recordPattern('success', {
        sessionId: sessionResult.sessionId,
        featuresCompleted: sessionResult.featuresCompleted,
        testPassRate: sessionResult.testPassRate,
        duration: sessionResult.duration,
      });
    } else {
      await this.recordPattern('failure', {
        sessionId: sessionResult.sessionId,
        error: sessionResult.error,
        retryCount: sessionResult.retryCount,
        validationErrors: sessionResult.validationResult?.errors,
      });
    }

    // Gaming violations
    if (sessionResult.gamingViolations && sessionResult.gamingViolations > 0) {
      await this.recordMetric('gaming_violation_rate', sessionResult.gamingViolations, {
        sessionId: sessionResult.sessionId,
      });

      await this.recordPattern('gaming', {
        sessionId: sessionResult.sessionId,
        violations: sessionResult.gamingViolations,
      });
    }

    console.log(`✅ [Learning] ACH session data captured`);
  }

  /**
   * Capture PAI phase data after each planning phase
   *
   * Feeds phase metrics, validation results, and artifact generation data
   *
   * @param phaseResult - PAI phase result data
   */
  async capturePAIPhaseData(phaseResult: PAIPhaseResult): Promise<void> {
    if (!this.enabled) return;

    console.log(`📊 [Learning] Capturing PAI phase data: ${phaseResult.phase}`);

    // Performance metrics
    await this.recordMetric('pai_phase_duration', phaseResult.duration, {
      phase: phaseResult.phase,
      success: phaseResult.success,
    });

    await this.recordMetric('pai_nlnh_confidence', phaseResult.nlnhConfidence, {
      phase: phaseResult.phase,
    });

    await this.recordMetric('pai_dgts_score', phaseResult.dgtsScore, {
      phase: phaseResult.phase,
    });

    // Validation pass rate
    const validationPassed = phaseResult.validationErrors.length === 0;
    await this.recordMetric('validation_pass_rate', validationPassed ? 1 : 0, {
      phase: phaseResult.phase,
      errorCount: phaseResult.validationErrors.length,
    });

    // Patterns
    if (phaseResult.success) {
      await this.recordPattern('success', {
        phase: phaseResult.phase,
        nlnhConfidence: phaseResult.nlnhConfidence,
        dgtsScore: phaseResult.dgtsScore,
        artifactsGenerated: phaseResult.artifactsGenerated,
      });
    } else {
      await this.recordPattern('failure', {
        phase: phaseResult.phase,
        validationErrors: phaseResult.validationErrors,
        retryCount: phaseResult.retryCount,
      });
    }

    // Retry success patterns
    if (phaseResult.retryCount && phaseResult.retryCount > 0 && phaseResult.success) {
      await this.recordPattern('recovery', {
        phase: phaseResult.phase,
        retryCount: phaseResult.retryCount,
        finalOutcome: 'success',
      });

      await this.recordMetric('retry_success_rate', 1, {
        phase: phaseResult.phase,
        retryCount: phaseResult.retryCount,
      });
    }

    console.log(`✅ [Learning] PAI phase data captured`);
  }

  /**
   * Capture final completion data after entire workflow completes
   *
   * Aggregates all metrics and feeds comprehensive learning data
   *
   * @param completionData - Final completion data
   */
  async captureCompletionData(completionData: CompletionData): Promise<void> {
    if (!this.enabled) return;

    console.log(`📊 [Learning] Capturing final completion data: ${completionData.sessionId}`);

    // Overall success rate
    await this.recordMetric('overall_success_rate', completionData.success ? 1 : 0, {
      totalDuration: completionData.totalDuration,
      paiPhasesCompleted: completionData.paiPhasesCompleted,
      achSessionsCompleted: completionData.achSessionsCompleted,
    });

    // Aggregated test metrics
    await this.recordMetric('ach_test_pass_rate', completionData.overallTestPassRate, {
      sessionId: completionData.sessionId,
      totalFeaturesImplemented: completionData.totalFeaturesImplemented,
    });

    // Validation metrics
    await this.recordMetric(
      'validation_pass_rate',
      completionData.validationsPassed / (completionData.validationsPassed + completionData.validationsFailed),
      {
        validationsPassed: completionData.validationsPassed,
        validationsFailed: completionData.validationsFailed,
      }
    );

    // Gaming violations
    if (completionData.gamingViolations > 0) {
      await this.recordMetric('gaming_violation_rate', completionData.gamingViolations, {
        sessionId: completionData.sessionId,
      });
    }

    // Retry effectiveness
    if (completionData.retryAttempts > 0) {
      await this.recordMetric('retry_success_rate', completionData.success ? 1 : 0, {
        retryAttempts: completionData.retryAttempts,
      });
    }

    // Implementation method preference
    await this.recordPreference(
      'implementation_method',
      completionData.implementationMethod,
      completionData.success ? 'success' : 'failure',
      {
        totalDuration: completionData.totalDuration,
        totalFeaturesImplemented: completionData.totalFeaturesImplemented,
        overallTestPassRate: completionData.overallTestPassRate,
      }
    );

    // Adaptive threshold recommendations
    await this.adaptiveRecommendations(completionData);

    console.log(`✅ [Learning] Final completion data captured`);
  }

  /**
   * Record performance metric
   *
   * @param metricType - Type of metric
   * @param value - Metric value
   * @param metadata - Additional metadata
   */
  private async recordMetric(metricType: LearningMetricType, value: number, metadata: any): Promise<void> {
    const metricFile = join(this.learningDir, 'metrics.jsonl');

    const metric = {
      timestamp: new Date().toISOString(),
      metricType,
      value,
      metadata,
    };

    await Bun.write(metricFile, JSON.stringify(metric) + '\n', { createPath: true });
  }

  /**
   * Record preference choice
   *
   * @param context - Preference context
   * @param choice - Choice made
   * @param outcome - Outcome (success/failure)
   * @param metadata - Additional metadata
   */
  private async recordPreference(
    context: PreferenceContext,
    choice: string,
    outcome: 'success' | 'failure',
    metadata: any
  ): Promise<void> {
    const preferenceFile = join(this.learningDir, 'preferences.jsonl');

    const preference = {
      timestamp: new Date().toISOString(),
      context,
      choice,
      outcome,
      metadata,
    };

    await Bun.write(preferenceFile, JSON.stringify(preference) + '\n', { createPath: true });
  }

  /**
   * Record pattern observation
   *
   * @param patternType - Type of pattern
   * @param data - Pattern data
   */
  private async recordPattern(patternType: PatternType, data: any): Promise<void> {
    const patternFile = join(this.learningDir, 'patterns.jsonl');

    const pattern = {
      timestamp: new Date().toISOString(),
      patternType,
      data,
    };

    await Bun.write(patternFile, JSON.stringify(pattern) + '\n', { createPath: true });
  }

  /**
   * Generate adaptive recommendations based on completion data
   *
   * Analyzes metrics and suggests threshold adjustments
   *
   * @param completionData - Final completion data
   */
  private async adaptiveRecommendations(completionData: CompletionData): Promise<void> {
    const recommendations: any[] = [];

    // Session count optimization
    if (completionData.achSessionsCompleted < 10 && completionData.success) {
      recommendations.push({
        parameter: 'max_sessions',
        currentValue: 50,
        recommendedValue: 20,
        reason: 'Workflow completed with <10 sessions, reduce default max_sessions',
      });
    } else if (completionData.achSessionsCompleted >= 45 && !completionData.success) {
      recommendations.push({
        parameter: 'max_sessions',
        currentValue: 50,
        recommendedValue: 75,
        reason: 'Workflow hit max_sessions without completion, increase default',
      });
    }

    // Checkpoint interval optimization
    if (completionData.validationsFailed > 5) {
      recommendations.push({
        parameter: 'checkpoint_interval',
        currentValue: 5,
        recommendedValue: 3,
        reason: 'High validation failure rate, increase checkpoint frequency',
      });
    }

    // Gaming detection sensitivity
    if (completionData.gamingViolations > 10) {
      recommendations.push({
        parameter: 'dgts_threshold',
        currentValue: 0.3,
        recommendedValue: 0.2,
        reason: 'High gaming violation rate, increase DGTS sensitivity',
      });
    }

    // Save recommendations
    const recommendationFile = join(this.learningDir, 'adaptive-recommendations.jsonl');

    for (const rec of recommendations) {
      const record = {
        timestamp: new Date().toISOString(),
        sessionId: completionData.sessionId,
        ...rec,
      };

      await Bun.write(recommendationFile, JSON.stringify(record) + '\n', { createPath: true });
    }

    if (recommendations.length > 0) {
      console.log(`💡 [Learning] Generated ${recommendations.length} adaptive recommendations`);
    }
  }
}

// CLI support
if (import.meta.main) {
  console.log('Learning Integration Bridge - Autonomous Workflow Learning System');
  console.log('Usage: Import and use in auto-orchestrator.ts');
  console.log('\nExample:');
  console.log('  import { LearningIntegration } from "./learning-integration";');
  console.log('  const learning = new LearningIntegration();');
  console.log('  await learning.captureSessionData(sessionResult);');
  console.log('  await learning.capturePAIPhaseData(phaseResult);');
  console.log('  await learning.captureCompletionData(completionData);');
}
