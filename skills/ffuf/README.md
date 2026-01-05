# FFUF Web Fuzzing - Pack Overview

**Pack Version**: 2.0
**Skill Name**: ffuf-web-fuzzing
**Contributor**: Joseph Thacker (@rez0)
**Complexity**: Medium (Pentesting tool with workflows, templates, and helper script)

---

## Overview

FFUF (Fuzz Faster U Fool) is a comprehensive penetration testing skill for web fuzzing using the fast ffuf tool written in Go. This skill provides expert guidance for discovering hidden content, directories, files, subdomains, and testing for vulnerabilities during security assessments.

**What makes this skill powerful:**
- **Raw request fuzzing** for authenticated endpoints (JWT, OAuth, session cookies)
- **Auto-calibration** (`-ac`) to eliminate false positives automatically
- **Multi-wordlist modes** (clusterbomb, pitchfork, sniper) for complex fuzzing scenarios
- **Pre-built templates** for common authenticated fuzzing patterns
- **Helper script** for result analysis, req.txt generation, and IDOR wordlists

---

## What's Included

### Core Components

**1. SKILL.md** (501 lines)
- Comprehensive ffuf command reference
- Auto-calibration best practices (mandatory `-ac` usage)
- Raw HTTP request fuzzing with `--request`
- Filtering and matching strategies
- Rate limiting and timing controls
- Output formats (JSON, HTML, CSV)
- Advanced techniques (encoding, proxy, cookies, auth)
- Vulnerability testing patterns (SQL injection, XSS, command injection)
- Troubleshooting guide
- Quick reference card

**2. Workflow Files** (workflows/)
- `directory-scan.md` - Directory and file discovery workflow
- `parameter-fuzz.md` - GET/POST parameter fuzzing workflow

**3. Resource Files** (resources/)
- `REQUEST_TEMPLATES.md` - Pre-built req.txt templates for 12+ auth scenarios (JWT, OAuth, session cookies, API keys, Basic Auth, etc.)
- `WORDLISTS.md` - SecLists wordlist recommendations and quick reference patterns

**4. Helper Script**
- `ffuf_helper.py` - Python utility for:
  - Analyzing ffuf JSON results for anomalies
  - Creating req.txt template files from command-line arguments
  - Generating number-based wordlists for IDOR testing

---

## Architecture

```
FFUF Web Fuzzing Skill Architecture
===================================

┌─────────────────────────────────────────────────────────────┐
│                      Core SKILL.md                          │
│  • ffuf command syntax and all flags                        │
│  • Auto-calibration (-ac) enforcement                       │
│  • Raw request fuzzing (--request)                          │
│  • Filtering strategies (matchers/filters)                  │
│  • Best practices and troubleshooting                       │
└────────────────────┬────────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│Workflows │  │Resources │  │Helper Script │
├──────────┤  ├──────────┤  ├──────────────┤
│• Directory│ │• Templates│ │ffuf_helper.py│
│  Scan     │ │  (12 auth │ │              │
│• Parameter│ │  patterns)│ │• analyze     │
│  Fuzz     │ │• Wordlists│ │  results     │
│           │ │  guide    │ │• create-req  │
│           │ │           │ │• wordlist    │
└──────────┘  └──────────┘  └──────────────┘
      │              │              │
      └──────────────┼──────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │   User Fuzzing Workflow      │
      ├──────────────────────────────┤
      │ 1. Choose wordlist           │
      │ 2. Build ffuf command        │
      │    (ALWAYS with -ac)         │
      │ 3. Execute scan              │
      │ 4. Analyze results           │
      │    (helper script optional)  │
      │ 5. Follow-up fuzzing         │
      └──────────────────────────────┘
```

### Three Fuzzing Modes

**Mode 1: Unauthenticated Fuzzing**
```
User Query → Build Command → Add -ac → Execute → Analyze Results
```

**Mode 2: Authenticated Fuzzing (Command-Line)**
```
User Query → Add Headers/Cookies → Add -ac → Execute → Analyze Results
```

**Mode 3: Authenticated Fuzzing (Raw Request)**
```
Capture Request → Save to req.txt → Insert FUZZ → ffuf --request req.txt -ac
```

---

## Key Features

### 1. Auto-Calibration Enforcement (`-ac`)

**The #1 Rule**: ALWAYS use `-ac` for every ffuf scan.

**Why mandatory:**
- Automatically detects and filters repetitive false positives
- Removes noise from dynamic websites with random content
- Makes results analysis 10x easier for both humans and Claude
- Prevents thousands of identical 404/403 responses from cluttering output
- Adapts to the target's specific behavior

