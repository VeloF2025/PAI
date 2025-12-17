#!/usr/bin/env bun

/**
 * initialize-pai-session.ts
 *
 * Main PAI session initialization hook that runs at the start of every Claude Code session.
 *
 * What it does:
 * - Checks if this is a subagent session (skips for subagents)
 * - Tests that stop-hook is properly configured
 * - Sets initial terminal tab title
 * - Sends voice notification that system is ready (if voice server is running)
 * - Calls load-core-context.ts to inject PAI context into the session
 *
 * Setup:
 * 1. Set environment variables in settings.json:
 *    - DA: Your AI's name (e.g., "Kai", "Nova", "Assistant")
 *    - DA_VOICE_ID: Your ElevenLabs voice ID (if using voice system)
 *    - PAI_DIR: Path to your PAI directory (defaults to $HOME/.claude)
 * 2. Ensure load-core-context.ts exists in hooks/ directory
 * 3. Add both hooks to SessionStart in settings.json
 */

import { existsSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

async function sendNotification(title: string, message: string, priority: string = 'normal') {
  try {
    // Get voice ID from environment variable (customize in settings.json)
    const voiceId = process.env.DA_VOICE_ID || 'default-voice-id';

    const response = await fetch('http://localhost:8888/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        message,
        voice_enabled: true,
        priority,
        voice_id: voiceId
      }),
    });

    if (!response.ok) {
      console.error(`Notification failed: ${response.status}`);
    }
  } catch (error) {
    // Silently fail if voice server isn't running
    // console.error('Failed to send notification:', error);
  }
}

async function testStopHook() {
  const paiDir = process.env.PAI_DIR || join(homedir(), '.claude');
  const stopHookPath = join(paiDir, 'hooks/stop-hook.ts');

  console.error('\n🔍 Testing stop-hook configuration...');

  // Check if stop-hook exists
  if (!existsSync(stopHookPath)) {
    console.error('❌ Stop-hook NOT FOUND at:', stopHookPath);
    return false;
  }

  // Check if stop-hook is executable (skip on Windows - .ts files don't need +x)
  try {
    const stats = statSync(stopHookPath);
    const isWindows = process.platform === 'win32';
    const isExecutable = isWindows || (stats.mode & 0o111) !== 0;

    if (!isExecutable) {
      console.error('❌ Stop-hook exists but is NOT EXECUTABLE');
      return false;
    }

    console.error('✅ Stop-hook found and ready');

    // Set initial tab title (customize with your AI's name via DA env var)
    const daName = process.env.DA || 'AI Assistant';
    const tabTitle = `${daName} Ready`;

    process.stderr.write(`\x1b]0;${tabTitle}\x07`);
    process.stderr.write(`\x1b]2;${tabTitle}\x07`);
    process.stderr.write(`\x1b]30;${tabTitle}\x07`);
    console.error(`📍 Set initial tab title: "${tabTitle}"`);

    return true;
  } catch (e) {
    console.error('❌ Error checking stop-hook:', e);
    return false;
  }
}

