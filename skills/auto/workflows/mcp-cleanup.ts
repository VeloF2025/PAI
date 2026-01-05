#!/usr/bin/env bun
/**
 * MCP Cleanup Utility - Windows-Compatible Process Cleanup
 * ==========================================================
 *
 * Safely cleans up MCP-related processes between ACH sessions:
 * 1. Uses `tasklist` to find MCP processes
 * 2. Filters for MCP-related keywords (playwright, mcp-server, chrome)
 * 3. Extracts specific PIDs
 * 4. Kills ONLY those PIDs (NEVER uses taskkill //F //IM)
 *
 * CRITICAL SAFETY RULE:
 * ❌ FORBIDDEN: taskkill //F //IM node.exe (kills ALL Node processes)
 * ✅ SAFE: taskkill //F //PID 12345 (kills only specific process)
 *
 * Pattern:
 *   tasklist → filter MCP keywords → extract PIDs → kill specific PIDs
 *
 * MCP-Related Processes:
 * - playwright (Playwright MCP server)
 * - mcp-server (Generic MCP servers)
 * - chrome, chromium (Playwright browser instances)
 * - node.exe (only if command line contains 'mcp')
 */

import { spawn } from 'child_process';

/**
 * Process information
 */
interface ProcessInfo {
  name: string;
  pid: number;
  sessionName: string;
  memUsage: string;
}

/**
 * Cleanup result
 */
interface CleanupResult {
  success: boolean;
  processesFound: number;
  processesKilled: number;
  pidsKilled: number[];
  errors: string[];
}

/**
 * MCP-related process keywords
 */
const MCP_KEYWORDS = ['playwright', 'mcp-server', 'chrome', 'chromium', 'mcp.exe'];

/**
 * MCP Cleanup Utility
 */
