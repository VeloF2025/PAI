#!/usr/bin/env bun

/**
 * PAI Auto-Bootstrap Hook
 *
 * Runs at SessionStart to ensure full PAI capabilities are available in ANY project.
 *
 * What it does:
 * 1. Loads default coding assistant configuration
 * 2. Detects project type (TypeScript, Python, Next.js, etc.)
 * 3. Checks if project-specific agents exist
 * 4. Auto-generates project agents if missing
 * 5. Initializes cross-project learning system
 * 6. Ensures MCP servers are available
 *
 * This hook makes PAI "just work" in any project without manual setup.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

// Types
interface ProjectInfo {
  name: string;
  type: string;
  language: string;
  framework?: string;
  complexity: number;
  hasExistingAgents: boolean;
  agentConfigPath?: string;
}

interface DefaultConfig {
  mcp_servers: Record<string, { always_available: boolean; auto_invoke_when: string[] }>;
  default_agents: Array<{ name: string; type: string; description: string }>;
  default_validation: {
    dgts: { threshold: number };
    nlnh: { confidence_threshold: number };
  };
}

// Paths
const PAI_DIR = process.env.PAI_DIR || join(homedir(), '.claude');
const CONFIG_PATH = join(PAI_DIR, 'config', 'default-coding-assistant.yaml');
const KNOWLEDGE_DIR = join(PAI_DIR, 'knowledge', 'cross-project');
const GLOBAL_MCP_CONFIG = join(PAI_DIR, '.mcp.json');
const PROJECT_ROOT = process.cwd();
const PROJECT_MCP_CONFIG = join(PROJECT_ROOT, '.mcp.json');

/**
 * Load default configuration
 */
function loadDefaultConfig(): DefaultConfig | null {
  try {
    if (existsSync(CONFIG_PATH)) {
      const content = readFileSync(CONFIG_PATH, 'utf-8');
      return parseYaml(content) as DefaultConfig;
    }
  } catch (error) {
    console.error('[pai-bootstrap] Warning: Could not load default config:', error);
  }
  return null;
}

/**
 * Detect project type from files and structure
 */
