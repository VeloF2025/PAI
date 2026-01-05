#!/usr/bin/env bun

/**
 * FFUF (Fuzz Faster U Fool) - CLI Wrapper
 *
 * Expert guidance for ffuf web fuzzing during penetration testing, including
 * authenticated fuzzing with raw requests, auto-calibration, and result analysis.
 *
 * The actual fuzzing workflows are documented in:
 * - SKILL.md (skill definition)
 * - src/workflows/ (step-by-step guides)
 * - src/tools/ffuf_helper.py (Python helper script)
 *
 * This wrapper exists to satisfy Pack v2.0 requirement for code files in src/.
 */

const FFUF_MODES = {
  directory: {
    name: "Directory Discovery",
    description: "Find hidden directories and files",
    example: "ffuf -w wordlist.txt -u https://target.com/FUZZ"
  },
  vhost: {
    name: "Virtual Host Discovery",
    description: "Discover virtual hosts on a server",
    example: "ffuf -w vhosts.txt -u https://target.com -H 'Host: FUZZ.target.com'"
  },
  parameter: {
    name: "Parameter Fuzzing",
    description: "Discover GET/POST parameters",
    example: "ffuf -w params.txt -u https://target.com/api?FUZZ=value"
  },
  authenticated: {
    name: "Authenticated Fuzzing",
    description: "Fuzz with session cookies or tokens",
    example: "ffuf -w wordlist.txt -u https://target.com/FUZZ -H 'Cookie: session=TOKEN'"
  },
  raw_request: {
    name: "Raw Request Fuzzing",
    description: "Fuzz using saved raw HTTP request",
    example: "ffuf -request request.txt -w wordlist.txt"
  }
};

const CALIBRATION_TECHNIQUES = [
  "Auto-calibrate (-ac) - Automatically filter common responses",
  "Filter by status (-fc) - Filter HTTP status codes",
  "Filter by size (-fs) - Filter response sizes",
  "Filter by words (-fw) - Filter word count",
  "Match patterns (-mr) - Match regex patterns"
];

function showHelp() {
  console.log(`
FFUF Helper - Expert Web Fuzzing Guidance

USAGE:
  bun run ffuf-wrapper.ts [mode]

FUZZING MODES:
  directory     - ${FFUF_MODES.directory.description}
  vhost         - ${FFUF_MODES.vhost.description}
  parameter     - ${FFUF_MODES.parameter.description}
  authenticated - ${FFUF_MODES.authenticated.description}
  raw-request   - ${FFUF_MODES.raw_request.description}

CALIBRATION TECHNIQUES:
${CALIBRATION_TECHNIQUES.map(t => `  • ${t}`).join('\n')}

EXAMPLES:
  ${FFUF_MODES.directory.example}
  ${FFUF_MODES.authenticated.example}

PYTHON HELPER:
  Use the Python helper script for advanced automation:
  python src/tools/ffuf_helper.py [options]

NOTE:
This skill is primarily documentation-based and should be invoked through
Claude Code, not directly via this CLI wrapper.

To use this skill:
  1. Open Claude Code
  2. Say: "help me fuzz [target] with ffuf"
  3. Claude will guide you through the fuzzing process

For full workflow documentation, see:
  - src/workflows/ (fuzzing guides)
  - src/resources/ (wordlists and examples)
  - SKILL.md (skill definition)

⚠️  SECURITY NOTE:
Only perform web fuzzing on systems you have explicit authorization to test.
Unauthorized fuzzing is illegal and unethical.
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    showHelp();
    process.exit(0);
  }

  const mode = args[0];

  if (!FFUF_MODES[mode as keyof typeof FFUF_MODES]) {
    console.error(`❌ Invalid mode: ${mode}`);
    console.error(`Valid modes: directory, vhost, parameter, authenticated, raw-request\n`);
    showHelp();
    process.exit(1);
  }

  const modeInfo = FFUF_MODES[mode as keyof typeof FFUF_MODES];

  console.log(`
🔍 ${modeInfo.name}
📋 Description: ${modeInfo.description}
💡 Example: ${modeInfo.example}

⚠️  WARNING: This CLI wrapper is for demonstration only.
    The FFUF skill should be invoked through Claude Code.

To actually perform this fuzzing:
  1. Open Claude Code
  2. Say: "help me perform ${mode} fuzzing with ffuf"
  3. Claude will provide step-by-step guidance

Use Python helper for automation:
  python src/tools/ffuf_helper.py --mode ${mode}

See SKILL.md and src/workflows/ for full documentation.

⚠️  SECURITY REMINDER:
Only test systems you have authorization to assess.
`);
}

main();
