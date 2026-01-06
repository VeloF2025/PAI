#!/usr/bin/env python3
"""
Zero Tolerance Quality Validator
Part of PAI (Personal AI Infrastructure)

Enforces strict code quality standards:
- No console.log statements
- Proper error handling (no empty catch blocks)
- No void error patterns
- Type safety checks

Usage:
    python zero-tolerance-validator.py [path]
"""

import os
import sys
import re
import argparse
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Optional

# Zero tolerance patterns by language
ZERO_TOLERANCE_PATTERNS = {
    "typescript": {
        "console_log": [
            (r"console\.(log|error|warn|info|debug)\s*\(", "console.* statement - use proper logger"),
        ],
        "error_handling": [
            (r"catch\s*\{", "Empty catch block without error parameter"),
            (r"catch\s*\(\s*_", "Unused error parameter (prefixed with _)"),
            (r"catch\s*\([^)]*\)\s*\{\s*\}", "Empty catch block"),
            (r"void\s+_?error", "Void error anti-pattern"),
        ],
        "type_safety": [
            (r":\s*any\b", "Explicit 'any' type - use proper typing"),
            (r"as\s+any\b", "Type assertion to 'any'"),
            (r"@ts-ignore", "@ts-ignore comment - fix the type error"),
            (r"@ts-nocheck", "@ts-nocheck - type checking disabled"),
        ],
    },
    "python": {
        "error_handling": [
            (r"except\s*:\s*$", "Bare except clause"),
            (r"except\s*:\s*pass", "Silent exception swallowing"),
            (r"except.*:\s*\.\.\.", "Ellipsis exception handler"),
        ],
        "debug_statements": [
            (r"^\s*print\s*\((?!.*#\s*debug)", "Print statement (use logging)"),
            (r"breakpoint\s*\(\)", "Breakpoint left in code"),
            (r"pdb\.set_trace\(\)", "PDB debugger left in code"),
            (r"import\s+pdb", "PDB import left in code"),
        ],
        "type_safety": [
            (r"#\s*type:\s*ignore", "Type ignore comment"),
            (r"Any\s*\]", "Any type in annotation"),
        ],
    },
    "javascript": {
        "console_log": [
            (r"console\.(log|error|warn|info|debug)\s*\(", "console.* statement"),
        ],
        "error_handling": [
            (r"catch\s*\{", "Empty catch block without error parameter"),
            (r"catch\s*\([^)]*\)\s*\{\s*\}", "Empty catch block"),
        ],
    },
}

# File extensions to language mapping
EXT_TO_LANG = {
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".py": "python",
}

# Directories to skip
SKIP_DIRS = ["node_modules", ".git", "__pycache__", "venv", ".venv", "dist", "build", ".next"]


@dataclass
class Violation:
    file: str
    line: int
    category: str
    message: str
    content: str
    severity: str = "CRITICAL"


def get_language(filepath: Path) -> Optional[str]:
    """Get language from file extension."""
    return EXT_TO_LANG.get(filepath.suffix.lower())


def scan_file(filepath: Path) -> List[Violation]:
    """Scan a single file for zero tolerance violations."""
    violations = []
    lang = get_language(filepath)

    if not lang:
        return violations

    patterns = ZERO_TOLERANCE_PATTERNS.get(lang, {})

    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
        lines = content.split("\n")

        for line_num, line in enumerate(lines, 1):
            for category, pattern_list in patterns.items():
                for pattern, message in pattern_list:
                    if re.search(pattern, line):
                        violations.append(Violation(
                            file=str(filepath),
                            line=line_num,
                            category=category,
                            message=message,
                            content=line.strip()[:80]
                        ))
    except Exception as e:
        print(f"Warning: Could not scan {filepath}: {e}", file=sys.stderr)

    return violations


def scan_directory(path: Path) -> List[Violation]:
    """Recursively scan directory for violations."""
    all_violations = []

    for ext in EXT_TO_LANG.keys():
        for filepath in path.rglob(f"*{ext}"):
            # Skip excluded directories
            if any(skip in filepath.parts for skip in SKIP_DIRS):
                continue

            violations = scan_file(filepath)
            all_violations.extend(violations)

    return all_violations


def print_report(violations: List[Violation]):
    """Print formatted violation report."""
    print("\n" + "=" * 60)
    print("  ZERO TOLERANCE QUALITY REPORT")
    print("  PAI Code Quality Enforcement")
    print("=" * 60)

    if not violations:
        print("\n✅ CLEAN - No zero tolerance violations")
        print("=" * 60)
        return True

    # Group by category
    by_category: Dict[str, List[Violation]] = {}
    for v in violations:
        by_category.setdefault(v.category, []).append(v)

    for category, items in sorted(by_category.items()):
        print(f"\n🔴 {category.upper().replace('_', ' ')} ({len(items)} violations)")
        print("-" * 40)
        for v in items[:10]:  # Show first 10 per category
            print(f"  {v.file}:{v.line}")
            print(f"    [{v.severity}] {v.message}")
            print(f"    → {v.content}")
        if len(items) > 10:
            print(f"  ... and {len(items) - 10} more")

    print("\n" + "=" * 60)
    print(f"  TOTAL VIOLATIONS: {len(violations)}")
    print("\n  ❌ BLOCKED - Zero tolerance violations found")
    print("     All violations must be fixed before proceeding")
    print("=" * 60)

    return False


def main():
    parser = argparse.ArgumentParser(description="Zero Tolerance Quality Validator")
    parser.add_argument("path", nargs="?", default=".", help="Path to scan")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--quiet", action="store_true", help="Only output pass/fail")

    args = parser.parse_args()

    path = Path(args.path).resolve()

    if not path.exists():
        print(f"Error: Path does not exist: {path}", file=sys.stderr)
        sys.exit(1)

    # Scan for violations
    violations = scan_directory(path)

    if args.quiet:
        print("PASS" if not violations else "FAIL")
    elif args.json:
        import json
        print(json.dumps({
            "passed": len(violations) == 0,
            "total_violations": len(violations),
            "violations": [
                {
                    "file": v.file,
                    "line": v.line,
                    "category": v.category,
                    "message": v.message,
                    "severity": v.severity
                }
                for v in violations
            ]
        }, indent=2))
    else:
        passed = print_report(violations)

    # Exit with error if violations found
    sys.exit(0 if not violations else 1)


if __name__ == "__main__":
    main()