**Without `-ac`:**
```bash
# BAD - Will produce thousands of false positives
ffuf -w wordlist.txt -u https://target.com/FUZZ
# Result: 9,500 responses (95% noise)
```

**With `-ac`:**
```bash
# GOOD - Clean, actionable results
ffuf -w wordlist.txt -u https://target.com/FUZZ -ac
# Result: 12 unique responses (95% noise filtered automatically)
```

**Variants:**
- `-ac` - Standard auto-calibration
- `-ach` - Per-host auto-calibration (for multiple hosts)
- `-acc "pattern"` - Custom auto-calibration string

---

### 2. Raw HTTP Request Fuzzing (`--request`)

**The game-changer for authenticated pentesting.**

**Traditional Approach (Hard):**
```bash
# Complex command-line flags, easy to mess up
ffuf -w wordlist.txt -u https://api.target.com/users/FUZZ \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Cookie: session=abc123; csrftoken=def456" \
  -H "X-CSRF-Token: def456" \
  -H "User-Agent: Mozilla/5.0..." \
  -ac
```

**Raw Request Approach (Easy):**

1. **Capture full authenticated request** (Burp Suite, browser DevTools)
2. **Save to req.txt** with FUZZ keyword where you want to fuzz
3. **Run with --request**:

```bash
ffuf --request req.txt -w wordlist.txt -ac -o results.json
```

**Example req.txt:**
```http
POST /api/v1/users/FUZZ HTTP/1.1
Host: api.target.com
User-Agent: Mozilla/5.0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: session=abc123xyz; csrftoken=def456
Content-Type: application/json
Content-Length: 27

{"action":"view","id":"1"}
```

**Use Cases:**
- Fuzzing authenticated API endpoints
- Testing with JWT tokens, session cookies, CSRF tokens
- IDOR testing (fuzz user IDs, document IDs)
- OAuth 2.0 protected resources
- Complex multi-header requirements

---

### 3. Multi-Wordlist Modes

**Clusterbomb** (cartesian product - all combinations):
```bash
ffuf -w users.txt:USER -w passes.txt:PASS \
     -u https://target.com/login \
     -d "username=USER&password=PASS" \
     -mode clusterbomb -ac
```
- Tests every user with every password
- 100 users × 100 passwords = 10,000 combinations

**Pitchfork** (parallel iteration - 1-to-1 matching):
```bash
ffuf -w users.txt:USER -w passes.txt:PASS \
     -u https://target.com/login \
     -d "username=USER&password=PASS" \
     -mode pitchfork -ac
```
- Tests user[0] with password[0], user[1] with password[1], etc.
- 100 users + 100 passwords = 100 iterations

**Sniper** (one position at a time):
```bash
ffuf -w wordlist.txt \
     -u https://target.com/FUZZ1/FUZZ2 \
     -mode sniper -ac
```
- Tests FUZZ1 first (keeping FUZZ2 static), then FUZZ2 (keeping FUZZ1 static)

---

### 4. Comprehensive Filtering System

**Matchers** (include results):
- `-mc`: Match status codes (default: 200-299,301,302,307,401,403,405,500)
- `-ml`: Match line count
- `-mr`: Match regex pattern
- `-ms`: Match response size
- `-mt`: Match response time (e.g., `>100ms` or `<100ms`)
- `-mw`: Match word count

**Filters** (exclude results):
- `-fc`: Filter status codes (e.g., `-fc 404,403,401`)
- `-fl`: Filter line count
- `-fr`: Filter regex (e.g., `-fr "error"`)
- `-fs`: Filter response size (e.g., `-fs 42,4242`)
- `-ft`: Filter response time
- `-fw`: Filter word count

**Strategy:**
1. Run initial scan to see default responses
2. Identify common response sizes, status codes, patterns
3. Filter out noise: `-fc 404 -fs 1234`
4. Or match interesting: `-mc 200,500 -mr "admin"`

---

### 5. Pre-Built Request Templates

**12+ authenticated request templates** in `resources/REQUEST_TEMPLATES.md`:

1. **JWT Bearer Token API Request**
2. **Session Cookie + CSRF Token**
3. **API Key Header** (X-API-Key)
4. **Basic Auth**
5. **OAuth 2.0 Bearer**
6. **POST JSON with Auth**
7. **GraphQL with Auth**
8. **Multi-Step Auth** (login → token → request)
9. **Client Certificate Auth**
10. **Custom Header Auth**
11. **IDOR Testing Template**
12. **Admin Panel Access Template**

