#!/usr/bin/env bun
/**
 * State Manager - Manages .auto-state.json for crash recovery and resume
 *
 * Handles state persistence for the autonomous workflow:
 * - Initialize new sessions
 * - Update phase/stage/session progress
 * - Read state for resume capability
 * - Auto-save on every update (crash recovery)
 *
 * State File Structure:
 * {
 *   version: "1.0",
 *   sessionId: "auto-1733565000000",
 *   initialRequirements: "Build a task management app",
 *   currentStage: 2,
 *   stages: {
 *     "1": { name: "PAI Planning", status: "completed", phases: {...} },
 *     "2": { name: "ACH Coding", status: "in_progress", sessions: {...} }
 *   },
 *   artifacts: { prd: "...", featureList: "..." },
 *   createdAt: "2025-12-07T10:00:00.000Z",
 *   updatedAt: "2025-12-07T10:30:00.000Z"
 * }
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface WorkflowState {
  version: string;
  sessionId: string;
  initialRequirements: string;
  currentStage: number;
  stages: {
    [stageNumber: string]: StageState;
  };
  artifacts: {
    prd?: string;
    prp?: string;
    adr?: string;
    taskList?: string;
    featureList?: string;
    implementationPlan?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StageState {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  phases?: {
    [phaseNumber: string]: PhaseState;
  };
  sessions?: {
    [sessionNumber: string]: SessionState;
  };
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface PhaseState {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  validation?: any;
  error?: string;
  duration?: number;
}

export interface SessionState {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  featuresCompleted?: string[];
  testsCompleted?: number;
  testsPassed?: number;
  testsFailed?: number;
  duration?: number;
  error?: string;
}

export class StateManager {
  private projectRoot: string;
  private stateFile: string;
  private stateFilePath: string;
  private state: WorkflowState | null = null;

  constructor(projectRoot: string, stateFile: string) {
    this.projectRoot = projectRoot;
    this.stateFile = stateFile;
    this.stateFilePath = path.join(projectRoot, stateFile);
  }

  /**
   * Initialize a new workflow state
   */
  async initialize(sessionId: string, requirements: string): Promise<WorkflowState> {
    console.log(`📝 [State Manager] Initializing new workflow state`);

    this.state = {
      version: '1.0',
      sessionId,
      initialRequirements: requirements,
      currentStage: 1,
      stages: {
        '1': {
          name: 'PAI Planning',
          status: 'in_progress',
          phases: {
            '1': { name: 'Plan Product', status: 'pending' },
            '2': { name: 'Shape Spec', status: 'pending' },
            '3': { name: 'Write Spec', status: 'pending' },
            '4': { name: 'Create Tasks', status: 'pending' },
            '5': { name: 'Implement Prep', status: 'pending' },
            '6': { name: 'Orchestrate', status: 'pending' },
          },
        },
        '2': {
          name: 'ACH Autonomous Coding',
          status: 'pending',
          sessions: {},
        },
        '3': {
          name: 'Final Validation & Learning',
          status: 'pending',
        },
      },
      artifacts: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveState();

    return this.state;
  }

  /**
   * Read state from file (for resume)
   */
  async readState(): Promise<WorkflowState> {
    console.log(`📖 [State Manager] Reading state from ${this.stateFilePath}`);

    try {
      const content = await fs.readFile(this.stateFilePath, 'utf-8');
      this.state = JSON.parse(content);

      console.log(`✅ [State Manager] State loaded: Session ${this.state.sessionId}, Stage ${this.state.currentStage}`);

      return this.state;
    } catch (error) {
      throw new Error(`Failed to read state file: ${error.message}`);
    }
  }

  /**
   * Save current state to file
   */
  async saveState(): Promise<void> {
    if (!this.state) {
      throw new Error('No state to save');
    }

    this.state.updatedAt = new Date().toISOString();

    try {
      await fs.writeFile(this.stateFilePath, JSON.stringify(this.state, null, 2), 'utf-8');
      console.log(`💾 [State Manager] State saved to ${this.stateFilePath}`);
    } catch (error) {
      throw new Error(`Failed to save state file: ${error.message}`);
    }
  }

  /**
   * Update phase status
   */
  async updatePhase(
    stageNumber: number,
    phaseNumber: number,
    status: PhaseState['status'],
    data?: Partial<PhaseState>
  ): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    const stageKey = String(stageNumber);
    const phaseKey = String(phaseNumber);

    if (!this.state.stages[stageKey]?.phases) {
      throw new Error(`Stage ${stageNumber} has no phases`);
    }

    const phase = this.state.stages[stageKey].phases[phaseKey];
    if (!phase) {
      throw new Error(`Phase ${phaseNumber} not found in stage ${stageNumber}`);
    }

    // Update phase
    phase.status = status;
    if (data) {
      Object.assign(phase, data);
    }

    console.log(`📝 [State Manager] Updated Phase ${phaseNumber}: ${status}`);

    await this.saveState();
  }

  /**
   * Update stage status
   */
  async updateStage(
    stageNumber: number,
    status: StageState['status'],
    data?: Partial<StageState>
  ): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    const stageKey = String(stageNumber);

    if (!this.state.stages[stageKey]) {
      throw new Error(`Stage ${stageNumber} not found`);
    }

    // Update stage
    this.state.stages[stageKey].status = status;
    if (data) {
      Object.assign(this.state.stages[stageKey], data);
    }

    // Mark completion time
    if (status === 'completed') {
      this.state.stages[stageKey].completedAt = new Date().toISOString();

      // Advance to next stage if not last stage
      if (stageNumber < 3) {
        this.state.currentStage = stageNumber + 1;
        this.state.stages[String(stageNumber + 1)].status = 'in_progress';
        this.state.stages[String(stageNumber + 1)].startedAt = new Date().toISOString();
      }
    }

    console.log(`📝 [State Manager] Updated Stage ${stageNumber}: ${status}`);

    await this.saveState();
  }

  /**
   * Update session status (for ACH coding sessions)
   */
  async updateSession(
    sessionNumber: number,
    status: SessionState['status'],
    data?: Partial<SessionState>
  ): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    const sessionKey = String(sessionNumber);

    // Ensure Stage 2 has sessions object
    if (!this.state.stages['2'].sessions) {
      this.state.stages['2'].sessions = {};
    }

    // Initialize session if doesn't exist
    if (!this.state.stages['2'].sessions[sessionKey]) {
      this.state.stages['2'].sessions[sessionKey] = {
        status: 'pending',
      };
    }

    // Update session
    this.state.stages['2'].sessions[sessionKey].status = status;
    if (data) {
      Object.assign(this.state.stages['2'].sessions[sessionKey], data);
    }

    console.log(`📝 [State Manager] Updated Session ${sessionNumber}: ${status}`);

    await this.saveState();
  }

  /**
   * Add artifact path
   */
  async addArtifact(name: keyof WorkflowState['artifacts'], filePath: string): Promise<void> {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    this.state.artifacts[name] = filePath;

    console.log(`📝 [State Manager] Added artifact: ${name} -> ${filePath}`);

    await this.saveState();
  }

  /**
   * Get current state (without saving)
   */
  getState(): WorkflowState | null {
    return this.state;
  }

  /**
   * Check if state file exists
   */
  async stateExists(): Promise<boolean> {
    try {
      await fs.access(this.stateFilePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete state file (for cleanup)
   */
  async deleteState(): Promise<void> {
    try {
      await fs.unlink(this.stateFilePath);
      console.log(`🗑️  [State Manager] State file deleted`);
      this.state = null;
    } catch (error) {
      throw new Error(`Failed to delete state file: ${error.message}`);
    }
  }

  /**
   * Get stage summary for reporting
   */
  getStageSummary(stageNumber: number): StageState | null {
    if (!this.state) {
      return null;
    }

    return this.state.stages[String(stageNumber)] || null;
  }

  /**
   * Get phase summary for reporting
   */
  getPhaseSummary(stageNumber: number, phaseNumber: number): PhaseState | null {
    if (!this.state) {
      return null;
    }

    const stage = this.state.stages[String(stageNumber)];
    if (!stage?.phases) {
      return null;
    }

    return stage.phases[String(phaseNumber)] || null;
  }

  /**
   * Get all completed phases
   */
  getCompletedPhases(): PhaseState[] {
    if (!this.state) {
      return [];
    }

    const completed: PhaseState[] = [];

    Object.values(this.state.stages).forEach(stage => {
      if (stage.phases) {
        Object.values(stage.phases).forEach(phase => {
          if (phase.status === 'completed') {
            completed.push(phase);
          }
        });
      }
    });

    return completed;
  }

  /**
   * Get all completed sessions
   */
  getCompletedSessions(): SessionState[] {
    if (!this.state) {
      return [];
    }

    const completed: SessionState[] = [];

    const stage2 = this.state.stages['2'];
    if (stage2?.sessions) {
      Object.values(stage2.sessions).forEach(session => {
        if (session.status === 'completed') {
          completed.push(session);
        }
      });
    }

    return completed;
  }
}

// CLI support
if (import.meta.main) {
  const command = process.argv[2];
  const projectRoot = process.argv[3] || process.cwd();

  const stateManager = new StateManager(projectRoot, '.auto-state.json');

  switch (command) {
    case 'init': {
      const requirements = process.argv[4] || 'Test requirements';
      stateManager.initialize(`auto-${Date.now()}`, requirements)
        .then(state => {
          console.log('✅ State initialized:', JSON.stringify(state, null, 2));
        });
      break;
    }

    case 'read': {
      stateManager.readState()
        .then(state => {
          console.log('📖 Current state:', JSON.stringify(state, null, 2));
        });
      break;
    }

    case 'exists': {
      stateManager.stateExists()
        .then(exists => {
          console.log(`State file exists: ${exists}`);
        });
      break;
    }

    default:
      console.log('State Manager - Workflow State Persistence');
      console.log('Usage:');
      console.log('  bun state-manager.ts init [projectRoot] [requirements]');
      console.log('  bun state-manager.ts read [projectRoot]');
      console.log('  bun state-manager.ts exists [projectRoot]');
  }
}
