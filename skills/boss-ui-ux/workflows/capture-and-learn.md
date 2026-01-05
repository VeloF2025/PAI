# Capture and Learn Workflow

## Purpose
Capture the current state of the BOSS Exchange UI, extract design patterns, and update the skill's knowledge base.

**When to use**: First time using the skill, or when the UI has been updated and patterns need to be refreshed.

## Prerequisites

1. **BOSS Frontend running** at http://localhost:5189
   ```bash
   cd "C:\Jarvis\AI Workspace\BOSS Exchange\autonomous-coding\generations\exchange"
   npm run dev
   ```

2. **Playwright installed** with Chromium
   ```bash
   pip install playwright
   playwright install chromium
   ```

## Workflow Steps

### Step 1: Verify Frontend is Running

```bash
curl http://localhost:5189 -I
```

If not running, start it:
```bash
cd "C:\Jarvis\AI Workspace\BOSS Exchange\autonomous-coding\generations\exchange"
npm run dev
```

Wait for "Local: http://localhost:5189" to appear.

### Step 2: Capture All Pages

Run the page capture script:
```bash
cd ~/.claude/skills/boss-ui-ux
python scripts/capture_all_pages.py --url http://localhost:5189
```

This will:
- Navigate to each main page (/, /email, /approvals, etc.)
- Take full-page screenshots
- Count component types on each page
- Save to `captured/screenshots/` and `captured/pages-info.json`

### Step 3: Extract Design Tokens

Run the token extraction script:
```bash
python scripts/extract_design_tokens.py --url http://localhost:5189
```

This will:
- Scan pages for computed styles
- Extract all background colors, text colors, border colors
- Extract typography (fonts, sizes, weights)
- Extract spacing (padding, margin, gap, border-radius)
- Save to `captured/colors-extracted.json`, `captured/typography.json`, `captured/spacing.json`

### Step 4: Discover Components

Run the component discovery script:
```bash
python scripts/discover_components.py --url http://localhost:5189
```

This will:
- Find all card, button, badge, input, status indicator patterns
- Extract their classes and computed styles
- Catalog navigation and glass elements
- Save to `captured/components-catalog.json`

### Step 5: Update CLAUDE.md

After running all capture scripts, update `CLAUDE.md` with the extracted data:

1. Read the captured JSON files
2. Format the data into the CLAUDE.md structure
3. Update timestamp and source information

The CLAUDE.md should reflect:
- Actual colors found (not prescribed values)
- Actual component classes and styles
- Actual spacing patterns used

### Step 6: Verify Capture Success

Check the captured directory:
```bash
ls -la captured/
ls -la captured/screenshots/
```

Expected files:
- `pages-info.json`
- `colors-extracted.json`
- `typography.json`
- `spacing.json`
- `components-catalog.json`
- `screenshots/*.png` (one per page)

## Capture Checklist

- [ ] Frontend running at http://localhost:5189
- [ ] All 11 pages captured (dashboard, email, approvals, etc.)
- [ ] Colors extracted from multiple pages
- [ ] Component catalog created
- [ ] CLAUDE.md updated with fresh data
- [ ] Timestamps updated to current date

## Troubleshooting

**Frontend not responding**:
- Check if another process is using port 5189
- Try `npm run dev` again

**Playwright errors**:
- Ensure Chromium is installed: `playwright install chromium`
- Try with `--headless=false` for debugging

**Missing components in catalog**:
- Some pages may need authentication
- Try capturing individual pages with `--pages /dashboard`

## Next Steps

After successful capture:
1. Read `CLAUDE.md` to understand learned patterns
2. Use `generate-component.md` workflow to create new components
3. Use `validate-consistency.md` to check existing code