Each template includes:
- Complete HTTP request format
- FUZZ placement examples
- Usage command
- Common filters/matchers

---

### 6. Helper Script (`ffuf_helper.py`)

**Three main functions:**

**A. Analyze Results**
```bash
python3 ffuf_helper.py analyze results.json
```
- Finds anomalies (status code outliers, size outliers, timing outliers)
- Highlights interesting endpoints (admin, api, backup, config, .git)
- Flags potential vulnerabilities (error messages, stack traces)
- Suggests follow-up fuzzing

**B. Create Request Templates**
```bash
python3 ffuf_helper.py create-req -o req.txt -m POST \
    -u "https://api.target.com/users" \
    -H "Authorization: Bearer TOKEN" \
    -d '{"action":"FUZZ"}'
```
- Generates req.txt from command-line arguments
- Validates HTTP format
- Inserts FUZZ keywords automatically

**C. Generate Wordlists**
```bash
python3 ffuf_helper.py wordlist -o ids.txt -t numbers -s 1 -e 10000
```
- Creates number ranges for IDOR testing
- Supports custom patterns
- Configurable start/end/step

---

## Use Cases

### Use Case 1: Directory and File Discovery (Unauthenticated)

**Scenario**: Discover hidden directories and files on a web application.

**Workflow**:

**Step 1 - Basic directory scan:**
```bash
ffuf -w ~/wordlists/common.txt \
     -u https://target.com/FUZZ \
     -ac -c -v
```

**Step 2 - Add file extensions:**
```bash
ffuf -w ~/wordlists/raft-large-directories.txt \
     -u https://target.com/FUZZ \
     -e .php,.html,.txt,.pdf,.bak,.old \
     -ac -c -v -o results.json
```

**Step 3 - Recursive discovery:**
```bash
ffuf -w ~/wordlists/common.txt \
     -u https://target.com/FUZZ \
     -recursion -recursion-depth 2 \
     -maxtime-job 120 \
     -ac -c -v -o results.json
```

**Expected Results**:
- 10-50 interesting directories/files
- Examples: /admin, /backup, /api, /config.php, /db_backup.sql
- Time: 2-10 minutes (depending on wordlist size)

---

### Use Case 2: Authenticated API Endpoint Fuzzing

**Scenario**: Fuzz API endpoints with JWT authentication to find hidden or undocumented endpoints.

**Workflow**:

**Step 1 - Capture authenticated request** (use Burp Suite or browser DevTools):
```http
GET /api/v1/users HTTP/1.1
Host: api.target.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Step 2 - Create req.txt** with FUZZ in the endpoint path:
```http
GET /api/v1/FUZZ HTTP/1.1
Host: api.target.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Step 3 - Run ffuf with --request:**
```bash
ffuf --request req.txt \
     -w ~/wordlists/api-endpoints.txt \
     -ac -mc 200,201 -o results.json
```

**Step 4 - Analyze results:**
```bash
python3 ffuf_helper.py analyze results.json
```

**Expected Results**:
- 5-20 undocumented API endpoints
- Examples: /admin/users, /internal/debug, /api/v1/exports
- Potential IDOR endpoints, admin functions, debug interfaces

---

### Use Case 3: Subdomain Enumeration

**Scenario**: Discover subdomains of a target domain.

**Workflow**:

**Step 1 - Basic subdomain fuzzing:**
```bash
ffuf -w ~/wordlists/subdomains-top5000.txt \
     -u https://FUZZ.target.com \
     -ac -c -v
```

**Step 2 - Virtual host discovery (same IP, different responses):**
```bash
ffuf -w ~/wordlists/subdomains.txt \
     -u https://target.com \
     -H "Host: FUZZ.target.com" \
     -ac -c -v
```

**Step 3 - Filter default responses:**
```bash
# First, identify default response size
ffuf -w ~/wordlists/subdomains.txt \
     -u https://FUZZ.target.com \
     -fs 4242  # Filter size of default response
     -ac -c -v -o results.json
```

**Expected Results**:
- 3-15 active subdomains
- Examples: dev.target.com, api.target.com, staging.target.com, admin.target.com
- Time: 1-5 minutes

---

### Use Case 4: IDOR (Insecure Direct Object Reference) Testing

**Scenario**: Test for IDOR vulnerabilities by fuzzing user IDs, document IDs, or resource IDs in authenticated requests.

