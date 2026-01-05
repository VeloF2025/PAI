#!/usr/bin/env python3
"""
Extract actual design tokens (colors, typography, spacing) from the live BOSS frontend.

This script uses Playwright to navigate the app and extract computed styles from
actual DOM elements, building a reference of what colors, fonts, and spacing are
really used in the application.

Usage:
    python extract_design_tokens.py --url http://localhost:5189
    python extract_design_tokens.py --url http://localhost:5189 --output ./captured

Output:
    - captured/colors-extracted.json
    - captured/typography.json
    - captured/spacing.json
    - captured/styles-computed.json (combined)
"""

import argparse
import json
from datetime import datetime
from pathlib import Path
from collections import Counter

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Error: playwright not installed. Run: pip install playwright && playwright install chromium")
    exit(1)


# Pages to scan for design tokens
PAGES_TO_SCAN = [
    '/',
    '/email',
    '/approvals',
    '/channels',
    '/settings',
]


def extract_colors(page) -> dict:
    """Extract all unique colors from computed styles."""
    return page.evaluate('''
        () => {
            const colors = {
                backgrounds: new Map(),
                texts: new Map(),
                borders: new Map(),
                shadows: new Set()
            };

            // Get all elements
            const elements = document.querySelectorAll('*');

            elements.forEach(el => {
                const styles = getComputedStyle(el);

                // Background colors
                const bg = styles.backgroundColor;
                if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                    const count = colors.backgrounds.get(bg) || 0;
                    colors.backgrounds.set(bg, count + 1);
                }

                // Text colors
                const color = styles.color;
                if (color) {
                    const count = colors.texts.get(color) || 0;
                    colors.texts.set(color, count + 1);
                }

                // Border colors
                const borderColor = styles.borderColor;
                if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
                    const count = colors.borders.get(borderColor) || 0;
                    colors.borders.set(borderColor, count + 1);
                }

                // Box shadows (for glow effects)
                const shadow = styles.boxShadow;
                if (shadow && shadow !== 'none') {
                    colors.shadows.add(shadow);
                }
            });

            return {
                backgrounds: Object.fromEntries(colors.backgrounds),
                texts: Object.fromEntries(colors.texts),
                borders: Object.fromEntries(colors.borders),
                shadows: Array.from(colors.shadows)
            };
        }
    ''')


def extract_typography(page) -> dict:
    """Extract typography styles from computed styles."""
    return page.evaluate('''
        () => {
            const typography = {
                fontFamilies: new Map(),
                fontSizes: new Map(),
                fontWeights: new Map(),
                lineHeights: new Map()
            };

            const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, label, div');

            textElements.forEach(el => {
                const styles = getComputedStyle(el);
                const text = el.textContent?.trim();

                // Only count if element has visible text
                if (text && text.length > 0) {
                    // Font family
                    const family = styles.fontFamily;
                    if (family) {
                        const count = typography.fontFamilies.get(family) || 0;
                        typography.fontFamilies.set(family, count + 1);
                    }

                    // Font size
                    const size = styles.fontSize;
                    if (size) {
                        const count = typography.fontSizes.get(size) || 0;
                        typography.fontSizes.set(size, count + 1);
                    }

                    // Font weight
                    const weight = styles.fontWeight;
                    if (weight) {
                        const count = typography.fontWeights.get(weight) || 0;
                        typography.fontWeights.set(weight, count + 1);
                    }

                    // Line height
                    const lineHeight = styles.lineHeight;
                    if (lineHeight) {
                        const count = typography.lineHeights.get(lineHeight) || 0;
                        typography.lineHeights.set(lineHeight, count + 1);
                    }
                }
            });

            return {
                fontFamilies: Object.fromEntries(typography.fontFamilies),
                fontSizes: Object.fromEntries(typography.fontSizes),
                fontWeights: Object.fromEntries(typography.fontWeights),
                lineHeights: Object.fromEntries(typography.lineHeights)
            };
        }
    ''')


