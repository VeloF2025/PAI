#!/usr/bin/env bun
/**
 * ACH Agent Bridge
 * =================
 *
 * Bridges TypeScript auto-orchestrator with Python autonomous-coding agent.
 * Spawns Python subprocess and manages communication, progress monitoring, and result capture.
 */

import { spawn, type ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Configuration for ACH agent execution
 */
export interface ACHAgentConfig {
  projectDir: string;           // Project directory (working directory for agent)
  model?: string;                // Claude model (default: claude-sonnet-4-5)
  maxIterations?: number;        // Max iterations (undefined = unlimited)
  pythonPath?: string;           // Python executable path (default: python)
  agentScriptPath?: string;      // Path to agent.py (default: auto-detect)
}

/**
 * Result from ACH agent execution
 */
export interface ACHAgentResult {
  success: boolean;              // Overall success status
  sessionCount: number;          // Number of sessions executed
  featuresCompleted: number;     // Number of features implemented
  duration: number;              // Total execution time (ms)
  error?: string;                // Error message if failed
  logs: string[];                // Captured log lines
  exitCode: number;              // Process exit code
}

/**
 * Progress callback for streaming updates
 */
export type ProgressCallback = (line: string) => void;

/**
 * ACH Agent Bridge
 *
 * Executes Python autonomous-coding agent from TypeScript orchestrator.
 */
export class ACHAgentBridge {
  private config: Required<ACHAgentConfig>;
  private process: ChildProcess | null = null;
  private logs: string[] = [];
  private startTime: number = 0;

  constructor(config: ACHAgentConfig) {
    this.config = {
      projectDir: config.projectDir,
      model: config.model || 'claude-sonnet-4-5',
      maxIterations: config.maxIterations,
      pythonPath: config.pythonPath || 'python',
      agentScriptPath: config.agentScriptPath || this.detectAgentScript(),
    };
  }

  /**
   * Auto-detect agent script location
   */
  private detectAgentScript(): string {
    // Default location: C:\Jarvis\AI Workspace\BOSS Exchange\autonomous-coding\autonomous_agent_demo.py
    // This is the CLI entry point (not agent.py which is a library module)
    const defaultPath = path.join(
      'C:',
      'Jarvis',
      'AI Workspace',
      'BOSS Exchange',
      'autonomous-coding',
      'autonomous_agent_demo.py'
    );

    return defaultPath;
  }

  /**
   * Execute the ACH autonomous coding agent
   *
   * @param onProgress - Optional callback for streaming progress updates
   * @returns Promise<ACHAgentResult> - Execution result
   */
  async execute(onProgress?: ProgressCallback): Promise<ACHAgentResult> {
    this.startTime = Date.now();
    this.logs = [];

    console.log(`🔗 [ACH Bridge] Starting Python autonomous-coding agent`);
    console.log(`   Project Dir: ${this.config.projectDir}`);
    console.log(`   Model: ${this.config.model}`);
    console.log(`   Max Iterations: ${this.config.maxIterations || 'Unlimited'}`);
    console.log(`   Agent Script: ${this.config.agentScriptPath}`);

    // Verify agent script exists
    try {
      await fs.access(this.config.agentScriptPath);
    } catch (error) {
      const errorMsg = `Agent script not found: ${this.config.agentScriptPath}`;
      console.error(`❌ [ACH Bridge] ${errorMsg}`);
      return {
        success: false,
        sessionCount: 0,
        featuresCompleted: 0,
        duration: Date.now() - this.startTime,
        error: errorMsg,
        logs: this.logs,
        exitCode: -1,
      };
    }

    // Verify project directory exists
    try {
      await fs.access(this.config.projectDir);
    } catch (error) {
      const errorMsg = `Project directory not found: ${this.config.projectDir}`;
      console.error(`❌ [ACH Bridge] ${errorMsg}`);
      return {
        success: false,
        sessionCount: 0,
        featuresCompleted: 0,
        duration: Date.now() - this.startTime,
        error: errorMsg,
        logs: this.logs,
        exitCode: -1,
      };
    }

    // Build command arguments for autonomous_agent_demo.py CLI
    const args = [
      this.config.agentScriptPath,
      '--project-dir',
      this.config.projectDir,
      '--model',
      this.config.model,
    ];

    if (this.config.maxIterations !== undefined) {
      args.push('--max-iterations', String(this.config.maxIterations));
    }

    console.log(`\n📡 [ACH Bridge] Spawning Python process...`);
    console.log(`   Command: ${this.config.pythonPath} ${args.join(' ')}\n`);

    return new Promise((resolve) => {
      // Spawn Python process
      this.process = spawn(this.config.pythonPath, args, {
        cwd: this.config.projectDir,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1', // Disable Python output buffering
        },
      });

      // Handle stdout (progress updates)
      this.process.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter((line) => line.trim());
        lines.forEach((line) => {
          this.logs.push(line);
          console.log(`   ${line}`);
          if (onProgress) {
            onProgress(line);
          }
        });
      });

      // Handle stderr (errors and warnings)
      this.process.stderr?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter((line) => line.trim());
        lines.forEach((line) => {
          this.logs.push(`[stderr] ${line}`);
          console.error(`   [stderr] ${line}`);
          if (onProgress) {
            onProgress(`[stderr] ${line}`);
          }
        });
      });

      // Handle process exit
      this.process.on('close', async (code) => {
        const duration = Date.now() - this.startTime;
        console.log(`\n✅ [ACH Bridge] Process exited with code ${code}`);
        console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);

        // Parse results from feature_list.json
        const result = await this.parseResults(code || 0, duration);
        resolve(result);
      });

      // Handle process errors
      this.process.on('error', (error) => {
        const duration = Date.now() - this.startTime;
        console.error(`❌ [ACH Bridge] Process error: ${error.message}`);
        resolve({
          success: false,
          sessionCount: 0,
          featuresCompleted: 0,
          duration,
          error: error.message,
          logs: this.logs,
          exitCode: -1,
        });
      });
    });
  }

  /**
   * Parse execution results from feature_list.json and logs
   */
  private async parseResults(exitCode: number, duration: number): Promise<ACHAgentResult> {
    const featureListPath = path.join(this.config.projectDir, 'feature_list.json');

    try {
      // Read feature_list.json to get completion status
      const featureListContent = await fs.readFile(featureListPath, 'utf-8');
      const featureList = JSON.parse(featureListContent);

      // Count completed features
      const featuresCompleted = featureList.features?.filter(
        (f: any) => f.status === 'completed'
      ).length || 0;

      const totalFeatures = featureList.features?.length || 0;

      // Count sessions from logs (look for "AUTONOMOUS CODING AGENT - SESSION" lines)
      const sessionCount = this.logs.filter((log) =>
        log.includes('AUTONOMOUS CODING AGENT - SESSION')
      ).length;

      // Determine success
      const success = exitCode === 0 && featuresCompleted === totalFeatures;

      console.log(`\n📊 [ACH Bridge] Results Summary:`);
      console.log(`   Success: ${success ? '✅' : '❌'}`);
      console.log(`   Sessions: ${sessionCount}`);
      console.log(`   Features Completed: ${featuresCompleted}/${totalFeatures}`);
      console.log(`   Exit Code: ${exitCode}`);

      return {
        success,
        sessionCount,
        featuresCompleted,
        duration,
        error: success ? undefined : `Exit code ${exitCode}, completed ${featuresCompleted}/${totalFeatures} features`,
        logs: this.logs,
        exitCode,
      };
    } catch (error) {
      // If feature_list.json doesn't exist or can't be parsed, infer from exit code
      console.warn(`⚠️  [ACH Bridge] Could not parse feature_list.json: ${error}`);

      const sessionCount = this.logs.filter((log) =>
        log.includes('AUTONOMOUS CODING AGENT - SESSION')
      ).length;

      return {
        success: exitCode === 0,
        sessionCount,
        featuresCompleted: 0,
        duration,
        error: exitCode !== 0 ? `Exit code ${exitCode}` : undefined,
        logs: this.logs,
        exitCode,
      };
    }
  }

  /**
   * Kill the running process (for cleanup or interrupts)
   */
  kill(): void {
    if (this.process) {
      console.log(`🛑 [ACH Bridge] Killing Python process...`);
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }
}