function detectProjectType(): ProjectInfo {
  const projectName = PROJECT_ROOT.split(/[/\\]/).pop() || 'unknown';

  // Detection indicators
  const indicators = {
    typescript: {
      files: ['tsconfig.json'],
      patterns: ['*.ts', '*.tsx'],
      detected: false,
    },
    javascript: {
      files: ['package.json'],
      patterns: ['*.js', '*.jsx'],
      detected: false,
    },
    python: {
      files: ['pyproject.toml', 'requirements.txt', 'setup.py', 'Pipfile'],
      detected: false,
    },
    nextjs: {
      files: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
      dirs: ['app', 'pages'],
      detected: false,
    },
    react: {
      packageDeps: ['react', 'react-dom'],
      detected: false,
    },
    fastapi: {
      packageDeps: ['fastapi'],
      detected: false,
    },
    django: {
      files: ['manage.py'],
      detected: false,
    },
    vue: {
      packageDeps: ['vue'],
      detected: false,
    },
    svelte: {
      packageDeps: ['svelte'],
      detected: false,
    },
    go: {
      files: ['go.mod', 'go.sum'],
      detected: false,
    },
    rust: {
      files: ['Cargo.toml'],
      detected: false,
    },
  };

  // Check file-based indicators
  for (const [type, config] of Object.entries(indicators)) {
    if ('files' in config) {
      for (const file of config.files) {
        if (existsSync(join(PROJECT_ROOT, file))) {
          config.detected = true;
          break;
        }
      }
    }
    if ('dirs' in config) {
      for (const dir of config.dirs) {
        if (existsSync(join(PROJECT_ROOT, dir))) {
          config.detected = true;
          break;
        }
      }
    }
  }

  // Check package.json dependencies
  const packageJsonPath = join(PROJECT_ROOT, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      for (const [type, config] of Object.entries(indicators)) {
        if ('packageDeps' in config) {
          for (const dep of config.packageDeps) {
            if (dep in allDeps) {
              config.detected = true;
              break;
            }
          }
        }
      }
    } catch {
      // Ignore package.json parse errors
    }
  }

  // Determine primary language and framework
  let language = 'unknown';
  let framework: string | undefined;

  if (indicators.typescript.detected) {
    language = 'typescript';
  } else if (indicators.javascript.detected) {
    language = 'javascript';
  } else if (indicators.python.detected) {
    language = 'python';
  } else if (indicators.go.detected) {
    language = 'go';
  } else if (indicators.rust.detected) {
    language = 'rust';
  }

  if (indicators.nextjs.detected) framework = 'nextjs';
  else if (indicators.react.detected) framework = 'react';
  else if (indicators.vue.detected) framework = 'vue';
  else if (indicators.svelte.detected) framework = 'svelte';
  else if (indicators.fastapi.detected) framework = 'fastapi';
  else if (indicators.django.detected) framework = 'django';

  // Calculate complexity (0-10)
  let complexity = 3; // Base complexity
  if (indicators.typescript.detected) complexity += 1;
  if (framework) complexity += 2;
  if (existsSync(join(PROJECT_ROOT, 'docker-compose.yml'))) complexity += 1;
  if (existsSync(join(PROJECT_ROOT, '.github'))) complexity += 1;
  if (existsSync(join(PROJECT_ROOT, 'tests')) || existsSync(join(PROJECT_ROOT, '__tests__'))) complexity += 1;

  // Check for existing agent config
  const agentConfigPaths = [
    join(PROJECT_ROOT, '.claude', 'agents', 'project_agents.yaml'),
    join(PROJECT_ROOT, '.archon', 'project_agents.yaml'),
  ];

  let hasExistingAgents = false;
  let agentConfigPath: string | undefined;

  for (const path of agentConfigPaths) {
    if (existsSync(path)) {
      hasExistingAgents = true;
      agentConfigPath = path;
      break;
    }
  }

  return {
    name: projectName,
    type: framework || language,
    language,
    framework,
    complexity: Math.min(complexity, 10),
    hasExistingAgents,
    agentConfigPath,
  };
}

/**
 * Generate project-specific agents based on detected type
 */
