#!/usr/bin/env python3
"""
Discover and catalog UI component patterns from the live BOSS frontend.

This script finds all instances of key component types (cards, buttons, badges, etc.)
and extracts their structure, classes, and computed styles to build a component catalog.

Usage:
    python discover_components.py --url http://localhost:5189
    python discover_components.py --url http://localhost:5189 --output ./captured

Output:
    - captured/components-catalog.json
"""

import argparse
import json
from datetime import datetime
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Error: playwright not installed. Run: pip install playwright && playwright install chromium")
    exit(1)


# Pages to scan for components
PAGES_TO_SCAN = [
    '/',
    '/email',
    '/approvals',
    '/channels',
    '/settings',
    '/templates',
]


def discover_cards(page) -> list:
    """Discover card component patterns."""
    return page.evaluate('''
        () => {
            const cards = document.querySelectorAll('.card');
            return Array.from(cards).slice(0, 10).map(card => {
                const styles = getComputedStyle(card);
                return {
                    className: card.className,
                    tagName: card.tagName.toLowerCase(),
                    childCount: card.children.length,
                    hasHeader: !!card.querySelector('h1, h2, h3, h4, h5, h6'),
                    hasIcon: !!card.querySelector('svg'),
                    styles: {
                        backgroundColor: styles.backgroundColor,
                        borderColor: styles.borderColor,
                        borderWidth: styles.borderWidth,
                        borderRadius: styles.borderRadius,
                        padding: styles.padding,
                        backdropFilter: styles.backdropFilter,
                        boxShadow: styles.boxShadow
                    }
                };
            });
        }
    ''')


def discover_buttons(page) -> dict:
    """Discover button component patterns."""
    return page.evaluate('''
        () => {
            const result = {
                primary: [],
                secondary: [],
                success: [],
                danger: [],
                other: []
            };

            const buttons = document.querySelectorAll('button, a.btn, [class*="btn-"]');

            buttons.forEach(btn => {
                const styles = getComputedStyle(btn);
                const info = {
                    className: btn.className,
                    tagName: btn.tagName.toLowerCase(),
                    text: btn.textContent?.trim().slice(0, 30),
                    hasIcon: !!btn.querySelector('svg'),
                    styles: {
                        backgroundColor: styles.backgroundColor,
                        color: styles.color,
                        borderColor: styles.borderColor,
                        borderRadius: styles.borderRadius,
                        padding: styles.padding,
                        fontSize: styles.fontSize,
                        fontWeight: styles.fontWeight
                    }
                };

                if (btn.className.includes('btn-primary')) {
                    if (result.primary.length < 5) result.primary.push(info);
                } else if (btn.className.includes('btn-secondary')) {
                    if (result.secondary.length < 5) result.secondary.push(info);
                } else if (btn.className.includes('btn-success')) {
                    if (result.success.length < 5) result.success.push(info);
                } else if (btn.className.includes('btn-danger')) {
                    if (result.danger.length < 5) result.danger.push(info);
                } else {
                    if (result.other.length < 5) result.other.push(info);
                }
            });

            return result;
        }
    ''')


def discover_badges(page) -> list:
    """Discover badge component patterns."""
    return page.evaluate('''
        () => {
            const badges = document.querySelectorAll('[class*="badge"]');
            return Array.from(badges).slice(0, 15).map(badge => {
                const styles = getComputedStyle(badge);
                return {
                    className: badge.className,
                    text: badge.textContent?.trim().slice(0, 20),
                    styles: {
                        backgroundColor: styles.backgroundColor,
                        color: styles.color,
                        borderColor: styles.borderColor,
                        borderRadius: styles.borderRadius,
                        padding: styles.padding,
                        fontSize: styles.fontSize
                    }
                };
            });
        }
    ''')


def discover_inputs(page) -> list:
    """Discover input/form component patterns."""
    return page.evaluate('''
        () => {
            const inputs = document.querySelectorAll('input, textarea, select');
            return Array.from(inputs).slice(0, 10).map(input => {
                const styles = getComputedStyle(input);
                return {
                    className: input.className,
                    type: input.type || input.tagName.toLowerCase(),
                    placeholder: input.placeholder || '',
                    styles: {
                        backgroundColor: styles.backgroundColor,
                        color: styles.color,
                        borderColor: styles.borderColor,
                        borderRadius: styles.borderRadius,
                        padding: styles.padding,
                        fontSize: styles.fontSize
                    }
                };
            });
        }
    ''')


