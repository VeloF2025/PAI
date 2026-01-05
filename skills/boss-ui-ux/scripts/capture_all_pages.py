#!/usr/bin/env python3
"""
Capture screenshots and basic component counts from all BOSS Exchange pages.

This script navigates to each main page of the BOSS frontend and:
1. Takes a full-page screenshot
2. Counts key component types on the page
3. Saves metadata about each page

Usage:
    python capture_all_pages.py --url http://localhost:5189
    python capture_all_pages.py --url http://localhost:5189 --output ./captured

Output:
    - captured/screenshots/{page_name}.png
    - captured/pages-info.json
"""

import argparse
import json
import os
from datetime import datetime
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Error: playwright not installed. Run: pip install playwright && playwright install chromium")
    exit(1)


# All main pages in BOSS Exchange
PAGES = [
    ('/', 'dashboard', 'Dashboard - Main overview'),
    ('/email', 'email', 'Email - Inbox and message management'),
    ('/approvals', 'approvals', 'Approvals - Pending approval queue'),
    ('/whatsapp', 'whatsapp', 'WhatsApp - Chat interface'),
    ('/channels', 'channels', 'Channels - Account management'),
    ('/knowledge', 'knowledge', 'Knowledge - Knowledge base'),
    ('/team', 'team', 'Team - Team management'),
    ('/threads', 'threads', 'Threads - Conversation threads'),
    ('/automation', 'automation', 'Automation - Workflow rules'),
    ('/templates', 'templates', 'Templates - Message templates'),
    ('/settings', 'settings', 'Settings - Application settings'),
]


def count_components(page) -> dict:
    """Count key component types on the current page."""
    return page.evaluate('''
        () => {
            return {
                cards: document.querySelectorAll('.card').length,
                buttons: {
                    total: document.querySelectorAll('button').length,
                    primary: document.querySelectorAll('.btn-primary').length,
                    secondary: document.querySelectorAll('.btn-secondary').length,
                    success: document.querySelectorAll('.btn-success').length,
                    danger: document.querySelectorAll('.btn-danger').length,
                },
                badges: document.querySelectorAll('[class*="badge"]').length,
                inputs: document.querySelectorAll('input, textarea, select').length,
                modals: document.querySelectorAll('[role="dialog"]').length,
                statusIndicators: document.querySelectorAll('[class*="status-"]').length,
                glassElements: document.querySelectorAll('.glass, .glass-strong').length,
                tables: document.querySelectorAll('table').length,
                links: document.querySelectorAll('a').length,
            };
        }
    ''')


def capture_all_pages(base_url: str, output_dir: str):
    """Capture screenshots and info from all pages."""

    output_path = Path(output_dir)
    screenshots_dir = output_path / 'screenshots'
    screenshots_dir.mkdir(parents=True, exist_ok=True)

    pages_info = {
        'captured_at': datetime.now().isoformat(),
        'base_url': base_url,
        'pages': []
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            device_scale_factor=1
        )
        page = context.new_page()

        for path, name, description in PAGES:
            url = f"{base_url.rstrip('/')}{path}"
            print(f"Capturing: {name} ({url})")

            try:
                page.goto(url, wait_until='networkidle', timeout=30000)
                page.wait_for_timeout(1000)  # Extra wait for animations

                # Take screenshot
                screenshot_path = screenshots_dir / f"{name}.png"
                page.screenshot(path=str(screenshot_path), full_page=True)

                # Count components
                components = count_components(page)

                # Get page title
                title = page.title()

                page_info = {
                    'name': name,
                    'path': path,
                    'description': description,
                    'title': title,
                    'screenshot': f"screenshots/{name}.png",
                    'components': components
                }
                pages_info['pages'].append(page_info)

                print(f"  - Screenshot saved: {screenshot_path}")
                print(f"  - Components: {components['cards']} cards, {components['buttons']['total']} buttons")

            except Exception as e:
                print(f"  - Error capturing {name}: {e}")
                pages_info['pages'].append({
                    'name': name,
                    'path': path,
                    'description': description,
                    'error': str(e)
                })

        browser.close()

    # Save pages info
    info_path = output_path / 'pages-info.json'
    with open(info_path, 'w') as f:
        json.dump(pages_info, f, indent=2)
    print(f"\nPages info saved to: {info_path}")

    # Summary
    successful = len([p for p in pages_info['pages'] if 'error' not in p])
    print(f"\nCapture complete: {successful}/{len(PAGES)} pages captured successfully")

    return pages_info


def main():
    parser = argparse.ArgumentParser(
        description='Capture screenshots from all BOSS Exchange pages'
    )
    parser.add_argument(
        '--url',
        default='http://localhost:5189',
        help='Base URL of BOSS frontend (default: http://localhost:5189)'
    )
    parser.add_argument(
        '--output',
        default=str(Path(__file__).parent.parent / 'captured'),
        help='Output directory for captured data'
    )

    args = parser.parse_args()

    print(f"BOSS UI/UX - Page Capture")
    print(f"=" * 40)
    print(f"Base URL: {args.url}")
    print(f"Output: {args.output}")
    print(f"Pages to capture: {len(PAGES)}")
    print()

    capture_all_pages(args.url, args.output)


if __name__ == '__main__':
    main()