function generateProjectAgents(projectInfo: ProjectInfo): string {
  const agents: any[] = [];
  const customPatterns: any[] = [];

  // TypeScript/JavaScript agents
  if (projectInfo.language === 'typescript' || projectInfo.language === 'javascript') {
    agents.push({
      name: 'typescript-strict-enforcer',
      type: 'code-quality-reviewer',
      description: 'Enforces TypeScript strict mode and type safety',
      mcp_servers: ['context7', 'memory'],
      validation: {
        dgts: {
          threshold: 0.35,
          custom_patterns: [
            {
              id: 'TS_ANY_TYPE',
              severity: 'CRITICAL',
              regex: '\\bany\\b(?!\\s*\\()',
              description: "TypeScript 'any' type usage (strict mode violation)",
              category: 'type_safety',
            },
          ],
        },
        nlnh: { confidence_threshold: 0.85 },
        quality_gates: ['TYPE_CHECK_REQUIRED', 'NO_ANY_TYPES'],
      },
    });
  }

  // React agents
  if (projectInfo.framework === 'react' || projectInfo.framework === 'nextjs') {
    agents.push({
      name: 'react-best-practices-enforcer',
      type: 'code-implementer',
      description: 'Enforces React best practices and hooks rules',
      mcp_servers: ['context7', 'memory'],
      validation: {
        dgts: {
          threshold: 0.3,
          custom_patterns: [
            {
              id: 'REACT_MISSING_KEY',
              severity: 'MAJOR',
              regex: '\\.map\\(.*?\\)\\s*\\n.*?<.*?>(?!.*?key=)',
              description: 'Missing key prop in mapped elements',
              category: 'react_rules',
            },
          ],
        },
        nlnh: { confidence_threshold: 0.80 },
        quality_gates: ['HOOKS_RULES', 'COMPONENT_STRUCTURE'],
      },
    });
  }

  // Next.js specific agents
  if (projectInfo.framework === 'nextjs') {
    agents.push({
      name: 'nextjs-optimization-enforcer',
      type: 'performance-optimizer',
      description: 'Enforces Next.js performance best practices',
      mcp_servers: ['context7', 'memory'],
      validation: {
        dgts: {
          threshold: 0.3,
          custom_patterns: [
            {
              id: 'NEXTJS_IMG_TAG',
              severity: 'MAJOR',
              regex: '<img\\s+',
              description: 'Using <img> instead of Next.js Image component',
              category: 'performance',
            },
          ],
        },
        nlnh: { confidence_threshold: 0.80 },
        quality_gates: ['SSR_VALIDATION', 'IMAGE_OPTIMIZATION'],
      },
    });
  }

  // Python agents
  if (projectInfo.language === 'python') {
    agents.push({
      name: 'python-pep8-enforcer',
      type: 'code-quality-reviewer',
      description: 'Enforces Python PEP 8 and type hints',
      mcp_servers: ['context7', 'memory'],
      validation: {
        dgts: {
          threshold: 0.3,
          custom_patterns: [
            {
              id: 'PY_PRINT_STATEMENT',
              severity: 'MINOR',
              regex: '\\bprint\\s*\\(',
              description: 'Print statement instead of logging',
              category: 'code_quality',
            },
          ],
        },
        nlnh: { confidence_threshold: 0.75 },
        quality_gates: ['PEP8_COMPLIANCE', 'TYPE_HINTS_REQUIRED'],
      },
    });
  }

  // FastAPI agents
  if (projectInfo.framework === 'fastapi') {
    agents.push({
      name: 'fastapi-security-enforcer',
      type: 'security-auditor',
      description: 'Enforces FastAPI security best practices',
      mcp_servers: ['context7', 'memory'],
      validation: {
        dgts: {
          threshold: 0.35,
          custom_patterns: [
            {
              id: 'FASTAPI_NO_AUTH',
              severity: 'CRITICAL',
              regex: "@app\\.(get|post|put|delete)\\(.*?\\)(?!\\s*\\n.*?Depends)",
              description: 'API route without authentication dependency',
              category: 'security',
            },
          ],
        },
        nlnh: { confidence_threshold: 0.85 },
        quality_gates: ['SECURITY_AUDIT', 'PYDANTIC_VALIDATION'],
      },
    });
  }

  // Testing agent (always included)
  agents.push({
    name: 'testing-coverage-enforcer',
    type: 'test-coverage-validator',
    description: 'Enforces test coverage standards',
    mcp_servers: ['playwright', 'memory'],
    validation: {
      dgts: {
        threshold: 0.4,
        custom_patterns: [
          {
            id: 'TEST_NO_ASSERTIONS',
            severity: 'CRITICAL',
            regex: "(test|it)\\(['\"].*?['\"].*?\\).*?\\{(?!.*?(expect|assert))",
            description: 'Test without assertions',
            category: 'test_quality',
          },
        ],
      },
      nlnh: { confidence_threshold: 0.90 },
      quality_gates: ['COVERAGE_95_PERCENT', 'NO_FAKE_TESTS'],
    },
  });

  // Complexity manager for larger projects
  if (projectInfo.complexity >= 6) {
    agents.push({
      name: 'complexity-manager',
      type: 'code-refactoring-optimizer',
      description: 'Manages complexity and architecture',
      mcp_servers: ['sequential-thinking', 'memory'],
      validation: {
        dgts: {
          threshold: 0.4,
          custom_patterns: [
            {
              id: 'COMPLEXITY_LARGE_FUNCTION',
              severity: 'MAJOR',
              regex: '(def|function|const.*?=.*?{)[\\s\\S]{500,}',
              description: 'Function exceeds complexity limit (>500 chars)',
              category: 'complexity',
            },
          ],
        },
        nlnh: { confidence_threshold: 0.90 },
        quality_gates: ['ARCHITECTURE_VALIDATION', 'DOCUMENTATION_REQUIRED'],
      },
    });
  }

  // Generate YAML config
  const config = {
    project: {
      name: projectInfo.name,
      complexity: projectInfo.complexity,
      languages: {
        [projectInfo.language]: 100,
      },
      frameworks: projectInfo.framework ? [projectInfo.framework] : [],
      build_tools: [],
      testing_frameworks: [],
      databases: [],
      architecture_pattern: projectInfo.complexity >= 7 ? 'modular' : 'monolith',
      research_enabled: false,
    },
    mcp_integration: {
      context7: {
        auto_invoke_when: [
          'writing code with external libraries',
          'checking API patterns',
          'framework-specific implementation',
        ],
        usage: 'use context7 for [library] [version] documentation',
      },
      memory: {
        auto_invoke_when: [
          'session start (recall project patterns)',
          'session end (store learnings)',
          'referencing past decisions',
        ],
        usage: 'automatic entity storage/retrieval',
      },
      sequential_thinking: {
        auto_invoke_when: [
          'complex architectural decisions',
          'multi-step debugging',
          'trade-off analysis',
        ],
        usage: 'step-by-step reasoning chains',
      },
      playwright: {
        auto_invoke_when: ['E2E testing required', 'UI validation', 'browser automation'],
        usage: 'test execution and screenshots',
      },
      github: {
        auto_invoke_when: ['PR operations', 'issue management', 'code search'],
        usage: 'repository automation',
      },
    },
    agents,
  };

  return stringifyYaml(config);
}