export class MCPCleanup {
  /**
   * Cleanup all MCP-related processes
   *
   * @returns Cleanup result
   */
  async cleanup(): Promise<CleanupResult> {
    console.log('🧹 [MCP Cleanup] Starting MCP process cleanup');

    const result: CleanupResult = {
      success: true,
      processesFound: 0,
      processesKilled: 0,
      pidsKilled: [],
      errors: [],
    };

    try {
      // Step 1: Get all processes using tasklist
      const processes = await this.getProcessList();

      // Step 2: Filter for MCP-related processes
      const mcpProcesses = this.filterMCPProcesses(processes);

      result.processesFound = mcpProcesses.length;

      if (mcpProcesses.length === 0) {
        console.log('✅ [MCP Cleanup] No MCP processes found');
        return result;
      }

      console.log(`🔍 [MCP Cleanup] Found ${mcpProcesses.length} MCP processes`);

      // Step 3: Kill each MCP process by PID
      for (const process of mcpProcesses) {
        const killed = await this.killProcessByPID(process.pid);

        if (killed) {
          result.processesKilled++;
          result.pidsKilled.push(process.pid);
          console.log(`   ✅ Killed ${process.name} (PID: ${process.pid})`);
        } else {
          result.errors.push(`Failed to kill ${process.name} (PID: ${process.pid})`);
          console.log(`   ⚠️  Failed to kill ${process.name} (PID: ${process.pid})`);
        }
      }

      console.log(`✅ [MCP Cleanup] Cleanup complete: ${result.processesKilled}/${result.processesFound} killed`);

      if (result.errors.length > 0) {
        result.success = false;
        console.log(`⚠️  [MCP Cleanup] ${result.errors.length} errors occurred`);
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Cleanup failed: ${error.message}`);
      console.error(`❌ [MCP Cleanup] Cleanup failed:`, error);
    }

    return result;
  }

  /**
   * Get process list using tasklist
   *
   * @returns Array of processes
   */
  private async getProcessList(): Promise<ProcessInfo[]> {
    return new Promise((resolve, reject) => {
      const proc = spawn('tasklist', [], { shell: true });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`tasklist failed: ${stderr}`));
          return;
        }

        const processes = this.parseTasklistOutput(stdout);
        resolve(processes);
      });

      proc.on('error', (error) => {
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        proc.kill();
        reject(new Error('tasklist timeout (10 seconds)'));
      }, 10000);
    });
  }

  /**
   * Parse tasklist output into process information
   *
   * tasklist output format:
   * Image Name                     PID Session Name        Mem Usage
   * ========================= ======== ================ ============
   * chrome.exe                    1234 Console             100,000 K
   *
   * @param output - tasklist output
   * @returns Array of process info
   */
  private parseTasklistOutput(output: string): ProcessInfo[] {
    const processes: ProcessInfo[] = [];
    const lines = output.split('\n');

    // Skip header lines (first 3 lines)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      // Split by whitespace (handles variable spacing)
      const parts = line.split(/\s+/);

      if (parts.length < 4) continue;

      // Parse process info
      const name = parts[0];
      const pid = parseInt(parts[1], 10);
      const sessionName = parts[2];
      const memUsage = parts[3];

      if (isNaN(pid)) continue;

      processes.push({
        name,
        pid,
        sessionName,
        memUsage,
      });
    }

    return processes;
  }

  /**
   * Filter processes for MCP-related keywords
   *
   * @param processes - All processes
   * @returns MCP-related processes
   */
  private filterMCPProcesses(processes: ProcessInfo[]): ProcessInfo[] {
    return processes.filter((process) => {
      const nameLower = process.name.toLowerCase();

      // Check if process name contains any MCP keywords
      return MCP_KEYWORDS.some((keyword) => nameLower.includes(keyword.toLowerCase()));
    });
  }

  /**
   * Kill process by specific PID (SAFE - never uses //IM flag)
   *
   * Uses: taskkill //F //PID <specific_pid>
   * NEVER uses: taskkill //F //IM <process_name>
   *
   * @param pid - Process ID to kill
   * @returns True if killed successfully
   */
  private async killProcessByPID(pid: number): Promise<boolean> {
    return new Promise((resolve) => {
      // CRITICAL SAFETY: Only kill specific PID, NEVER use //IM flag
      const proc = spawn('taskkill', ['/F', '/PID', pid.toString()], { shell: true });

      proc.on('close', (code) => {
        resolve(code === 0);
      });

      proc.on('error', () => {
        resolve(false);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        proc.kill();
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Check if any MCP processes are running
   *
   * @returns True if MCP processes found
   */
  async hasMCPProcesses(): Promise<boolean> {
    try {
      const processes = await this.getProcessList();
      const mcpProcesses = this.filterMCPProcesses(processes);
      return mcpProcesses.length > 0;
    } catch (error) {
      console.error(`⚠️  [MCP Cleanup] Error checking MCP processes:`, error);
      return false;
    }
  }

  /**
   * Get count of MCP processes
   *
   * @returns Number of MCP processes
   */
  async getMCPProcessCount(): Promise<number> {
    try {
      const processes = await this.getProcessList();
      const mcpProcesses = this.filterMCPProcesses(processes);
      return mcpProcesses.length;
    } catch (error) {
      console.error(`⚠️  [MCP Cleanup] Error counting MCP processes:`, error);
      return 0;
    }
  }
}

// CLI support
if (import.meta.main) {
  const cleanup = new MCPCleanup();

  const command = process.argv[2];

  switch (command) {
    case 'cleanup': {
      const result = await cleanup.cleanup();
      console.log('\nCleanup Result:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    }

    case 'check': {
      const hasMCP = await cleanup.hasMCPProcesses();
      console.log(`\nMCP Processes Running: ${hasMCP ? 'Yes' : 'No'}`);

      if (hasMCP) {
        const count = await cleanup.getMCPProcessCount();
        console.log(`Count: ${count}`);
      }

      process.exit(0);
    }

    case 'count': {
      const count = await cleanup.getMCPProcessCount();
      console.log(`\nMCP Process Count: ${count}`);
      process.exit(0);
    }

    default:
      console.log('MCP Cleanup Utility - Windows-Compatible Process Cleanup');
      console.log('Usage:');
      console.log('  bun mcp-cleanup.ts cleanup  - Clean up all MCP processes');
      console.log('  bun mcp-cleanup.ts check    - Check if MCP processes running');
      console.log('  bun mcp-cleanup.ts count    - Count MCP processes');
      console.log('\nImport and use in auto-orchestrator.ts:');
      console.log('  import { MCPCleanup } from "./mcp-cleanup";');
      console.log('  const cleanup = new MCPCleanup();');
      console.log('  await cleanup.cleanup();');
      process.exit(0);
  }
}