**Workflow**:

**Step 1 - Capture authenticated request** accessing a resource:
```http
GET /api/v1/documents/123 HTTP/1.1
Host: api.target.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: session=abc123xyz
Accept: application/json
```

**Step 2 - Create req.txt with FUZZ in the ID:**
```http
GET /api/v1/documents/FUZZ HTTP/1.1
Host: api.target.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: session=abc123xyz
Accept: application/json
```

**Step 3 - Generate number wordlist:**
```bash
python3 ffuf_helper.py wordlist -o ids.txt -t numbers -s 1 -e 10000
```

**Step 4 - Run IDOR test:**
```bash
ffuf --request req.txt \
     -w ids.txt \
     -ac -mc 200 -fw 100-200 \
     -o idor_results.json
```

**Step 5 - Analyze for unauthorized access:**
```bash
python3 ffuf_helper.py analyze idor_results.json
```

**Expected Results**:
- Documents accessible beyond your authorization
- 1-50 IDOR vulnerabilities (depending on application)
- Critical: Access to other users' documents, admin resources, sensitive data

---

### Use Case 5: Parameter Fuzzing for Hidden Functionality

**Scenario**: Discover hidden GET/POST parameters that enable debugging, admin features, or bypass authentication.

**Workflow**:

**Step 1 - Fuzz GET parameter names:**
```bash
ffuf -w ~/wordlists/burp-parameter-names.txt \
     -u "https://target.com/page?FUZZ=test" \
     -ac -mc 200 -v
```

**Step 2 - Fuzz POST parameter names:**
```bash
ffuf -w ~/wordlists/burp-parameter-names.txt \
     -X POST \
     -d "FUZZ=test&username=admin" \
     -u https://target.com/login \
     -ac -mc 200,302 -v
```

**Step 3 - Fuzz parameter values:**
```bash
ffuf -w ~/wordlists/parameter-values.txt \
     -u "https://target.com/page?debug=FUZZ" \
     -ac -mr "enabled|true|1" -v
```

**Expected Results**:
- Hidden parameters: debug, admin, bypass, test, dev, internal
- Examples: ?debug=true, ?admin=1, ?bypass=secret
- Potential security issues: debug modes, admin access, auth bypasses

---

## Dependencies

### Required

**1. ffuf Binary**
- **Source**: https://github.com/ffuf/ffuf
- **Installation Methods**:
  - Go: `go install github.com/ffuf/ffuf/v2@latest`
  - Homebrew: `brew install ffuf`
  - Binary download: https://github.com/ffuf/ffuf/releases/latest
- **Version**: Latest (v2.0.0+)
- **Platform**: Linux, macOS, Windows

**2. Claude Code CLI**
- For skill loading and workflow guidance
- Latest stable release

### Optional (Recommended)

**3. Python 3.8+** (for ffuf_helper.py)
- **Purpose**: Result analysis, req.txt generation, wordlist generation
- **Installation**: https://www.python.org/downloads/

**4. SecLists Wordlists**
- **Source**: https://github.com/danielmiessler/SecLists
- **Installation**: `git clone https://github.com/danielmiessler/SecLists.git ~/wordlists/`
- **Purpose**: High-quality wordlists for directories, subdomains, parameters, usernames, passwords
- **Size**: ~450MB

**5. Burp Suite** (Community or Pro)
- **Purpose**: Capturing authenticated HTTP requests for --request fuzzing
- **Alternative**: Browser DevTools (Network tab → Copy as cURL → Convert to req.txt)

---

## Skill Integration Points

### Skills This Depends On

None - ffuf is a standalone pentesting skill.

### Skills That Use This

**1. pentester** (if exists)
- Calls ffuf skill for web fuzzing during penetration tests
- Uses automated workflows for common scenarios

**2. webapp-testing** (if exists)
- May reference ffuf for security testing
- Complementary to functional testing

### Configuration It Reads

**ffuf Configuration File** (optional):
- **Location**: `~/.config/ffuf/ffufrc`
- **Format**: INI-style configuration
- **Purpose**: Default settings (headers, timeout, threads, colors, matchers)

**Example ~/.config/ffuf/ffufrc:**
```ini
[http]
headers = ["User-Agent: Mozilla/5.0"]
timeout = 10

[general]
colors = true
threads = 40

[matcher]
status = "200-299,301,302,307,401,403,405,500"
```

### Outputs It Generates