/**
 * Initialize cross-project learning storage
 */
function initializeCrossProjectLearning(): void {
  if (!existsSync(KNOWLEDGE_DIR)) {
    mkdirSync(KNOWLEDGE_DIR, { recursive: true });

    // Create initial knowledge files
    const knowledgeFiles = {
      'patterns.json': { patterns: [], lastUpdated: new Date().toISOString() },
      'errors.json': { errors: [], lastUpdated: new Date().toISOString() },
      'optimizations.json': { optimizations: [], lastUpdated: new Date().toISOString() },
      'security.json': { security: [], lastUpdated: new Date().toISOString() },
    };

    for (const [file, content] of Object.entries(knowledgeFiles)) {
      writeFileSync(join(KNOWLEDGE_DIR, file), JSON.stringify(content, null, 2));
    }
  }
}

/**
 * Ensure MCP configuration is available at project root
 * This copies the global .mcp.json to project root if not present
 */
function ensureMCPConfiguration(): { copied: boolean; serverCount: number } {
  let copied = false;
  let serverCount = 0;

  // Check if project already has .mcp.json
  if (existsSync(PROJECT_MCP_CONFIG)) {
    try {
      const config = JSON.parse(readFileSync(PROJECT_MCP_CONFIG, 'utf-8'));
      serverCount = Object.keys(config.mcpServers || {}).length;
      console.error(`[pai-bootstrap] 🔌 Found existing .mcp.json with ${serverCount} servers`);
      return { copied: false, serverCount };
    } catch {
      console.error('[pai-bootstrap] ⚠️  Could not parse existing .mcp.json');
    }
  }

  // Check for global MCP config in multiple locations
  const globalMCPPaths = [
    GLOBAL_MCP_CONFIG,                                    // ~/.claude/.mcp.json
    join(PAI_DIR, '..', '.mcp.json'),                    // ~/.mcp.json (user home)
    join(PROJECT_ROOT, '.claude', '.mcp.json'),          // project/.claude/.mcp.json (common location)
    'C:/Jarvis/AI Workspace/Personal_AI_Infrastructure/.mcp.json', // PAI repo (known good source)
  ];

  let globalConfigFound = false;
  for (const globalPath of globalMCPPaths) {
    if (existsSync(globalPath)) {
      try {
        const globalConfig = JSON.parse(readFileSync(globalPath, 'utf-8'));
        serverCount = Object.keys(globalConfig.mcpServers || {}).length;

        // Copy global config to project root
        writeFileSync(PROJECT_MCP_CONFIG, JSON.stringify(globalConfig, null, 2));
        copied = true;
        globalConfigFound = true;
        console.error(`[pai-bootstrap] 🔌 Copied global .mcp.json to project (${serverCount} servers)`);
        break;
      } catch (error) {
        console.error(`[pai-bootstrap] ⚠️  Could not parse ${globalPath}:`, error);
      }
    }
  }

  if (!globalConfigFound) {
    // Create minimal MCP config with essential servers
    const minimalConfig = {
      mcpServers: {
        context7: {
          command: 'bunx',
          args: ['-y', '@upstash/context7-mcp@latest'],
          description: 'Real-time documentation for 33K+ libraries',
        },
        memory: {
          command: 'bunx',
          args: ['-y', '@modelcontextprotocol/server-memory'],
          description: 'Persistent knowledge graph across sessions',
        },
        playwright: {
          command: 'bunx',
          args: ['@playwright/mcp@latest', '--extension'],
          description: 'Browser automation and testing',
        },
        github: {
          command: 'bunx',
          args: ['-y', '@modelcontextprotocol/server-github'],
          env: {
            GITHUB_PERSONAL_ACCESS_TOKEN: '${GITHUB_TOKEN}',
          },
          description: 'GitHub repository automation',
        },
        'sequential-thinking': {
          command: 'bunx',
          args: ['-y', '@modelcontextprotocol/server-sequentialthinking'],
          description: 'Structured reasoning for complex problems',
        },
      },
    };

    writeFileSync(PROJECT_MCP_CONFIG, JSON.stringify(minimalConfig, null, 2));
    serverCount = Object.keys(minimalConfig.mcpServers).length;
    copied = true;
    console.error(`[pai-bootstrap] 🔌 Created .mcp.json with ${serverCount} essential servers`);
  }

  return { copied, serverCount };
}

