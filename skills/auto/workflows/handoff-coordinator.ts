#!/usr/bin/env bun
/**
 * Handoff Coordinator - PAI Planning → ACH Autonomous Coding Transition
 * ======================================================================
 *
 * Coordinates the handoff from Stage 1 (PAI Planning) to Stage 2 (ACH Coding):
 * 1. Validates Stage 1 completion (all artifacts exist)
 * 2. Extracts artifact paths from planning output
 * 3. Constructs BOSS autonomous coding task
 * 4. Prepares ACH context with correct file paths
 *
 * Critical Validation Before Handoff:
 * - PRD.md exists (requirements document)
 * - app_spec.txt exists (consolidated specification for ACH)
 * - task_list.json exists (structured tasks)
 * - All Phase 1-6 validations passed
 *
 * BOSS Task Format:
 * {
 *   "task_type": "autonomous_coding",
 *   "project_root": "C:/Projects/my-app",
 *   "max_sessions": 50,
 *   "checkpoint_interval": 5,
 *   "autonomous_mode": true
 * }
 *
 * Note: Python ACH agent creates feature_list.json from app_spec.txt
 */

import { existsSync } from 'fs';
import { join } from 'path';
import type { AutoConfig } from '../config/auto-config';
import { CompletionValidator, type ValidationResult } from './completion-validator';

/**
 * Planning output from Stage 1 (PAI Workflow)
 */
export interface PlanningOutput {
  success: boolean;
  projectRoot: string;
  outputDir: string;
  artifacts: {
    prd?: string;
    prp?: string;
    adr?: string;
    taskList?: string;
    appSpec?: string;  // app_spec.txt synthesized from PRD+PRP+ADR
    implementationPlan?: string;
  };
  validation?: ValidationResult;
  nlnhConfidence?: number;
  dgtsScore?: number;
  completeness?: number;
}

/**
 * BOSS autonomous coding task structure
 */
export interface BOSSAutonomousTask {
  task_type: 'autonomous_coding';
  project_root: string;
  max_sessions: number;
  checkpoint_interval: number;
  autonomous_mode: boolean;
  session_id?: string;
  metadata?: {
    app_spec_path?: string;  // app_spec.txt location (Python agent reads this)
    prd_path?: string;
    prp_path?: string;
    adr_path?: string;
    task_list_path?: string;
    planning_validation?: ValidationResult;
  };
}

/**
 * Handoff result
 */
export interface HandoffResult {
  success: boolean;
  bossTask?: BOSSAutonomousTask;
  errors: string[];
  warnings: string[];
  validationResult?: ValidationResult;
}

export class HandoffCoordinator {
  private config: AutoConfig;
  private validator: CompletionValidator;

  constructor(config: AutoConfig) {
    this.config = config;
    this.validator = new CompletionValidator(config);
  }

  /**
   * Coordinate handoff from PAI Planning to ACH Autonomous Coding
   *
   * Validates Stage 1 completion and creates BOSS task for Stage 2
   *
   * @param planningOutput - Output from Stage 1 (PAI Planning)
   * @returns Handoff result with BOSS task or errors
   */
  async coordinateHandoff(planningOutput: PlanningOutput): Promise<HandoffResult> {
    console.log('\n🤝 [Handoff Coordinator] Starting PAI → ACH transition');

    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate Stage 1 completion
    console.log('📋 [Handoff] Step 1: Validating Stage 1 (PAI Planning) completion');
    const validationResult = await this.validator.validateStage1Complete(planningOutput);

    if (!validationResult.passed) {
      console.log('❌ [Handoff] Stage 1 validation FAILED');
      validationResult.errors.forEach(err => console.log(`   - ${err}`));

      return {
        success: false,
        errors: ['Stage 1 validation failed', ...validationResult.errors],
        warnings: validationResult.warnings,
        validationResult,
      };
    }

    console.log('✅ [Handoff] Stage 1 validation PASSED');

    // 2. Verify critical artifacts exist
    console.log('📋 [Handoff] Step 2: Verifying critical artifacts');
    const requiredArtifacts = this.verifyArtifacts(planningOutput, errors, warnings);

    if (errors.length > 0) {
      console.log('❌ [Handoff] Critical artifacts missing');
      errors.forEach(err => console.log(`   - ${err}`));

      return {
        success: false,
        errors,
        warnings,
        validationResult,
      };
    }

    console.log('✅ [Handoff] All critical artifacts verified');

    // 3. Prepare BOSS task
    console.log('📋 [Handoff] Step 3: Preparing BOSS autonomous coding task');
    const bossTask = this.prepareBOSSTask(planningOutput, requiredArtifacts);

    // 4. Final validation of BOSS task
    if (!this.validateBOSSTask(bossTask, errors)) {
      console.log('❌ [Handoff] BOSS task validation failed');
      errors.forEach(err => console.log(`   - ${err}`));

      return {
        success: false,
        errors,
        warnings,
        validationResult,
      };
    }

    console.log('✅ [Handoff] BOSS task prepared successfully');
    console.log(`   Project Root: ${bossTask.project_root}`);
    console.log(`   App Spec: ${bossTask.metadata?.app_spec_path}`);
    console.log(`   Max Sessions: ${bossTask.max_sessions}`);
    console.log(`   Checkpoint Interval: ${bossTask.checkpoint_interval}`);

    return {
      success: true,
      bossTask,
      errors: [],
      warnings,
      validationResult,
    };
  }