def discover_status_indicators(page) -> list:
    """Discover status indicator patterns."""
    return page.evaluate('''
        () => {
            const indicators = document.querySelectorAll('[class*="status-"]');
            return Array.from(indicators).slice(0, 10).map(ind => {
                const styles = getComputedStyle(ind);
                return {
                    className: ind.className,
                    styles: {
                        backgroundColor: styles.backgroundColor,
                        width: styles.width,
                        height: styles.height,
                        borderRadius: styles.borderRadius,
                        boxShadow: styles.boxShadow
                    }
                };
            });
        }
    ''')


def discover_modals(page) -> list:
    """Discover modal/dialog patterns (if any are open)."""
    return page.evaluate('''
        () => {
            const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]');
            return Array.from(modals).slice(0, 5).map(modal => {
                const styles = getComputedStyle(modal);
                return {
                    className: modal.className,
                    role: modal.getAttribute('role'),
                    styles: {
                        backgroundColor: styles.backgroundColor,
                        borderColor: styles.borderColor,
                        borderRadius: styles.borderRadius,
                        padding: styles.padding,
                        maxWidth: styles.maxWidth,
                        boxShadow: styles.boxShadow
                    }
                };
            });
        }
    ''')


def discover_navigation(page) -> dict:
    """Discover navigation patterns."""
    return page.evaluate('''
        () => {
            const sidebar = document.querySelector('aside, nav, [class*="sidebar"]');
            const navLinks = document.querySelectorAll('nav a, aside a');

            const activeLink = Array.from(navLinks).find(a =>
                a.className.includes('active') ||
                a.className.includes('bg-neon') ||
                a.getAttribute('aria-current')
            );

            return {
                hasSidebar: !!sidebar,
                sidebarClasses: sidebar?.className || '',
                navLinkCount: navLinks.length,
                activeLink: activeLink ? {
                    className: activeLink.className,
                    styles: {
                        backgroundColor: getComputedStyle(activeLink).backgroundColor,
                        color: getComputedStyle(activeLink).color,
                        borderColor: getComputedStyle(activeLink).borderColor
                    }
                } : null,
                inactiveLink: navLinks[0] && !navLinks[0].className.includes('active') ? {
                    className: navLinks[0].className,
                    styles: {
                        backgroundColor: getComputedStyle(navLinks[0]).backgroundColor,
                        color: getComputedStyle(navLinks[0]).color
                    }
                } : null
            };
        }
    ''')


def discover_glass_elements(page) -> list:
    """Discover glass morphism patterns."""
    return page.evaluate('''
        () => {
            const glassElements = document.querySelectorAll('.glass, .glass-strong, [class*="backdrop-blur"]');
            return Array.from(glassElements).slice(0, 10).map(el => {
                const styles = getComputedStyle(el);
                return {
                    className: el.className,
                    tagName: el.tagName.toLowerCase(),
                    styles: {
                        backgroundColor: styles.backgroundColor,
                        backdropFilter: styles.backdropFilter,
                        borderColor: styles.borderColor
                    }
                };
            });
        }
    ''')


def merge_component_lists(lists: list) -> list:
    """Merge component lists, removing duplicates by className."""
    seen = set()
    result = []
    for item_list in lists:
        for item in item_list:
            key = item.get('className', '') + str(item.get('styles', {}).get('backgroundColor', ''))
            if key not in seen:
                seen.add(key)
                result.append(item)
    return result


