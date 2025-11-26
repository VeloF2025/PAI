#!/usr/bin/env bun
/**
 * Prompt Injection Guard Hook
 *
 * Detects and warns about potential prompt injection attempts in user input.
 * Based on 2025 security research showing 73% of AI deployments vulnerable.
 *
 * Runs on: PreToolUse (before tool execution)
 * Action: Warn (non-blocking) or Block (if critical pattern detected)
 */

interface HookInput {
  session_id: string;
  tool_name: string;
  tool_input: Record<string, unknown>;
  transcript_path?: string;
}

interface InjectionPattern {
  id: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  block: boolean;
}

// Prompt injection detection patterns
const INJECTION_PATTERNS: InjectionPattern[] = [
  // Role manipulation attempts
  {
    id: 'ROLE_OVERRIDE',
    pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/i,
    severity: 'critical',
    description: 'Attempt to override system instructions',
    block: true,
  },
  {
    id: 'NEW_ROLE',
    pattern: /you\s+are\s+now\s+(a|an|the)\s+/i,
    severity: 'high',
    description: 'Attempt to assign new role/persona',
    block: false,
  },
  {
    id: 'SYSTEM_PROMPT_LEAK',
    pattern: /reveal\s+(your\s+)?(system\s+)?prompt|show\s+(me\s+)?(your\s+)?instructions/i,
    severity: 'high',
    description: 'Attempt to extract system prompt',
    block: false,
  },

  // Jailbreak attempts
  {
    id: 'DAN_JAILBREAK',
    pattern: /\bDAN\b.*?(do\s+anything|jailbreak|unrestricted)/i,
    severity: 'critical',
    description: 'DAN-style jailbreak attempt',
    block: true,
  },
  {
    id: 'DEVELOPER_MODE',
    pattern: /developer\s+mode|maintenance\s+mode|debug\s+mode/i,
    severity: 'high',
    description: 'Fake developer/debug mode activation',
    block: false,
  },

  // Delimiter injection
  {
    id: 'FAKE_SYSTEM',
    pattern: /<\/?system>|```system|###\s*system/i,
    severity: 'high',
    description: 'Fake system message delimiters',
    block: false,
  },
  {
    id: 'XML_INJECTION',
    pattern: /<\/?(?:assistant|user|tool_result|function_call)[^>]*>/i,
    severity: 'medium',
    description: 'XML tag injection attempt',
    block: false,
  },

  // Instruction smuggling
  {
    id: 'HIDDEN_INSTRUCTION',
    pattern: /\[INST\]|\[\/INST\]|<<SYS>>|<\/SYS>>/i,
    severity: 'high',
    description: 'Hidden instruction markers (Llama-style)',
    block: false,
  },
  {
    id: 'BASE64_PAYLOAD',
    pattern: /eval\s*\(\s*atob\s*\(|base64\s*decode.*execute/i,
    severity: 'critical',
    description: 'Encoded payload execution attempt',
    block: true,
  },

  // Social engineering
  {
    id: 'PRETEND_ADMIN',
    pattern: /i\s+am\s+(the\s+)?(admin|administrator|developer|owner|creator)/i,
    severity: 'medium',
    description: 'Fake authority claim',
    block: false,
  },
  {
    id: 'EMERGENCY_OVERRIDE',
    pattern: /emergency\s+(override|bypass|access)|safety\s+override/i,
    severity: 'high',
    description: 'Fake emergency override claim',
    block: false,
  },

  // Data exfiltration
  {
    id: 'CREDENTIAL_REQUEST',
    pattern: /(?:show|reveal|print|output)\s+(?:all\s+)?(?:api\s*keys?|tokens?|passwords?|credentials?|secrets?)/i,
    severity: 'critical',
    description: 'Credential extraction attempt',
    block: true,
  },
  {
    id: 'ENV_LEAK',
    pattern: /process\.env|os\.environ|getenv\s*\(|environment\s+variables?/i,
    severity: 'high',
    description: 'Environment variable access attempt',
    block: false,
  },
];

/**
 * Check text for injection patterns
 */
function detectInjection(text: string): InjectionPattern[] {
  const detected: InjectionPattern[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.pattern.test(text)) {
      detected.push(pattern);
    }
  }

  return detected;
}

/**
 * Deep search through tool input for injection patterns
 */
function scanToolInput(input: Record<string, unknown>): InjectionPattern[] {
  const allDetected: InjectionPattern[] = [];

  function scan(obj: unknown): void {
    if (typeof obj === 'string') {
      const detected = detectInjection(obj);
      allDetected.push(...detected);
    } else if (Array.isArray(obj)) {
      obj.forEach(scan);
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(scan);
    }
  }

  scan(input);
  return allDetected;
}

/**
 * Format detection results for output
 */
function formatDetectionReport(detected: InjectionPattern[]): string {
  if (detected.length === 0) return '';

  const criticalCount = detected.filter(d => d.severity === 'critical').length;
  const highCount = detected.filter(d => d.severity === 'high').length;

  let report = '\n⚠️ PROMPT INJECTION GUARD\n';
  report += '═'.repeat(40) + '\n';
  report += `Detected ${detected.length} suspicious pattern(s):\n\n`;

  for (const d of detected) {
    const icon = d.severity === 'critical' ? '🚨' : d.severity === 'high' ? '⚠️' : '⚡';
    report += `${icon} [${d.severity.toUpperCase()}] ${d.id}\n`;
    report += `   ${d.description}\n`;
    if (d.block) {
      report += `   ACTION: BLOCKED\n`;
    }
    report += '\n';
  }

  if (criticalCount > 0) {
    report += '🚨 CRITICAL: Tool execution blocked due to injection risk\n';
  } else if (highCount > 0) {
    report += '⚠️ WARNING: Proceed with caution - suspicious patterns detected\n';
  }

  report += '═'.repeat(40) + '\n';

  return report;
}

async function main() {
  let hookInput: HookInput | null = null;

  try {
    // Read JSON input from stdin
    const decoder = new TextDecoder();
    const reader = Bun.stdin.stream().getReader();
    let input = '';

    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    const readPromise = (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        input += decoder.decode(value, { stream: true });
      }
    })();

    await Promise.race([readPromise, timeoutPromise]);

    if (input.trim()) {
      hookInput = JSON.parse(input) as HookInput;
    }
  } catch {
    // No input or parse error - exit cleanly
    process.exit(0);
  }

  if (!hookInput?.tool_input) {
    process.exit(0);
  }

  // Scan tool input for injection patterns
  const detected = scanToolInput(hookInput.tool_input);

  if (detected.length === 0) {
    // Clean - no injection detected
    process.exit(0);
  }

  // Output detection report
  const report = formatDetectionReport(detected);
  console.error(report);

  // Check if any pattern requires blocking
  const shouldBlock = detected.some(d => d.block);

  if (shouldBlock) {
    // Block execution by returning non-zero exit code
    // This signals to Claude Code that the tool should not execute
    process.exit(1);
  }

  // Non-blocking warning - allow execution to continue
  process.exit(0);
}

main().catch(() => {
  process.exit(0);
});