**1. JSON Results** (`-o results.json`):
```json
{
  "results": [
    {
      "input": {"FUZZ": "admin"},
      "position": 1,
      "status": 200,
      "length": 4523,
      "words": 245,
      "lines": 89,
      "content-type": "text/html",
      "redirectlocation": "",
      "url": "https://target.com/admin",
      "resultfile": "",
      "host": "target.com",
      "duration": 45
    }
  ]
}
```

**2. HTML Reports** (`-of html -o report.html`):
- Tabular results with sortable columns
- Color-coded status codes
- Clickable URLs

**3. CSV Exports** (`-of csv -o results.csv`):
- Spreadsheet-compatible format
- For further analysis, reporting

---

## Configuration

### Default Configuration (Recommended)

**1. Create ffuf config** at `~/.config/ffuf/ffufrc`:

```bash
mkdir -p ~/.config/ffuf
cat > ~/.config/ffuf/ffufrc << 'EOF'
[http]
headers = ["User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"]
timeout = 10
followredirects = false

[general]
colors = true
verbose = false
quiet = false
stoponerrors = false
stoponsuccess = false
threads = 40

[matcher]
status = "200-299,301,302,307,401,403,405,500"

[output]
outputformat = "json"
outputdirectory = "."
EOF
```

**2. Install SecLists wordlists:**

```bash
git clone https://github.com/danielmiessler/SecLists.git ~/wordlists/
```

**3. Verify ffuf installation:**

```bash
ffuf -V
# Output: ffuf version vX.X.X
```

### Environment Variables

**FFUF_PATH** (optional):
- Set custom path to ffuf binary
- Example: `export FFUF_PATH=/opt/ffuf/ffuf`

**WORDLIST_DIR** (optional):
- Set default wordlist directory
- Example: `export WORDLIST_DIR=~/wordlists/SecLists`

---

## Key Principles

### 1. Always Use Auto-Calibration (`-ac`)

**Golden Rule**: NEVER run ffuf without `-ac` (except for initial testing).

**Why:**
- Filters 90-95% of false positives automatically
- Makes results actionable
- Essential for Claude to analyze results effectively

**Exception**: Initial testing to understand default responses (use `-v` to see what `-ac` would filter).

---

### 2. Raw Requests for Authenticated Fuzzing

**Principle**: Don't fight with command-line flags for complex authentication.

**Better Approach**:
1. Capture full authenticated request (Burp Suite, DevTools)
2. Save to req.txt
3. Insert FUZZ keyword
4. Run: `ffuf --request req.txt -w wordlist.txt -ac`

**Benefits**:
- Perfect authentication replication
- No flag syntax errors
- Easy to modify and test

---

### 3. Filter Strategically

**Principle**: Understand the target's responses before filtering.

**Strategy**:
1. **Initial scan** - Run with `-ac -v` to see what's being filtered
2. **Identify patterns** - Common response sizes, status codes
3. **Apply filters** - Use `-fc`, `-fs`, `-fr` to remove noise
4. **Match interesting** - Use `-mc`, `-mr` to highlight anomalies

---

### 4. Use Appropriate Wordlists

**Principle**: Bigger is not always better.

**Recommendation**:
- **Start small** - Use common.txt (5,000 entries) for initial recon
- **Escalate** - Move to raft-large (200,000 entries) if needed
- **Targeted** - Use specialized lists for specific tasks (API endpoints, parameters, subdomains)

**SecLists Recommendations**:
- **Directories**: `Discovery/Web-Content/raft-large-directories.txt`
- **Files**: `Discovery/Web-Content/raft-large-files.txt`
- **Subdomains**: `Discovery/DNS/subdomains-top1million-5000.txt`
- **Parameters**: `Discovery/Web-Content/burp-parameter-names.txt`
- **API**: `Discovery/Web-Content/api/api-endpoints.txt`

---

### 5. Rate Limiting for Stealth

**Principle**: Don't trigger WAF/IDS or overwhelm the target.

**Stealth Mode**:
```bash
ffuf -w wordlist.txt -u https://target.com/FUZZ \
     -rate 2         # 2 requests/second \
     -t 10           # 10 threads max \
     -p 0.5-1.5      # Random 0.5-1.5s delay \
     -ac -c -v
```

**Production Mode** (fast, but noisy):
```bash
ffuf -w wordlist.txt -u https://target.com/FUZZ \
     -t 100 -ac -c -v
```

---

### 6. Always Save Results

**Principle**: Save output for documentation, reporting, and further analysis.