  /**
   * Verify all required artifacts exist
   *
   * @param planningOutput - Planning output with artifact paths
   * @param errors - Array to collect errors
   * @param warnings - Array to collect warnings
   * @returns Required artifact paths
   */
  private verifyArtifacts(
    planningOutput: PlanningOutput,
    errors: string[],
    warnings: string[]
  ): {
    projectRoot: string;
    appSpec: string;
    prd?: string;
    prp?: string;
    adr?: string;
    taskList?: string;
  } {
    const { projectRoot, artifacts } = planningOutput;

    // Critical artifacts (REQUIRED)
    if (!artifacts.appSpec) {
      errors.push('Missing critical artifact: app_spec.txt path');
    } else if (!existsSync(artifacts.appSpec)) {
      errors.push(`app_spec.txt not found at: ${artifacts.appSpec}`);
    }

    // Important artifacts (warnings if missing)
    if (!artifacts.prd) {
      warnings.push('Missing PRD.md path (ACH will have limited context)');
    } else if (!existsSync(artifacts.prd)) {
      warnings.push(`PRD.md not found at: ${artifacts.prd}`);
    }

    if (!artifacts.taskList) {
      warnings.push('Missing task_list.json path (ACH will generate tasks from app_spec)');
    } else if (!existsSync(artifacts.taskList)) {
      warnings.push(`task_list.json not found at: ${artifacts.taskList}`);
    }

    // Verify project root exists
    if (!existsSync(projectRoot)) {
      errors.push(`Project root does not exist: ${projectRoot}`);
    }

    return {
      projectRoot,
      appSpec: artifacts.appSpec || '',
      prd: artifacts.prd,
      prp: artifacts.prp,
      adr: artifacts.adr,
      taskList: artifacts.taskList,
    };
  }

  /**
   * Prepare BOSS autonomous coding task structure
   *
   * @param planningOutput - Planning output
   * @param artifacts - Verified artifact paths
   * @returns BOSS task ready for execution
   */
  private prepareBOSSTask(
    planningOutput: PlanningOutput,
    artifacts: ReturnType<typeof this.verifyArtifacts>
  ): BOSSAutonomousTask {
    // Generate unique session ID for tracking
    const sessionId = `ach-${Date.now()}`;

    return {
      task_type: 'autonomous_coding',
      project_root: artifacts.projectRoot,
      max_sessions: this.config.maxSessions,
      checkpoint_interval: this.config.checkpointInterval,
      autonomous_mode: true,
      session_id: sessionId,
      metadata: {
        app_spec_path: artifacts.appSpec,
        prd_path: artifacts.prd,
        prp_path: artifacts.prp,
        adr_path: artifacts.adr,
        task_list_path: artifacts.taskList,
        planning_validation: planningOutput.validation,
      },
    };
  }

  /**
   * Validate BOSS task structure
   *
   * Ensures all required fields are present and valid
   *
   * @param task - BOSS task to validate
   * @param errors - Array to collect errors
   * @returns True if valid
   */
  private validateBOSSTask(task: BOSSAutonomousTask, errors: string[]): boolean {
    // Required fields
    if (!task.task_type || task.task_type !== 'autonomous_coding') {
      errors.push('Invalid task_type (must be "autonomous_coding")');
    }

    if (!task.project_root) {
      errors.push('Missing required field: project_root');
    }

    if (!task.max_sessions || task.max_sessions < 1) {
      errors.push('Invalid max_sessions (must be >= 1)');
    }

    if (!task.checkpoint_interval || task.checkpoint_interval < 1) {
      errors.push('Invalid checkpoint_interval (must be >= 1)');
    }

    // Verify paths exist
    if (task.project_root && !existsSync(task.project_root)) {
      errors.push(`project_root does not exist: ${task.project_root}`);
    }

    // Verify app_spec.txt exists in metadata
    if (task.metadata?.app_spec_path && !existsSync(task.metadata.app_spec_path)) {
      errors.push(`app_spec_path does not exist: ${task.metadata.app_spec_path}`);
    }

    return errors.length === 0;
  }

  /**
   * Get handoff status summary
   *
   * @param planningOutput - Planning output to check
   * @returns Status summary
   */
  async getHandoffStatus(planningOutput: PlanningOutput): Promise<{
    ready: boolean;
    missingArtifacts: string[];
    validationIssues: string[];
  }> {
    const missingArtifacts: string[] = [];
    const validationIssues: string[] = [];

    // Check artifacts
    if (!planningOutput.artifacts.appSpec) {
      missingArtifacts.push('app_spec.txt');
    }

    if (!planningOutput.artifacts.prd) {
      missingArtifacts.push('PRD.md');
    }

    if (!planningOutput.artifacts.taskList) {
      missingArtifacts.push('task_list.json');
    }

    // Check validation
    if (planningOutput.validation && !planningOutput.validation.passed) {
      validationIssues.push(...planningOutput.validation.errors);
    }

    const ready = missingArtifacts.length === 0 && validationIssues.length === 0;

    return {
      ready,
      missingArtifacts,
      validationIssues,
    };
  }
}

// CLI support
if (import.meta.main) {
  console.log('Handoff Coordinator - PAI → ACH Transition');
  console.log('Usage: Import and use coordinateHandoff() method in auto-orchestrator.ts');
  console.log('\nExample:');
  console.log('  import { HandoffCoordinator } from "./handoff-coordinator";');
  console.log('  const coordinator = new HandoffCoordinator(config);');
  console.log('  const result = await coordinator.coordinateHandoff(planningOutput);');
}