def extract_spacing(page) -> dict:
    """Extract spacing patterns from computed styles."""
    return page.evaluate('''
        () => {
            const spacing = {
                paddings: new Map(),
                margins: new Map(),
                gaps: new Map(),
                borderRadius: new Map()
            };

            const elements = document.querySelectorAll('div, section, article, main, aside, nav, header, footer, button, a');

            elements.forEach(el => {
                const styles = getComputedStyle(el);

                // Padding (combined)
                const padding = styles.padding;
                if (padding && padding !== '0px') {
                    const count = spacing.paddings.get(padding) || 0;
                    spacing.paddings.set(padding, count + 1);
                }

                // Margin (combined)
                const margin = styles.margin;
                if (margin && margin !== '0px') {
                    const count = spacing.margins.get(margin) || 0;
                    spacing.margins.set(margin, count + 1);
                }

                // Gap (for flex/grid)
                const gap = styles.gap;
                if (gap && gap !== 'normal' && gap !== '0px') {
                    const count = spacing.gaps.get(gap) || 0;
                    spacing.gaps.set(gap, count + 1);
                }

                // Border radius
                const radius = styles.borderRadius;
                if (radius && radius !== '0px') {
                    const count = spacing.borderRadius.get(radius) || 0;
                    spacing.borderRadius.set(radius, count + 1);
                }
            });

            return {
                paddings: Object.fromEntries(spacing.paddings),
                margins: Object.fromEntries(spacing.margins),
                gaps: Object.fromEntries(spacing.gaps),
                borderRadius: Object.fromEntries(spacing.borderRadius)
            };
        }
    ''')


def rgb_to_hex(rgb_str: str) -> str:
    """Convert rgb(r, g, b) to #rrggbb."""
    try:
        if rgb_str.startswith('rgba'):
            # rgba(r, g, b, a)
            parts = rgb_str.replace('rgba(', '').replace(')', '').split(',')
            r, g, b = int(parts[0]), int(parts[1]), int(parts[2])
            a = float(parts[3].strip())
            if a < 1:
                return f"rgba({r}, {g}, {b}, {a})"
        elif rgb_str.startswith('rgb'):
            # rgb(r, g, b)
            parts = rgb_str.replace('rgb(', '').replace(')', '').split(',')
            r, g, b = int(parts[0]), int(parts[1]), int(parts[2])
        else:
            return rgb_str

        return f"#{r:02x}{g:02x}{b:02x}"
    except:
        return rgb_str


def merge_dicts(dict_list: list) -> dict:
    """Merge multiple dictionaries, summing counts."""
    result = {}
    for d in dict_list:
        for key, value in d.items():
            if isinstance(value, dict):
                if key not in result:
                    result[key] = {}
                for k, v in value.items():
                    result[key][k] = result[key].get(k, 0) + v
            elif isinstance(value, list):
                if key not in result:
                    result[key] = set()
                result[key].update(value)
            else:
                result[key] = result.get(key, 0) + value

    # Convert sets back to lists
    for key, value in result.items():
        if isinstance(value, set):
            result[key] = list(value)

    return result


def sort_by_count(d: dict, top_n: int = 20) -> list:
    """Sort dictionary by value (count) and return top N as list of tuples."""
    sorted_items = sorted(d.items(), key=lambda x: x[1], reverse=True)
    return sorted_items[:top_n]