/**
 * Add .mcp.json to .gitignore if not already there
 * This prevents accidentally committing MCP configs with sensitive tokens
 */
function addMCPToGitignore(): void {
  const gitignorePath = join(PROJECT_ROOT, '.gitignore');

  if (!existsSync(gitignorePath)) {
    // No .gitignore, create one with .mcp.json
    writeFileSync(gitignorePath, '# MCP configuration (may contain tokens)\n.mcp.json\n');
    console.error('[pai-bootstrap] 📝 Created .gitignore with .mcp.json');
    return;
  }

  // Check if .mcp.json is already in .gitignore
  const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
  if (gitignoreContent.includes('.mcp.json')) {
    return; // Already present
  }

  // Append .mcp.json to .gitignore
  const newContent = gitignoreContent.trimEnd() + '\n\n# MCP configuration (may contain tokens)\n.mcp.json\n';
  writeFileSync(gitignorePath, newContent);
  console.error('[pai-bootstrap] 📝 Added .mcp.json to .gitignore');
}

/**
 * Display bootstrap status
 */
function displayBootstrapStatus(
  projectInfo: ProjectInfo,
  agentsGenerated: boolean,
  agentCount: number,
  mcpResult: { copied: boolean; serverCount: number }
): void {
  const daName = process.env.DA || 'PAI';

  const mcpStatus = mcpResult.copied
    ? `✨ MCP: Configured ${mcpResult.serverCount} servers (run /mcp to verify)`
    : `✅ MCP: ${mcpResult.serverCount} servers available`;

  const statusBox = `
╔═══════════════════════════════════════════════════════════════╗
║  🚀 ${daName.toUpperCase()} AUTO-BOOTSTRAP COMPLETE                           ║
╠═══════════════════════════════════════════════════════════════╣
║  📁 Project: ${projectInfo.name.slice(0, 46).padEnd(46)} ║
║  🔤 Language: ${projectInfo.language.padEnd(45)} ║
${projectInfo.framework ? `║  🏗️  Framework: ${projectInfo.framework.padEnd(44)} ║\n` : ''}║  📊 Complexity: ${String(projectInfo.complexity + '/10').padEnd(44)} ║
╠═══════════════════════════════════════════════════════════════╣
${agentsGenerated ? `║  ✨ AUTO-GENERATED: ${agentCount} project-specific agents              ║` : `║  ✅ LOADED: ${agentCount} existing project agents                      ║`}
║  🔌 MCP: ${mcpResult.serverCount} servers configured (.mcp.json)              ║
║  🛡️  Validation: DGTS + NLNH active                           ║
║  📚 Cross-Project Learning: Enabled                           ║
╚═══════════════════════════════════════════════════════════════╝
`;

  console.error(statusBox);

  // Output for Claude to display
  const messages: string[] = [];
  if (agentsGenerated) {
    messages.push(`✨ Auto-generated ${agentCount} project-specific agents for ${projectInfo.framework || projectInfo.language}`);
  }
  if (mcpResult.copied) {
    messages.push(`🔌 MCP servers configured (${mcpResult.serverCount} servers) - restart session or run /mcp to verify`);
  }
  if (messages.length > 0) {
    console.log(`\n${messages.join('\n')}`);
  }
}

