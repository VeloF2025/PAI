# Chrome Extension Visual Validation Protocol

**STATUS**: MANDATORY FOR UI/WEB PROJECTS
**LOAD WHEN**: UI work, visual validation, debugging, E2E testing, deployments
**REPLACES**: Playwright, BOSS MCP, Chrome DevTools MCP for visual testing

---

## Overview

Use `claude --chrome` with the Claude in Chrome extension for all visual validation, debugging, and browser-based testing. This provides real-time browser control, visual feedback, and integrated debugging.

---

## Automatic Triggers (MUST USE)

Chrome extension validation is MANDATORY for:
1. **UI Changes** - Any component/page modifications
2. **Feature Build** - Completing new features with UI
3. **Visual Bugs** - After fixing any UI-related bugs
4. **Before Deploy** - Always before production deployment
5. **Theme Changes** - After styling/theme updates
6. **Responsive Updates** - After mobile/tablet adjustments
7. **Form Validation** - Testing form behaviors
8. **Integration Testing** - Multi-page workflows

---

## Prerequisites

### Required Setup
- **Google Chrome** browser installed
- **Claude in Chrome extension** (v1.0.36+) - [Install](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)
- **Claude Code CLI** (v2.0.73+)
- **Paid Claude plan** (Pro, Team, or Enterprise)

### Session Start
```bash
# Always start Claude Code with --chrome flag for UI work
claude --chrome

# Verify connection
/chrome
```

---

## Validation Categories

| Category | When to Use | Example Prompts |
|----------|-------------|-----------------|
| **Smoke Tests** | Critical path validation | "Navigate to localhost:3000 and verify the login flow works" |
| **Visual Regression** | After UI changes | "Compare the dashboard layout to the Figma mockup at [URL]" |
| **Form Testing** | Form validation work | "Test the signup form with invalid data and verify error messages appear" |
| **Responsive** | Mobile/tablet work | "Resize to mobile viewport and check if navigation menu collapses" |
| **Accessibility** | A11y improvements | "Check console for accessibility warnings on the homepage" |
| **Performance** | Load time issues | "Open the page and check network tab for slow requests" |
| **Cross-browser** | Browser compatibility | "Test this feature in Chrome and report any console errors" |
| **Multi-step Flows** | User journeys | "Complete a purchase: add item → checkout → payment → confirmation" |

---

## Common Validation Workflows

### 1. Visual Testing After UI Changes
```
I just updated the navigation bar. Can you:
1. Open localhost:3000
2. Take a screenshot of the navbar
3. Check if it matches the design in design.png
4. Test mobile responsiveness (resize to 375px width)
5. Report any visual differences
```

### 2. Form Validation Testing
```
Test the contact form at localhost:3000/contact:
1. Submit with empty fields - verify error messages
2. Submit with invalid email - verify email validation
3. Submit with valid data - verify success message
4. Check console for any errors
```

### 3. Debugging Console Errors
```
Open the dashboard at localhost:3000/dashboard and:
1. Check the browser console for errors
2. Filter for errors related to "API" or "fetch"
3. Show me the stack traces
4. Check network tab for failed requests
```

### 4. Cross-Page Workflow Testing
```
Test the user onboarding flow:
1. Navigate to /signup
2. Fill registration form
3. Verify email confirmation page
4. Navigate to /profile
5. Verify user data appears correctly
6. Record a GIF of the entire flow
```

### 5. Performance Validation
```
Check page load performance on the homepage:
1. Open localhost:3000 with network tab monitoring
2. Report load time for key resources
3. Identify any resources over 500ms
4. Check for console warnings about performance
```

---

## Best Practices

### DO ✅
- **Always use `/chrome` first** to verify extension connection
- **Be specific** about what to test and what success looks like
- **Request screenshots/GIFs** for visual documentation
- **Ask for console/network logs** when debugging
- **Test on actual Chrome** (your login state, cookies preserved)
- **Use for authenticated apps** (Gmail, Notion, Google Docs, etc.)
- **Record workflows** for documentation/demos

