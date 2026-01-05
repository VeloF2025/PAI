#!/usr/bin/env python3
"""
Validate component files against captured UI patterns.

This script compares TSX/CSS files against the captured design patterns
to identify inconsistencies with the BOSS design system.

Usage:
    python compare_to_captured.py --file src/components/NewCard.tsx
    python compare_to_captured.py --dir src/components/
    python compare_to_captured.py --dir src/ --recursive

Output:
    - Validation report to stdout
    - Exit code 0 if passed, 1 if issues found
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple


def load_captured_data(captured_dir: Path) -> Dict:
    """Load all captured reference data."""
    data = {}

    files = [
        ('colors', 'colors-extracted.json'),
        ('components', 'components-catalog.json'),
        ('spacing', 'spacing.json'),
        ('typography', 'typography.json'),
    ]

    for key, filename in files:
        filepath = captured_dir / filename
        if filepath.exists():
            with open(filepath) as f:
                data[key] = json.load(f)
        else:
            print(f"Warning: {filepath} not found")
            data[key] = {}

    return data


def extract_colors_from_code(content: str) -> List[Tuple[int, str]]:
    """Extract hardcoded hex colors from code."""
    # Match hex colors like #ffffff, #fff, #12121a
    pattern = r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-fA-F])'
    matches = []

    for i, line in enumerate(content.split('\n'), 1):
        for match in re.finditer(pattern, line):
            matches.append((i, match.group()))

    return matches


def extract_tailwind_colors(content: str) -> List[Tuple[int, str]]:
    """Extract Tailwind color classes from code."""
    # Match bg-*, text-*, border-* classes
    pattern = r'(?:bg|text|border)-(?:gray|blue|red|green|yellow|purple|pink|indigo|orange|white|black)-\d{2,3}'
    matches = []

    for i, line in enumerate(content.split('\n'), 1):
        for match in re.finditer(pattern, line):
            matches.append((i, match.group()))

    return matches


def check_color_consistency(content: str, captured_colors: Dict) -> List[Dict]:
    """Check if colors match captured palette."""
    issues = []

    # Get known good color values
    good_hex_colors = set()
    for color_list in [captured_colors.get('backgrounds', []),
                       captured_colors.get('texts', []),
                       captured_colors.get('borders', [])]:
        for c in color_list:
            if 'hex' in c:
                good_hex_colors.add(c['hex'].lower())

    # Check hardcoded hex colors
    hex_colors = extract_colors_from_code(content)
    for line, color in hex_colors:
        if color.lower() not in good_hex_colors:
            issues.append({
                'type': 'warning',
                'line': line,
                'issue': 'Hardcoded color not in captured palette',
                'found': color,
                'suggestion': 'Use Tailwind class from captured colors'
            })

    # Check for non-BOSS Tailwind colors
    tailwind_colors = extract_tailwind_colors(content)
    boss_prefixes = ['space-', 'neon-', 'gray-']

    for line, color_class in tailwind_colors:
        is_boss = any(f'-{prefix}' in color_class or color_class.startswith(f'bg-{prefix}')
                      for prefix in boss_prefixes)
        if not is_boss and 'gray-' not in color_class:
            issues.append({
                'type': 'warning',
                'line': line,
                'issue': 'Non-BOSS color class',
                'found': color_class,
                'suggestion': 'Use space-*, neon-*, or gray-* colors'
            })

    return issues


def check_component_classes(content: str, captured_components: Dict) -> List[Dict]:
    """Check if component classes match captured patterns."""
    issues = []

    # Check for cards without .card class
    if 'rounded-xl' in content and 'border' in content and 'bg-' in content:
        if '.card' not in content and 'className="card' not in content and "className='card" not in content:
            # Might be a card without using the class
            if re.search(r'rounded-xl.*border.*p-[46]', content):
                issues.append({
                    'type': 'suggestion',
                    'line': 0,
                    'issue': 'Possible card pattern without .card class',
                    'found': 'rounded-xl border p-* pattern',
                    'suggestion': 'Consider using className="card" for consistency'
                })

    # Check for buttons without btn-* class
    button_pattern = r'<button[^>]*className=["\'][^"\']*["\']'
    for match in re.finditer(button_pattern, content):
        if 'btn-' not in match.group():
            issues.append({
                'type': 'suggestion',
                'line': content[:match.start()].count('\n') + 1,
                'issue': 'Button without btn-* class',
                'found': match.group()[:50],
                'suggestion': 'Use btn-primary, btn-secondary, etc.'
            })

    return issues


def check_spacing_patterns(content: str, captured_spacing: Dict) -> List[Dict]:
    """Check if spacing matches captured patterns."""
    issues = []

    # Get common padding values
    common_paddings = set()
    for padding, count in captured_spacing.get('paddings', []):
        # Extract px values and convert to Tailwind
        if isinstance(padding, str) and 'px' in padding:
            common_paddings.add(padding)

    # Check for uncommon padding values
    padding_pattern = r'p-(\d+)'
    for match in re.finditer(padding_pattern, content):
        value = match.group(1)
        # Common values in Tailwind: 2, 3, 4, 6, 8
        if value not in ['2', '3', '4', '6', '8']:
            issues.append({
                'type': 'info',
                'line': content[:match.start()].count('\n') + 1,
                'issue': 'Uncommon padding value',
                'found': f'p-{value}',
                'suggestion': 'Common BOSS paddings: p-2, p-3, p-4, p-6, p-8'
            })

    return issues


def validate_file(filepath: Path, captured_data: Dict) -> Dict:
    """Validate a single file against captured patterns."""
    content = filepath.read_text(encoding='utf-8', errors='ignore')

    results = {
        'file': str(filepath),
        'issues': [],
        'passed': True
    }

    # Run all checks
    results['issues'].extend(
        check_color_consistency(content, captured_data.get('colors', {}))
    )
    results['issues'].extend(
        check_component_classes(content, captured_data.get('components', {}))
    )
    results['issues'].extend(
        check_spacing_patterns(content, captured_data.get('spacing', {}))
    )

    # Determine pass/fail
    errors = [i for i in results['issues'] if i['type'] == 'error']
    warnings = [i for i in results['issues'] if i['type'] == 'warning']

    results['passed'] = len(errors) == 0
    results['summary'] = {
        'errors': len(errors),
        'warnings': len(warnings),
        'suggestions': len(results['issues']) - len(errors) - len(warnings)
    }

    return results


def print_report(results: List[Dict]):
    """Print validation report."""
    print("\n" + "=" * 60)
    print("BOSS UI/UX - VALIDATION REPORT")
    print("=" * 60)

    total_errors = 0
    total_warnings = 0

    for result in results:
        print(f"\n## {result['file']}")

        if not result['issues']:
            print("   All checks passed")
            continue

        for issue in result['issues']:
            icon = {'error': '[ERR]', 'warning': '[WARN]', 'suggestion': '[SUG]', 'info': '[INFO]'}.get(issue['type'], '[?]')
            print(f"   {icon} Line {issue['line']}: {issue['issue']}")
            print(f"        Found: {issue['found']}")
            print(f"        Suggestion: {issue['suggestion']}")

        total_errors += result['summary']['errors']
        total_warnings += result['summary']['warnings']

    print("\n" + "-" * 60)
    print(f"SUMMARY: {total_errors} errors, {total_warnings} warnings")

    if total_errors > 0:
        print("STATUS: FAILED - Fix errors before proceeding")
        return 1
    elif total_warnings > 0:
        print("STATUS: PASSED with warnings - Review suggested changes")
        return 0
    else:
        print("STATUS: PASSED - All checks OK")
        return 0


def main():
    parser = argparse.ArgumentParser(
        description='Validate UI code against captured BOSS patterns'
    )
    parser.add_argument(
        '--file',
        help='Single file to validate'
    )
    parser.add_argument(
        '--dir',
        help='Directory to validate'
    )
    parser.add_argument(
        '--recursive', '-r',
        action='store_true',
        help='Recursively scan directories'
    )
    parser.add_argument(
        '--captured',
        default=str(Path(__file__).parent.parent / 'captured'),
        help='Path to captured data directory'
    )

    args = parser.parse_args()

    if not args.file and not args.dir:
        parser.error("Either --file or --dir is required")

    # Load captured data
    captured_dir = Path(args.captured)
    if not captured_dir.exists():
        print(f"Error: Captured data not found at {captured_dir}")
        print("Run capture-and-learn workflow first")
        sys.exit(1)

    captured_data = load_captured_data(captured_dir)

    # Collect files to validate
    files_to_validate = []

    if args.file:
        files_to_validate.append(Path(args.file))
    elif args.dir:
        dir_path = Path(args.dir)
        pattern = '**/*.tsx' if args.recursive else '*.tsx'
        files_to_validate.extend(dir_path.glob(pattern))
        pattern = '**/*.ts' if args.recursive else '*.ts'
        files_to_validate.extend(dir_path.glob(pattern))

    if not files_to_validate:
        print("No files found to validate")
        sys.exit(0)

    print(f"Validating {len(files_to_validate)} file(s)...")

    # Validate each file
    results = []
    for filepath in files_to_validate:
        if filepath.exists():
            result = validate_file(filepath, captured_data)
            results.append(result)

    # Print report and exit
    exit_code = print_report(results)
    sys.exit(exit_code)


if __name__ == '__main__':
    main()