/**
 * Main bootstrap function
 */
async function main(): Promise<void> {
  try {
    // Skip for subagent sessions
    if (process.env.CLAUDE_AGENT_TYPE !== undefined) {
      process.exit(0);
    }

    console.error('\n[pai-bootstrap] 🔄 Starting PAI auto-bootstrap...');

    // 1. Load default configuration
    const defaultConfig = loadDefaultConfig();
    if (!defaultConfig) {
      console.error('[pai-bootstrap] ⚠️  Default config not found, using built-in defaults');
    }

    // 2. Detect project type
    const projectInfo = detectProjectType();
    console.error(`[pai-bootstrap] 📦 Detected: ${projectInfo.framework || projectInfo.language} project (complexity: ${projectInfo.complexity}/10)`);

    // 3. Ensure MCP configuration is available at project root
    const mcpResult = ensureMCPConfiguration();

    // 3b. Add .mcp.json to .gitignore (security: may contain tokens)
    if (mcpResult.copied) {
      addMCPToGitignore();
    }

    // 4. Initialize cross-project learning
    initializeCrossProjectLearning();
    console.error('[pai-bootstrap] 📚 Cross-project learning initialized');

    // 5. Check for existing agents or generate new ones
    let agentsGenerated = false;
    let agentCount = 0;

    if (!projectInfo.hasExistingAgents && projectInfo.language !== 'unknown') {
      // Generate project-specific agents
      console.error('[pai-bootstrap] 🤖 Generating project-specific agents...');

      const agentConfigYaml = generateProjectAgents(projectInfo);
      const configPath = join(PROJECT_ROOT, '.claude', 'agents', 'project_agents.yaml');

      // Create directory if needed
      const configDir = dirname(configPath);
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }

      // Write agent config
      writeFileSync(configPath, agentConfigYaml);

      agentsGenerated = true;
      projectInfo.agentConfigPath = configPath;

      // Count agents
      const config = parseYaml(agentConfigYaml);
      agentCount = config.agents?.length || 0;

      console.error(`[pai-bootstrap] ✅ Generated ${agentCount} agents at ${configPath}`);
    } else if (projectInfo.hasExistingAgents && projectInfo.agentConfigPath) {
      // Load existing agent count
      try {
        const existingConfig = parseYaml(readFileSync(projectInfo.agentConfigPath, 'utf-8'));
        agentCount = existingConfig.agents?.length || 0;
        console.error(`[pai-bootstrap] ✅ Loaded ${agentCount} existing agents from ${projectInfo.agentConfigPath}`);
      } catch {
        console.error('[pai-bootstrap] ⚠️  Could not parse existing agent config');
      }
    } else {
      console.error('[pai-bootstrap] ℹ️  Unknown project type - using default agents only');
    }

    // 6. Display status
    displayBootstrapStatus(projectInfo, agentsGenerated, agentCount, mcpResult);

    process.exit(0);
  } catch (error) {
    console.error('[pai-bootstrap] ❌ Bootstrap error:', error);
    process.exit(0); // Don't block session on errors
  }
}

main();