**Recommended**:
```bash
ffuf -w wordlist.txt -u https://target.com/FUZZ \
     -ac -c -v \
     -o results.json -of json
```

**For Reports**:
```bash
ffuf -w wordlist.txt -u https://target.com/FUZZ \
     -ac -c -v \
     -of all -o results  # Creates results.json, results.html, results.csv
```

---

### 7. Use Interactive Mode

**Principle**: Adjust filters on the fly without restarting.

**How**: Press ENTER during ffuf execution to enter interactive mode.

**Interactive Commands**:
- **fc** - Add filter status codes
- **fs** - Add filter size
- **fl** - Add filter lines
- **fw** - Add filter words
- **fr** - Add filter regex
- **mc** - Add match status codes
- **ms** - Add match size
- **savejson** - Save current results
- **resume** - Resume scan
- **restart** - Restart scan
- **quit** - Exit

---

### 8. Understand Multi-Wordlist Modes

**Principle**: Choose the right mode for the job.

**Clusterbomb** - Test all combinations:
- Use case: Username + password brute force
- 100 users × 100 passwords = 10,000 requests

**Pitchfork** - Parallel iteration:
- Use case: Known username:password pairs
- 100 users + 100 passwords = 100 requests

**Sniper** - One position at a time:
- Use case: Multiple FUZZ positions, test sequentially
- Good for focused testing

---

### 9. Helper Script for Efficiency

**Principle**: Automate repetitive tasks.

**Use Helper Script For**:
- **Result analysis** - Find anomalies, interesting endpoints
- **req.txt generation** - Create templates from command-line
- **Wordlist generation** - IDOR number ranges, custom patterns

**Don't use helper script for**:
- Simple scans (overhead not worth it)
- Real-time scanning (ffuf output is better)

---

### 10. Reference Templates Liberally

**Principle**: Don't reinvent the wheel for common scenarios.

**Use REQUEST_TEMPLATES.md**:
- JWT authentication patterns
- Session cookie + CSRF token patterns
- OAuth 2.0 patterns
- API key patterns
- Basic Auth patterns
- Multi-step auth patterns

**Copy, modify FUZZ placement, run**:
```bash
# Copy template 2 (Session Cookie + CSRF Token)
# Modify: Replace session ID, CSRF token, FUZZ placement
# Run: ffuf --request req.txt -w wordlist.txt -ac
```

---

## Token Savings

### Before Pack v2.0 (Single SKILL.md)

**Tokens loaded upfront**: ~5,500 tokens
- SKILL.md: 501 lines × 11 tokens/line ≈ 5,500 tokens
- Workflows: Embedded in SKILL.md
- Resources: Referenced but not loaded
- Helper script: Usage only

### After Pack v2.0 (Progressive Disclosure)

**Tokens loaded upfront**: ~5,500 tokens (SKILL.md only)
- SKILL.md: 501 lines (unchanged - focused on usage)

**Tokens loaded on-demand**:
- PACK_README.md: ~700 lines (~7,700 tokens) - Load when: "show pack overview", "architecture", "use cases"
- PACK_INSTALL.md: ~500 lines (~5,500 tokens) - Load when: "install ffuf", "setup", "prerequisites"
- PACK_VERIFY.md: ~600 lines (~6,600 tokens) - Load when: "verify installation", "test ffuf"
- REQUEST_TEMPLATES.md: ~300 lines (~3,300 tokens) - Load when: "show auth templates", "JWT example"
- WORDLISTS.md: ~200 lines (~2,200 tokens) - Load when: "wordlist recommendations"
- Workflows: ~130 lines (~1,400 tokens) - Load when: "directory scan workflow", "parameter fuzz"

**Total documentation**: ~2,930 lines (~32,200 tokens)

**Token savings**:
- **Without Pack v2.0**: 32,200 tokens loaded upfront
- **With Pack v2.0**: 5,500 tokens upfront, 26,700 on-demand
- **Savings**: 82% reduction in initial token usage

**User benefit**: Faster skill loading, more tokens available for actual pentesting work, cleaner context.

---

**Pack Overview Version**: 2.0
**Last Updated**: 2026-01-03
**Estimated Reading Time**: 15-20 minutes

---

**SKILL QUALITY GUARANTEE**
- Contributed by Joseph Thacker (@rez0), professional penetration tester
- Battle-tested patterns and workflows
- Auto-calibration enforcement for clean results
- Raw request fuzzing for authenticated scenarios
- Helper script for automation and efficiency

*[Pack v2.0 - Progressive Disclosure]*
