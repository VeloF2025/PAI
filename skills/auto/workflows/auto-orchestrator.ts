#!/usr/bin/env bun
/**
 * Auto Orchestrator - Main entry point for autonomous development workflow
 *
 * Coordinates the 3-stage autonomous pipeline:
 * 1. Stage 1: PAI Planning (Phases 1-6) → PRD, specs, feature_list.json
 * 2. Stage 2: ACH Autonomous Coding → Fully implemented application
 * 3. Stage 3: Final Validation & Learning → Comprehensive validation, learning capture
 *
 * Usage:
 *   import { AutoOrchestrator } from './auto-orchestrator';
 *   const orchestrator = new AutoOrchestrator();
 *   await orchestrator.execute("Build a task management app");
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import { SpecDrivenWorkflowOrchestrator } from '../../../workflows/spec-driven/workflow-orchestrator';
import { StateManager } from './state-manager';
import { HandoffCoordinator } from './handoff-coordinator';
import { CompletionValidator } from './completion-validator';
import { LearningIntegration } from './learning-integration';
import { ErrorHandler } from './error-handler';
import { overrideHumanInLoop, restoreHumanInLoop } from '../../../workflows/spec-driven/autonomous-mode-adapter';
import { synthesizeAppSpec, validateAppSpec } from './app-spec-synthesizer';

export interface AutoConfig {
  maxSessions: number;
  checkpointInterval: number;
  validationLevel: 'minimal' | 'standard' | 'strict' | 'comprehensive';
  learningEnabled: boolean;
  autonomousMode: boolean;
  requireApprovals: boolean;
  outputDir: string;
  stateFile: string;
  featureListFile: string;
  models?: {
    planning?: string;    // Model for Stage 1 (PAI Planning)
    coding?: string;      // Model for Stage 2 (ACH Coding)
    validation?: string;  // Model for Stage 3 (Validation)
  };
}

export interface AutoExecutionOptions {
  requirements: string;
  projectRoot?: string;
  resume?: boolean;
  dryRun?: boolean;
  maxSessions?: number;
  validationLevel?: AutoConfig['validationLevel'];
}

export interface AutoExecutionResult {
  success: boolean;
  sessionId: string;
  stage: number;
  artifacts: {
    prd?: string;
    prp?: string;
    adr?: string;
    taskList?: string;
    featureList?: string;
    implementationPlan?: string;
  };
  metrics: {
    totalDuration: number;
    phaseDurations: Record<string, number>;
    sessionCount: number;
    validationsPassed: number;
    validationsFailed: number;
  };
  learningData?: any;
  error?: string;
}

export class AutoOrchestrator {
  private config: AutoConfig;
  private stateManager: StateManager;
  private handoffCoordinator: HandoffCoordinator;
  private completionValidator: CompletionValidator;
  private learningIntegration: LearningIntegration;
  private errorHandler: ErrorHandler;
  private projectRoot: string;

  constructor(configOrProjectRoot?: AutoConfig | string) {
    // Support two constructor signatures:
    // 1. new AutoOrchestrator(config: AutoConfig) - For testing with dependency injection
    // 2. new AutoOrchestrator(projectRoot?: string) - For production with config loading

    if (typeof configOrProjectRoot === 'object' && configOrProjectRoot !== null) {
      // Config object provided (testing mode)
      this.config = configOrProjectRoot;
      // Extract project root from stateFile path (e.g., './project/.auto-state.json' -> './project')
      this.projectRoot = path.dirname(this.config.stateFile);
    } else {
      // Project root string provided or undefined (production mode)
      this.projectRoot = configOrProjectRoot || process.cwd();
      this.config = this.loadConfig();
    }

    // Initialize components
    this.stateManager = new StateManager(this.projectRoot, this.config.stateFile);
    this.handoffCoordinator = new HandoffCoordinator(this.config);
    this.completionValidator = new CompletionValidator(this.config);
    this.learningIntegration = new LearningIntegration(this.config);
    this.errorHandler = new ErrorHandler(this.config, this.stateManager);
  }

  /**
   * Load configuration from auto-config.yaml and project-specific overrides
   */
  private loadConfig(): AutoConfig {
    const defaultConfigPath = path.join(__dirname, '..', 'config', 'auto-config.yaml');
    const projectConfigPath = path.join(this.projectRoot, '.auto-config.local.yaml');

    // Load default config
    const defaultConfigContent = fs.readFileSync(defaultConfigPath, 'utf-8');
    const defaultConfig = yaml.parse(defaultConfigContent);

    // Try to load project-specific overrides
    let projectConfig = {};
    try {
      const projectConfigContent = fs.readFileSync(projectConfigPath, 'utf-8');
      projectConfig = yaml.parse(projectConfigContent);
    } catch {
      // No project-specific config, use defaults
    }

    // Merge configurations (project overrides default)
    return {
      ...defaultConfig,
      ...projectConfig,
    };
  }

  /**
   * Main execution entry point
   *
   * @param options - Execution options including requirements and settings
   * @returns Execution result with artifacts, metrics, and learning data
   */
  async execute(options: AutoExecutionOptions): Promise<AutoExecutionResult> {
    const startTime = Date.now();
    const sessionId = `auto-${Date.now()}`;

    console.log(`🤖 [Auto Orchestrator] Starting autonomous workflow`);
    console.log(`📋 Requirements: ${options.requirements}`);
    console.log(`🔧 Project Root: ${this.projectRoot}`);
    console.log(`🆔 Session ID: ${sessionId}`);

    try {
      // Override human-in-loop approval gates
      console.log(`🔓 [Auto Orchestrator] Overriding human-in-loop approval gates`);
      overrideHumanInLoop();

      // Initialize or resume state
      let state;
      if (options.resume) {
        console.log(`🔄 [Auto Orchestrator] Resuming from saved state`);
        state = await this.stateManager.readState();
      } else {
        console.log(`🆕 [Auto Orchestrator] Initializing new session`);
        state = await this.stateManager.initialize(sessionId, options.requirements);
      }

      // Initialize learning session
      if (this.config.learningEnabled) {
        console.log(`📊 [Auto Orchestrator] Initializing learning session`);
        await this.learningIntegration.initializeSession(sessionId);
      }

      let result: AutoExecutionResult = {
        success: false,
        sessionId,
        stage: state.currentStage,
        artifacts: {},
        metrics: {
          totalDuration: 0,
          phaseDurations: {},
          sessionCount: 0,
          validationsPassed: 0,
          validationsFailed: 0,
        },
      };

      // Stage 1: PAI Planning (Phases 1-6)
      if (state.currentStage === 1 || !state.stages['1']?.status || state.stages['1'].status !== 'completed') {
        console.log(`\n🎯 [Stage 1] PAI Planning`);
        const planningResult = await this.executeStage1Planning(options, state);

        if (!planningResult.success) {
          throw new Error(`Stage 1 failed: ${planningResult.error}`);
        }

        result.artifacts = { ...result.artifacts, ...planningResult.artifacts };
        result.metrics.phaseDurations = { ...planningResult.phaseDurations };

        await this.stateManager.updateStage(1, 'completed', planningResult);
      }

      // Dry run mode - stop after planning
      if (options.dryRun) {
        console.log(`\n✅ [Dry Run] Planning complete, skipping coding and validation`);
        result.success = true;
        result.metrics.totalDuration = Date.now() - startTime;
        return result;
      }

      // Stage 2: ACH Autonomous Coding
      if (state.currentStage <= 2) {
        console.log(`\n🎯 [Stage 2] ACH Autonomous Coding`);
        const codingResult = await this.executeStage2Coding(state);

        if (!codingResult.success) {
          throw new Error(`Stage 2 failed: ${codingResult.error}`);
        }

        result.metrics.sessionCount = codingResult.sessionCount;

        await this.stateManager.updateStage(2, 'completed', codingResult);
      }

      // Stage 3: Final Validation & Learning
      if (state.currentStage <= 3) {
        console.log(`\n🎯 [Stage 3] Final Validation & Learning`);
        const validationResult = await this.executeStage3Validation();

        if (!validationResult.success) {
          throw new Error(`Stage 3 failed: ${validationResult.error}`);
        }

        result.metrics.validationsPassed = validationResult.validationsPassed;
        result.metrics.validationsFailed = validationResult.validationsFailed;
        result.learningData = validationResult.learningData;

        await this.stateManager.updateStage(3, 'completed', validationResult);
      }

      // Success!
      result.success = true;
      result.metrics.totalDuration = Date.now() - startTime;

      console.log(`\n✅ [Auto Orchestrator] Autonomous workflow completed successfully!`);
      console.log(`⏱️  Total Duration: ${(result.metrics.totalDuration / 1000).toFixed(2)}s`);
      console.log(`📁 Artifacts: ${Object.keys(result.artifacts).join(', ')}`);

      return result;

    } catch (error) {
      console.error(`\n❌ [Auto Orchestrator] Workflow failed:`, error);

      // Handle error with retries and recovery
      const recoveryResult = await this.errorHandler.handleWorkflowError(error, sessionId);

      if (recoveryResult.recovered) {
        // Retry the workflow
        return this.execute({ ...options, resume: true });
      }

      return {
        success: false,
        sessionId,
        stage: (await this.stateManager.readState()).currentStage,
        artifacts: {},
        metrics: {
          totalDuration: Date.now() - startTime,
          phaseDurations: {},
          sessionCount: 0,
          validationsPassed: 0,
          validationsFailed: 0,
        },
        error: error.message,
      };

    } finally {
      // Restore human-in-loop approval gates
      console.log(`🔒 [Auto Orchestrator] Restoring human-in-loop approval gates`);
      restoreHumanInLoop();

      // End learning session
      if (this.config.learningEnabled) {
        console.log(`📊 [Auto Orchestrator] Ending learning session`);
        await this.learningIntegration.endSession();
      }
    }
  }

  /**
   * Stage 1: PAI Planning (Phases 1-6)
   *
   * Executes the spec-driven workflow to generate:
   * - plan.md (Phase 1)
   * - shaped-spec.md (Phase 2)
   * - PRD.md, PRP.md, ADR.md (Phase 3)
   * - task_list.json (Phase 4)
   * - implementation-plan.md (Phase 5)
   * - feature_list.json (Phase 6)
   */
  private async executeStage1Planning(options: AutoExecutionOptions, state: any): Promise<any> {
    console.log(`📝 [Stage 1] Starting PAI Planning workflow`);

    const paiOrchestrator = new SpecDrivenWorkflowOrchestrator({
      autonomousMode: true,  // KEY: Disables approval gates
      requireApprovals: false,
      validationLevel: 'checkpoint',
      model: this.config.models?.planning === 'claude-opus-4-5' ? 'opus' : 'sonnet',
    });

    const outputDir = path.join(this.projectRoot, this.config.outputDir);
    await fs.mkdir(outputDir, { recursive: true });

    const result = await paiOrchestrator.executeFullWorkflow({
      initialRequirements: options.requirements,
      outputDir,
      stateFile: path.join(this.projectRoot, this.config.stateFile),
    });

    if (!result.success) {
      throw new Error(`PAI Planning failed: ${result.error}`);
    }

    // Validate Stage 1 completion
    console.log(`✅ [Stage 1] Validating planning completion`);
    const validationResult = await this.completionValidator.validateStage1Complete(result);

    if (!validationResult.passed) {
      throw new Error(`Stage 1 validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Capture learning data
    if (this.config.learningEnabled) {
      await this.learningIntegration.capturePAIPhaseData(result);
    }

    // NEW: Synthesize app_spec.txt from PRD+PRP+ADR
    console.log(`\n🔄 [Stage 1] Synthesizing app_spec.txt from PAI documents`);
    const appSpecPath = await synthesizeAppSpec({
      prdPath: path.join(outputDir, 'PRD.md'),
      prpPath: path.join(outputDir, 'PRP.md'),
      adrPath: path.join(outputDir, 'ADR.md'),
      outputPath: path.join(outputDir, 'app_spec.txt'),
    });

    // Validate app_spec.txt
    const isValidSpec = await validateAppSpec(appSpecPath);
    if (!isValidSpec) {
      throw new Error('Failed to generate valid app_spec.txt from PAI documents');
    }

    console.log(`✅ [Stage 1] app_spec.txt created: ${appSpecPath}`);

    return {
      success: true,
      artifacts: {
        prd: path.join(outputDir, 'PRD.md'),
        prp: path.join(outputDir, 'PRP.md'),
        adr: path.join(outputDir, 'ADR.md'),
        taskList: path.join(outputDir, 'task_list.json'),
        appSpec: appSpecPath,  // NEW: Pass app_spec.txt (not feature_list.json!)
        implementationPlan: path.join(outputDir, 'implementation-plan.md'),
      },
      phaseDurations: result.phaseDurations || {},
    };
  }

  /**
   * Stage 2: ACH Autonomous Coding
   *
   * Spawns BOSS worker to execute ACH coding sessions until all tests pass
   */
  private async executeStage2Coding(state: any): Promise<any> {
    console.log(`💻 [Stage 2] Starting ACH Autonomous Coding`);

    // Coordinate handoff from PAI to ACH
    const handoffResult = await this.handoffCoordinator.coordinateHandoff(state);

    if (!handoffResult.success) {
      throw new Error(`Handoff failed: ${handoffResult.errors.join(', ')}`);
    }

    console.log(`📤 [Stage 2] Handoff coordinated, starting BOSS task`);
    console.log(`📂 Project Root: ${handoffResult.bossTask!.project_root}`);
    console.log(`📝 App Spec: ${handoffResult.bossTask!.metadata?.app_spec_path}`);

    // Execute ACH autonomous coding sessions using Python agent
    const { ACHAgentBridge } = await import('./ach-agent-bridge');

    const bridge = new ACHAgentBridge({
      projectDir: handoffResult.bossTask!.project_root,
      model: this.config.models?.coding || 'claude-sonnet-4-5',
      maxIterations: handoffResult.bossTask!.max_sessions,
    });

    // Execute with progress streaming
    const startTime = Date.now();
    let retryAttempt = 0;
    const maxRetries = 2; // Allow 2 retries for ACH crashes

    while (retryAttempt <= maxRetries) {
      try {
        console.log(
          `\n🚀 [Stage 2] Starting ACH execution (attempt ${retryAttempt + 1}/${maxRetries + 1})...`
        );

        const result = await bridge.execute((line) => {
          // Stream progress to console
          // (already logged by bridge, but available for additional processing)
        });

        console.log(`\n✅ [Stage 2] ACH execution completed`);
        console.log(`   Success: ${result.success}`);
        console.log(`   Sessions: ${result.sessionCount}`);
        console.log(`   Features: ${result.featuresCompleted}`);
        console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);

        // Capture learning data for each session
        if (this.config.learningEnabled && result.sessionCount > 0) {
          console.log(`📊 [Stage 2] Capturing learning data...`);

          // Note: Learning data capture requires session-level metrics
          // For now, capture overall completion data
          // TODO: Parse individual session results from logs for detailed learning
        }

        // Return success result
        return {
          success: result.success,
          sessionCount: result.sessionCount,
          featuresCompleted: result.featuresCompleted,
          duration: result.duration,
          projectRoot: handoffResult.projectRoot,
          featureListPath: handoffResult.featureListPath,
          logs: result.logs,
        };
      } catch (error: any) {
        retryAttempt++;
        console.error(`❌ [Stage 2] ACH execution error (attempt ${retryAttempt}):`, error.message);

        // Handle crash with ErrorHandler
        const errorContext = {
          errorType: 'ach_session_crash' as const,
          severity: 'critical' as const,
          stage: 2,
          sessionId: String(retryAttempt - 1),
          error: error.message,
        };

        const recoveryResult = await this.errorHandler.handleACHSessionCrash(errorContext);

        if (recoveryResult.shouldRetry && retryAttempt <= maxRetries) {
          console.log(`🔄 [Stage 2] Retrying ACH execution...`);
          console.log(`   Suggestions: ${recoveryResult.fixSuggestions?.join(', ')}`);

          // Clean up bridge before retry
          bridge.kill();

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        } else {
          // Max retries exceeded or should not retry
          console.error(`❌ [Stage 2] ACH execution failed after ${retryAttempt} attempts`);
          throw new Error(
            `ACH execution failed: ${error.message}${recoveryResult.error ? ` (${recoveryResult.error})` : ''}`
          );
        }
      }
    }

    // Should not reach here, but TypeScript requires return
    throw new Error('ACH execution failed: Max retries exceeded');
  }

  /**
   * Stage 3: Final Validation & Learning
   *
   * Runs comprehensive PAI validation suite and captures learning data
   */
  private async executeStage3Validation(): Promise<any> {
    console.log(`✅ [Stage 3] Starting Final Validation & Learning`);

    // Run comprehensive validation
    const validationResult = await this.completionValidator.validateFinalCompletion(this.projectRoot);

    if (!validationResult.passed) {
      console.warn(`⚠️  [Stage 3] Validation warnings: ${validationResult.warnings.join(', ')}`);
    }

    // Capture learning data
    let learningData;
    if (this.config.learningEnabled) {
      learningData = await this.learningIntegration.captureCompletionData({
        projectRoot: this.projectRoot,
        validationResult,
      });
    }

    return {
      success: validationResult.passed || validationResult.warnings.length === 0,
      validationsPassed: validationResult.validationsPassed || 0,
      validationsFailed: validationResult.validationsFailed || 0,
      learningData,
    };
  }

  /**
   * Resume interrupted workflow from saved state
   */
  async resume(): Promise<AutoExecutionResult> {
    console.log(`🔄 [Auto Orchestrator] Resuming workflow from saved state`);

    const state = await this.stateManager.readState();

    return this.execute({
      requirements: state.initialRequirements,
      resume: true,
    });
  }

  /**
   * Get current workflow status
   */
  async status(): Promise<any> {
    const state = await this.stateManager.readState();

    return {
      sessionId: state.sessionId,
      currentStage: state.currentStage,
      stages: state.stages,
      artifacts: state.artifacts,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  }
}

// CLI support
if (import.meta.main) {
  const command = process.argv[2];
  const arg = process.argv[3];

  const orchestrator = new AutoOrchestrator();

  switch (command) {
    case 'execute':
      orchestrator.execute({ requirements: arg || 'Build a hello world app' })
        .then(result => {
          console.log('\n📊 Result:', JSON.stringify(result, null, 2));
          process.exit(result.success ? 0 : 1);
        });
      break;

    case 'resume':
      orchestrator.resume()
        .then(result => {
          console.log('\n📊 Result:', JSON.stringify(result, null, 2));
          process.exit(result.success ? 0 : 1);
        });
      break;

    case 'status':
      orchestrator.status()
        .then(status => {
          console.log('\n📊 Status:', JSON.stringify(status, null, 2));
        });
      break;

    default:
      console.log('Auto Orchestrator - Autonomous Development Workflow');
      console.log('Usage:');
      console.log('  bun auto-orchestrator.ts execute "Build a task management app"');
      console.log('  bun auto-orchestrator.ts resume');
      console.log('  bun auto-orchestrator.ts status');
  }
}