def extract_all_tokens(base_url: str, output_dir: str):
    """Extract all design tokens from the app."""

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    all_colors = []
    all_typography = []
    all_spacing = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()

        for path in PAGES_TO_SCAN:
            url = f"{base_url.rstrip('/')}{path}"
            print(f"Scanning: {url}")

            try:
                page.goto(url, wait_until='networkidle', timeout=30000)
                page.wait_for_timeout(500)

                colors = extract_colors(page)
                typography = extract_typography(page)
                spacing = extract_spacing(page)

                all_colors.append(colors)
                all_typography.append(typography)
                all_spacing.append(spacing)

                print(f"  - Found {len(colors['backgrounds'])} bg colors, {len(colors['texts'])} text colors")

            except Exception as e:
                print(f"  - Error: {e}")

        browser.close()

    # Merge results from all pages
    merged_colors = merge_dicts(all_colors)
    merged_typography = merge_dicts(all_typography)
    merged_spacing = merge_dicts(all_spacing)

    # Process and save colors
    colors_data = {
        'extracted_at': datetime.now().isoformat(),
        'source_url': base_url,
        'pages_scanned': PAGES_TO_SCAN,
        'backgrounds': [
            {'rgb': rgb, 'hex': rgb_to_hex(rgb), 'count': count}
            for rgb, count in sort_by_count(merged_colors.get('backgrounds', {}), 30)
        ],
        'texts': [
            {'rgb': rgb, 'hex': rgb_to_hex(rgb), 'count': count}
            for rgb, count in sort_by_count(merged_colors.get('texts', {}), 30)
        ],
        'borders': [
            {'rgb': rgb, 'hex': rgb_to_hex(rgb), 'count': count}
            for rgb, count in sort_by_count(merged_colors.get('borders', {}), 20)
        ],
        'shadows': merged_colors.get('shadows', [])[:10]
    }

    colors_path = output_path / 'colors-extracted.json'
    with open(colors_path, 'w') as f:
        json.dump(colors_data, f, indent=2)
    print(f"\nColors saved to: {colors_path}")

    # Process and save typography
    typography_data = {
        'extracted_at': datetime.now().isoformat(),
        'source_url': base_url,
        'fontFamilies': sort_by_count(merged_typography.get('fontFamilies', {}), 10),
        'fontSizes': sort_by_count(merged_typography.get('fontSizes', {}), 20),
        'fontWeights': sort_by_count(merged_typography.get('fontWeights', {}), 10),
        'lineHeights': sort_by_count(merged_typography.get('lineHeights', {}), 15)
    }

    typography_path = output_path / 'typography.json'
    with open(typography_path, 'w') as f:
        json.dump(typography_data, f, indent=2)
    print(f"Typography saved to: {typography_path}")

    # Process and save spacing
    spacing_data = {
        'extracted_at': datetime.now().isoformat(),
        'source_url': base_url,
        'paddings': sort_by_count(merged_spacing.get('paddings', {}), 25),
        'margins': sort_by_count(merged_spacing.get('margins', {}), 25),
        'gaps': sort_by_count(merged_spacing.get('gaps', {}), 15),
        'borderRadius': sort_by_count(merged_spacing.get('borderRadius', {}), 15)
    }

    spacing_path = output_path / 'spacing.json'
    with open(spacing_path, 'w') as f:
        json.dump(spacing_data, f, indent=2)
    print(f"Spacing saved to: {spacing_path}")

    # Combined styles file
    combined = {
        'extracted_at': datetime.now().isoformat(),
        'source_url': base_url,
        'colors': colors_data,
        'typography': typography_data,
        'spacing': spacing_data
    }

    combined_path = output_path / 'styles-computed.json'
    with open(combined_path, 'w') as f:
        json.dump(combined, f, indent=2)
    print(f"Combined styles saved to: {combined_path}")

    return combined


def main():
    parser = argparse.ArgumentParser(
        description='Extract design tokens from BOSS Exchange frontend'
    )
    parser.add_argument(
        '--url',
        default='http://localhost:5189',
        help='Base URL of BOSS frontend'
    )
    parser.add_argument(
        '--output',
        default=str(Path(__file__).parent.parent / 'captured'),
        help='Output directory'
    )

    args = parser.parse_args()

    print(f"BOSS UI/UX - Design Token Extraction")
    print(f"=" * 40)
    print(f"Base URL: {args.url}")
    print(f"Output: {args.output}")
    print()

    extract_all_tokens(args.url, args.output)
    print("\nExtraction complete!")


if __name__ == '__main__':
    main()