def discover_all_components(base_url: str, output_dir: str):
    """Discover all component patterns from the app."""

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    all_cards = []
    all_buttons = {'primary': [], 'secondary': [], 'success': [], 'danger': [], 'other': []}
    all_badges = []
    all_inputs = []
    all_status = []
    all_modals = []
    all_glass = []
    navigation_info = None

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()

        for path in PAGES_TO_SCAN:
            url = f"{base_url.rstrip('/')}{path}"
            print(f"Discovering components: {url}")

            try:
                page.goto(url, wait_until='networkidle', timeout=30000)
                page.wait_for_timeout(500)

                # Discover each component type
                cards = discover_cards(page)
                all_cards.extend(cards)
                print(f"  - Cards: {len(cards)}")

                buttons = discover_buttons(page)
                for key in all_buttons:
                    all_buttons[key].extend(buttons.get(key, []))
                total_buttons = sum(len(v) for v in buttons.values())
                print(f"  - Buttons: {total_buttons}")

                badges = discover_badges(page)
                all_badges.extend(badges)
                print(f"  - Badges: {len(badges)}")

                inputs = discover_inputs(page)
                all_inputs.extend(inputs)
                print(f"  - Inputs: {len(inputs)}")

                status = discover_status_indicators(page)
                all_status.extend(status)

                modals = discover_modals(page)
                all_modals.extend(modals)

                glass = discover_glass_elements(page)
                all_glass.extend(glass)

                # Only get navigation once (from first page)
                if navigation_info is None:
                    navigation_info = discover_navigation(page)

            except Exception as e:
                print(f"  - Error: {e}")

        browser.close()

    # Build catalog
    catalog = {
        'discovered_at': datetime.now().isoformat(),
        'source_url': base_url,
        'pages_scanned': PAGES_TO_SCAN,
        'components': {
            'cards': {
                'count': len(all_cards),
                'samples': merge_component_lists([all_cards])[:5],
                'common_classes': list(set(c.get('className', '') for c in all_cards))[:10]
            },
            'buttons': {
                'primary': {
                    'count': len(all_buttons['primary']),
                    'samples': all_buttons['primary'][:3]
                },
                'secondary': {
                    'count': len(all_buttons['secondary']),
                    'samples': all_buttons['secondary'][:3]
                },
                'success': {
                    'count': len(all_buttons['success']),
                    'samples': all_buttons['success'][:3]
                },
                'danger': {
                    'count': len(all_buttons['danger']),
                    'samples': all_buttons['danger'][:3]
                },
                'other': {
                    'count': len(all_buttons['other']),
                    'samples': all_buttons['other'][:3]
                }
            },
            'badges': {
                'count': len(all_badges),
                'samples': merge_component_lists([all_badges])[:5]
            },
            'inputs': {
                'count': len(all_inputs),
                'samples': merge_component_lists([all_inputs])[:5]
            },
            'statusIndicators': {
                'count': len(all_status),
                'samples': merge_component_lists([all_status])[:5]
            },
            'modals': {
                'count': len(all_modals),
                'samples': all_modals[:3]
            },
            'glassElements': {
                'count': len(all_glass),
                'samples': merge_component_lists([all_glass])[:5]
            },
            'navigation': navigation_info
        }
    }

    # Save catalog
    catalog_path = output_path / 'components-catalog.json'
    with open(catalog_path, 'w') as f:
        json.dump(catalog, f, indent=2)
    print(f"\nComponent catalog saved to: {catalog_path}")

    # Print summary
    print("\n" + "=" * 40)
    print("COMPONENT DISCOVERY SUMMARY")
    print("=" * 40)
    print(f"Cards: {catalog['components']['cards']['count']}")
    print(f"Buttons (primary): {catalog['components']['buttons']['primary']['count']}")
    print(f"Buttons (secondary): {catalog['components']['buttons']['secondary']['count']}")
    print(f"Badges: {catalog['components']['badges']['count']}")
    print(f"Inputs: {catalog['components']['inputs']['count']}")
    print(f"Status Indicators: {catalog['components']['statusIndicators']['count']}")
    print(f"Glass Elements: {catalog['components']['glassElements']['count']}")

    return catalog


def main():
    parser = argparse.ArgumentParser(
        description='Discover UI component patterns from BOSS Exchange'
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

    print(f"BOSS UI/UX - Component Discovery")
    print(f"=" * 40)
    print(f"Base URL: {args.url}")
    print(f"Output: {args.output}")
    print()

    discover_all_components(args.url, args.output)
    print("\nDiscovery complete!")


if __name__ == '__main__':
    main()