async function checkPAIStatus() {
  const paiDir = process.env.PAI_DIR || join(homedir(), '.claude');
  const projectDir = process.cwd();

  // Count global skills
  const skillsDir = join(paiDir, 'skills');
  let globalSkills = 0;
  try {
    if (existsSync(skillsDir)) {
      const { readdir } = await import('fs/promises');
      const entries = await readdir(skillsDir, { withFileTypes: true });
      globalSkills = entries.filter(d => d.isDirectory()).length;
    }
  } catch (e) {
    // Silently ignore errors reading skills
  }

  // Count global hooks
  const hooksDir = join(paiDir, 'hooks');
  let globalHooks = 0;
  try {
    if (existsSync(hooksDir)) {
      const { readdir } = await import('fs/promises');
      const hookFiles = await readdir(hooksDir);
      globalHooks = hookFiles.filter(f => f.endsWith('.ts') || f.endsWith('.js')).length;
    }
  } catch (e) {
    // Silently ignore errors reading hooks
  }

  // Check for project-specific agents (check multiple locations)
  const projectAgentsPaths = [
    join(projectDir, '.claude', 'agents', 'project_agents.yaml'),  // New PAI location
    join(projectDir, '.archon', 'project_agents.yaml'),            // Legacy Archon location
  ];

  let projectAgents = 0;
  let projectComplexity = 'N/A';

  for (const projectAgentsFile of projectAgentsPaths) {
    if (existsSync(projectAgentsFile)) {
      try {
        const yaml = await Bun.file(projectAgentsFile).text();

        // Count agents under 'agents:' section (new format)
        const agentsMatch = yaml.match(/^agents:\s*$/m);
        if (agentsMatch) {
          // Count "- name:" entries under agents section
          const agentNameMatches = yaml.match(/^\s*- name:/gm);
          projectAgents = agentNameMatches ? agentNameMatches.length : 0;
        }

        // Also check for 'specialized_agents:' section (legacy format)
        if (projectAgents === 0) {
          const specializedAgentsMatch = yaml.match(/^specialized_agents:\s*$/m);
          if (specializedAgentsMatch) {
            const startIdx = yaml.indexOf('specialized_agents:');
            const afterStart = yaml.slice(startIdx + 'specialized_agents:'.length);
            const nextSectionMatch = afterStart.match(/\n[a-z_]+:/);
            const endIdx = nextSectionMatch ? startIdx + 'specialized_agents:'.length + afterStart.indexOf(nextSectionMatch[0]) : yaml.length;
            const agentsSection = yaml.slice(startIdx, endIdx);

            const agentMatches = agentsSection.match(/^  [a-z_]+_specialist:|^  [a-z_]+_agent:|^  [a-z_]+_architect:/gm);
            projectAgents = agentMatches ? agentMatches.length : 0;
          }
        }

        // Extract complexity score (try both formats)
        const complexityMatch = yaml.match(/complexity_score:\s*([\d.]+)/) || yaml.match(/complexity:\s*([\d.]+)/);
        if (complexityMatch) {
          projectComplexity = `${complexityMatch[1]}/10`;
        }

        // Found agents, no need to check other paths
        if (projectAgents > 0) break;
      } catch (e) {
        // Ignore errors reading project agents
      }
    }
  }

  // Check validation system
  const validationDir = join(paiDir, 'validation');
  const dgtsEnabled = existsSync(join(validationDir, 'dgts'));
  const nlnhEnabled = existsSync(join(validationDir, 'nlnh'));
  const projectFactoryEnabled = existsSync(join(validationDir, 'project_factory'));

  return {
    globalSkills,
    globalHooks,
    projectAgents,
    projectComplexity,
    validationEnabled: dgtsEnabled && nlnhEnabled && projectFactoryEnabled,
    projectDir
  };
}

async function displayPAIStatus() {
  const status = await checkPAIStatus();
  const daName = process.env.DA || 'AI Assistant';

  const statusBox = `
╔═══════════════════════════════════════════════════════════╗
║  🤖 ${daName.toUpperCase()} PAI SYSTEM ACTIVATED                       ║
╠═══════════════════════════════════════════════════════════╣
║  📦 Global Skills:        ${status.globalSkills.toString().padEnd(30)} ║
║  🔧 Global Hooks:         ${status.globalHooks.toString().padEnd(30)} ║
${status.projectAgents > 0
  ? `║  ⚡ Project Agents:       ${status.projectAgents.toString().padEnd(30)} ║
║  📊 Project Complexity:   ${status.projectComplexity.padEnd(30)} ║`
  : `║  ⚡ Project Agents:       Generating on first use...      ║`}
║  🛡️  Validation System:   ${status.validationEnabled ? '✅ Enabled' : '⚠️  Not Configured'}${status.validationEnabled ? '                      ' : '             '} ║
╠═══════════════════════════════════════════════════════════╣
║  📁 Project: ${status.projectDir.slice(-42).padEnd(42)} ║
╚═══════════════════════════════════════════════════════════╝
`;

  // Output to system reminder for Claude to display
  console.log(`<system-reminder>
PAI_STATUS_REPORT
${statusBox}
Claude: Please display this PAI status box to the user immediately.
</system-reminder>`);

  // Also try stderr for terminal visibility
  console.error(statusBox);
}

async function main() {
  try {
    // Check if this is a subagent session - if so, exit silently
    const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
    const isSubagent = claudeProjectDir.includes('/.claude/agents/') ||
                      process.env.CLAUDE_AGENT_TYPE !== undefined;

    if (isSubagent) {
      // This is a subagent session - exit silently without notification
      console.error('🤖 Subagent session detected - skipping session initialization');
      process.exit(0);
    }

    // Test stop-hook first (only for main sessions)
    const stopHookOk = await testStopHook();

    if (!stopHookOk) {
      console.error('\n⚠️ STOP-HOOK ISSUE DETECTED - Tab titles may not update automatically');
    }

    // Display PAI status report
    await displayPAIStatus();

    const daName = process.env.DA || 'AI Assistant';
    const message = `${daName} here, ready to go.`;

    // Note: PAI core context loading is handled by load-core-context.ts hook
    // which should run BEFORE this hook in settings.json SessionStart hooks

    await sendNotification(`${daName} Systems Initialized`, message, 'low');
    process.exit(0);
  } catch (error) {
    console.error('SessionStart hook error:', error);
    process.exit(1);
  }
}

main();