### DON'T ❌
- **Don't use Playwright** for visual validation (use for CI/automated regression only)
- **Don't use BOSS MCP** for visual testing (deprecated for this use case)
- **Don't use Chrome DevTools MCP** for visual testing (deprecated for this use case)
- **Don't expect headless mode** (browser must be visible)
- **Don't try on non-Chrome browsers** (Arc, Brave not supported yet)
- **Don't use on WSL** (not supported)

---

## Available Commands

### Navigation & Interaction
```
# Navigate to pages
"Go to localhost:3000/dashboard"
"Click on the 'Settings' button"
"Fill in the email field with test@example.com"
"Scroll to the footer"

# Form interactions
"Submit the login form with username 'admin' and password 'test123'"
"Select 'United States' from the country dropdown"
"Check the 'Terms and Conditions' checkbox"

# Tab management
"Open a new tab and navigate to example.com"
"Switch to tab 2"
"Close the current tab"
```

### Visual Validation
```
# Screenshots
"Take a screenshot of the entire page"
"Take a screenshot of the navigation bar"
"Capture the modal dialog"

# Recording
"Record a GIF showing the checkout process"
"Start recording, then test the signup flow"

# Visual comparison
"Compare this page layout to the mockup at figma.com/file/..."
"Check if the button color matches #3B82F6"
```

### Debugging
```
# Console logs
"Show me all console errors on this page"
"Filter console for messages containing 'API'"
"Check for any warnings"

# Network requests
"List all failed network requests"
"Show the response from the /api/users endpoint"
"Check which requests are taking over 1 second"

# DOM inspection
"Find all elements with class 'error-message'"
"Check if the login button is disabled"
"Read the page content and extract all product names"
```

---

## Failure Protocol

If visual validation fails:
1. **SCREENSHOT** - Capture the issue for reference
2. **CONSOLE** - Check browser console for errors
3. **NETWORK** - Verify API calls succeeded
4. **FIX** - Resolve the UI issues in code
5. **RETEST** - Validate the fix in Chrome extension
6. **DOCUMENT** - Save GIF/screenshot of working state

---

## Migration from Old Tools

### From Playwright
**Before:**
```bash
npx playwright test tests/e2e/login.spec.ts
```

**After:**
```
Start session with: claude --chrome

Then: "Test the login flow at localhost:3000/login:
1. Enter email: test@example.com
2. Enter password: password123
3. Click submit
4. Verify redirect to /dashboard
5. Take a screenshot of the result"
```

### From BOSS MCP
**Before:**
Using BOSS Ghost MCP tools for browser automation

**After:**
```
Use natural language with Chrome extension:
"Navigate to the app, fill out the contact form, and submit it"
```

### From Chrome DevTools MCP
**Before:**
Using chrome-devtools MCP for visual testing

**After:**
```
Use Claude in Chrome extension:
"Open the page and check the console for errors"
```

---

## Permissions & Security

- **Site permissions** inherited from Chrome extension
- **Login state** uses your actual Chrome login cookies
- **Pauses for auth** - Claude stops when encountering login pages/CAPTCHAs
- **Manual override** - You can take over browser control anytime
- **Permission prompts** - Extension asks before sensitive actions

---

## Context Usage Note

Running `claude --chrome` increases context usage since browser tools are always loaded. Only use the `--chrome` flag when doing UI/visual work.

---

## Quick Reference

```bash
# Session Start
claude --chrome

# Check Connection
/chrome

# Example Validation
"Open localhost:3000, navigate through all pages,
and report any console errors or visual issues"

# Record Demo
"Record a GIF of the complete user signup flow"

# Debug Issue
"Open the broken page, check console and network tab,
and tell me what's causing the error"
```

---

## When to Keep Playwright

**Keep Playwright for:**
- ✅ CI/CD automated regression testing
- ✅ Headless test runs in GitHub Actions
- ✅ Cross-browser testing (Firefox, Safari, Edge)
- ✅ Large test suites that run automatically

**Use Chrome Extension for:**
- ✅ Interactive visual validation
- ✅ Debugging UI issues
- ✅ One-off feature testing
- ✅ Design review and comparison
- ✅ Recording demos/workflows
- ✅ Manual exploratory testing

---

**Last Updated**: 2026-01-10
**Protocol Version**: 1.0.0
