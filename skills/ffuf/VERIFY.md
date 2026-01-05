# ffuf Web Fuzzing - Verification Checklist

**Pack Version**: 2.0
**Verification Time**: 30-45 minutes
**Prerequisites**: PACK_INSTALL.md completed successfully

---

## Overview

This verification checklist ensures that the ffuf web fuzzing skill is properly installed, configured, and ready for penetration testing operations. Complete all sections to validate full functionality.

**Verification Levels**:
- ✅ **REQUIRED** - Must pass for skill to function
- 🔶 **RECOMMENDED** - Should pass for optimal experience
- 🔷 **OPTIONAL** - Nice to have, not critical

---

## Section 1: Core Installation (REQUIRED ✅)

### 1.1 Skill Files Present

**Test**:
```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/ffuf/"

# Windows (PowerShell)
Get-ChildItem "$env:USERPROFILE\.claude\skills\ffuf\" -Force
```

**Expected Files**:
```
✅ SKILL.md (501 lines, ~15,500 bytes)
✅ PACK_README.md (~700 lines, ~7,700 bytes)
✅ PACK_INSTALL.md (~600 lines, ~6,500 bytes)
✅ PACK_VERIFY.md (this file)
✅ ffuf_helper.py (~200 lines, ~6,500 bytes)
✅ resources/REQUEST_TEMPLATES.md (~300 lines)
✅ resources/WORDLISTS.md (~100 lines)
✅ workflows/directory-scan.md (60 lines)
✅ workflows/parameter-fuzz.md (67 lines)
```

**Status**: ☐ PASS / ☐ FAIL

**If FAIL**: Skill files missing - see PACK_INSTALL.md Step 1

---

### 1.2 Skill Loading in Claude Code

**Test**:
1. Start Claude Code session: `claude`
2. Type: `@ffuf`

**Expected Behavior**:
- ✅ Skill activates immediately
- ✅ Kai loads ffuf context
- ✅ Ready to guide web fuzzing operations
- ✅ No "skill not found" errors

**Status**: ☐ PASS / ☐ FAIL

**If FAIL**: See PACK_INSTALL.md Troubleshooting Issue #2

---

### 1.3 ffuf Binary Installed

**Test**:
```bash
ffuf -V
```

**Expected Output**:
```
ffuf version 2.x.x
```

**Minimum Version**: v2.0.0

**Status**: ☐ PASS / ☐ FAIL

**If FAIL**: See PACK_INSTALL.md Step 3

---

### 1.4 ffuf Basic Functionality

**Test**:
```bash
# Create test wordlist
cat > /tmp/test-ffuf.txt << EOF
test
admin
api
EOF

# Run basic ffuf test (replace example.com with your test target)
ffuf -w /tmp/test-ffuf.txt \
     -u https://example.com/FUZZ \
     -ac -mc all -t 1 -v
```

**Expected Output**:
- ✅ ffuf starts without errors
- ✅ Banner displays (ASCII art with version)
- ✅ Auto-calibration runs
- ✅ Results displayed (even if no matches)
- ✅ No "command not found" or syntax errors

**Status**: ☐ PASS / ☐ FAIL

**If FAIL**: See PACK_INSTALL.md Troubleshooting Issue #1

**Cleanup**:
```bash
rm /tmp/test-ffuf.txt
```

---

## Section 2: Pack Documentation (REQUIRED ✅)

### 2.1 PACK_README.md Accessible

**Test** (in Claude Code session):
```
Load the ffuf Pack README
```

**Expected Behavior**:
- ✅ Kai reads PACK_README.md
- ✅ Displays overview of ffuf methodology
- ✅ Shows architecture diagram
- ✅ Lists 6 key features
- ✅ Describes 5 use cases

**Status**: ☐ PASS / ☐ FAIL

---

### 2.2 PACK_INSTALL.md Accessible

**Test** (in Claude Code session):
```
Read the ffuf installation guide
```

**Expected Behavior**:
- ✅ Kai reads PACK_INSTALL.md
- ✅ Displays prerequisites and installation steps
- ✅ Shows troubleshooting section

**Status**: ☐ PASS / ☐ FAIL

---

### 2.3 PACK_VERIFY.md Accessible

**Test** (in Claude Code session):
```
Read the ffuf verification checklist
```

**Expected Behavior**:
- ✅ Kai reads PACK_VERIFY.md (this file)
- ✅ Displays verification sections

**Status**: ☐ PASS / ☐ FAIL

---

## Section 3: Workflow Documentation (REQUIRED ✅)

### 3.1 Directory Scan Workflow

**Test**:
```bash
# Unix/Mac
cat "$HOME/.claude/skills/ffuf/workflows/directory-scan.md" | head -20

# Windows (PowerShell)
Get-Content "$env:USERPROFILE\.claude\skills\ffuf\workflows\directory-scan.md" | Select-Object -First 20
```

**Expected Content**:
```markdown
# Directory and File Discovery Workflow

## Trigger
User says: "scan directories", "find hidden files", "directory brute force"

## Workflow

### 1. Basic Directory Scan
```bash
ffuf -w /path/to/wordlist.txt \
     -u https://target.com/FUZZ \
     -c -v
```
```

**Status**: ☐ PASS / ☐ FAIL

---

### 3.2 Parameter Fuzz Workflow

**Test**:
```bash
# Unix/Mac
cat "$HOME/.claude/skills/ffuf/workflows/parameter-fuzz.md" | head -20

# Windows (PowerShell)
Get-Content "$env:USERPROFILE\.claude\skills\ffuf\workflows\parameter-fuzz.md" | Select-Object -First 20
```

**Expected Content**:
```markdown
# Parameter Fuzzing Workflow

## Trigger
User says: "fuzz parameters", "test GET/POST params", "parameter discovery"

## Workflow

### 1. GET Parameter Discovery
```

**Status**: ☐ PASS / ☐ FAIL

---

## Section 4: Auto-Calibration (REQUIRED ✅)

### 4.1 Auto-Calibration Flag Works

**Test**:
```bash
# Create test wordlist with noise
cat > /tmp/test-autocal.txt << EOF
admin
test
api
NONEXISTENT_asdfjkl_12345
FAKE_qwerty_67890
EOF

# Run WITH auto-calibration
ffuf -w /tmp/test-autocal.txt \
     -u https://example.com/FUZZ \
     -ac -mc all -t 1 -v \
     -o /tmp/ffuf-autocal-results.json
```

**Expected Behavior**:
- ✅ Auto-calibration runs (shows "Calibrating..." message)
- ✅ Filters common false positives automatically
- ✅ Only unique responses displayed
- ✅ Results saved to JSON file

**Verify Results**:
```bash
cat /tmp/ffuf-autocal-results.json
# Should contain minimal results (mostly filtered out)
```

**Status**: ☐ PASS / ☐ FAIL

**Cleanup**:
```bash
rm /tmp/test-autocal.txt /tmp/ffuf-autocal-results.json
```

---

### 4.2 Without Auto-Calibration (Comparison Test)

**Test**:
```bash
# Create same test wordlist
cat > /tmp/test-no-autocal.txt << EOF
admin
test
api
NONEXISTENT_asdfjkl_12345
FAKE_qwerty_67890
EOF

# Run WITHOUT auto-calibration
ffuf -w /tmp/test-no-autocal.txt \
     -u https://example.com/FUZZ \
     -mc all -t 1 -v \
     -o /tmp/ffuf-no-autocal-results.json
```

**Expected Behavior**:
- ✅ No calibration step
- ✅ ALL responses displayed (including noise)
- ✅ Significantly more results than with `-ac`

**Compare**:
```bash
# Count results with -ac
cat /tmp/ffuf-autocal-results.json | grep -c "\"input\""

# Count results without -ac
cat /tmp/ffuf-no-autocal-results.json | grep -c "\"input\""

# Without -ac should have MORE results
```

**Status**: ☐ PASS / ☐ FAIL

**Cleanup**:
```bash
rm /tmp/test-no-autocal.txt /tmp/ffuf-no-autocal-results.json
```

---

## Section 5: Raw Request Fuzzing (REQUIRED ✅)

### 5.1 Create req.txt File

**Test**:
```bash
# Create simple GET request template
cat > /tmp/test-req.txt << 'EOF'
GET /FUZZ HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: close
Upgrade-Insecure-Requests: 1

EOF
```

**Verify Format**:
```bash
cat /tmp/test-req.txt
```

**Expected**:
- ✅ Starts with HTTP method (GET/POST/etc)
- ✅ Contains `FUZZ` keyword
- ✅ Contains `Host:` header
- ✅ Contains blank line before body (if POST)

**Status**: ☐ PASS / ☐ FAIL

---

### 5.2 Use --request Flag

**Test**:
```bash
# Create test wordlist
cat > /tmp/test-paths.txt << EOF
admin
api
test
EOF

# Run ffuf with raw request
ffuf --request /tmp/test-req.txt \
     -w /tmp/test-paths.txt \
     -ac -mc all -t 1 -v
```

**Expected Behavior**:
- ✅ ffuf reads req.txt file
- ✅ Replaces `FUZZ` with wordlist entries
- ✅ Sends HTTP requests with exact headers from req.txt
- ✅ No "Error parsing request file" messages

**Status**: ☐ PASS / ☐ FAIL

**Cleanup**:
```bash
rm /tmp/test-req.txt /tmp/test-paths.txt
```

---

### 5.3 POST Request with Body

**Test**:
```bash
# Create POST request with JSON body
cat > /tmp/test-post-req.txt << 'EOF'
POST /api/login HTTP/1.1
Host: example.com
Content-Type: application/json
User-Agent: Mozilla/5.0
Accept: application/json
Content-Length: 45

{"username":"admin","password":"FUZZ"}
EOF

# Create password wordlist
cat > /tmp/test-passwords.txt << EOF
password123
admin
test123
EOF

# Run ffuf with POST request
ffuf --request /tmp/test-post-req.txt \
     -w /tmp/test-passwords.txt \
     -ac -mc all -t 1 -v
```

**Expected Behavior**:
- ✅ ffuf sends POST requests
- ✅ JSON body included with `FUZZ` replaced
- ✅ Content-Type header preserved
- ✅ No parsing errors

**Status**: ☐ PASS / ☐ FAIL

**Cleanup**:
```bash
rm /tmp/test-post-req.txt /tmp/test-passwords.txt
```

---

## Section 6: Helper Script (RECOMMENDED 🔶)

### 6.1 Python Installed

**Test**:
```bash
python3 --version
```

**Expected Output**:
```
Python 3.8.x or higher
```

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

**If FAIL**: See PACK_INSTALL.md Step 5

---

### 6.2 Helper Script Executable

**Test**:
```bash
# Unix/Mac
python3 "$HOME/.claude/skills/ffuf/ffuf_helper.py" --help

# Windows (PowerShell)
python "$env:USERPROFILE\.claude\skills\ffuf\ffuf_helper.py" --help
```

**Expected Output**:
```
usage: ffuf_helper.py [-h] {analyze,create-req,wordlist} ...

ffuf Helper Script - Analyze results, create request files, generate wordlists

positional arguments:
  {analyze,create-req,wordlist}
    analyze             Analyze ffuf results to find anomalies
    create-req          Create a raw HTTP request file for ffuf
    wordlist            Generate custom wordlists for fuzzing
```

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

**If FAIL**: See PACK_INSTALL.md Troubleshooting Issue #4

---

### 6.3 Analyze Function

**Test**:
```bash
# Create sample ffuf results
cat > /tmp/test-results.json << 'EOF'
{
  "results": [
    {"input": {"FUZZ": "admin"}, "status": 200, "length": 1234, "words": 567, "lines": 89},
    {"input": {"FUZZ": "test"}, "status": 404, "length": 456, "words": 78, "lines": 12},
    {"input": {"FUZZ": "api"}, "status": 200, "length": 5678, "words": 901, "lines": 234}
  ]
}
EOF

# Run analyze function
python3 ~/.claude/skills/ffuf/ffuf_helper.py analyze /tmp/test-results.json
```

**Expected Output**:
- ✅ Displays anomaly detection results
- ✅ Highlights size/word/line count variations
- ✅ No Python errors

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

**Cleanup**:
```bash
rm /tmp/test-results.json
```

---

### 6.4 Create-Req Function

**Test**:
```bash
# Generate req.txt using helper script
python3 ~/.claude/skills/ffuf/ffuf_helper.py create-req \
    -o /tmp/generated-req.txt \
    -m POST \
    -u "https://example.com/api/endpoint" \
    -H "Authorization: Bearer TEST_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"action":"FUZZ","id":"123"}'
```

**Verify Output**:
```bash
cat /tmp/generated-req.txt
```

**Expected Content**:
```http
POST /api/endpoint HTTP/1.1
Host: example.com
Authorization: Bearer TEST_TOKEN
Content-Type: application/json

{"action":"FUZZ","id":"123"}
```

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

**Cleanup**:
```bash
rm /tmp/generated-req.txt
```

---

### 6.5 Wordlist Function

**Test**:
```bash
# Generate number range for IDOR testing
python3 ~/.claude/skills/ffuf/ffuf_helper.py wordlist \
    -o /tmp/test-idor-wordlist.txt \
    -t numbers \
    -s 1 \
    -e 100
```

**Verify Output**:
```bash
head -10 /tmp/test-idor-wordlist.txt
wc -l /tmp/test-idor-wordlist.txt
```

**Expected**:
- ✅ File contains numbers 1-100 (one per line)
- ✅ Line count: 100

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

**Cleanup**:
```bash
rm /tmp/test-idor-wordlist.txt
```

---

## Section 7: Resource Files (RECOMMENDED 🔶)

### 7.1 Request Templates Accessible

**Test**:
```bash
# Unix/Mac
cat "$HOME/.claude/skills/ffuf/resources/REQUEST_TEMPLATES.md" | head -50

# Windows (PowerShell)
Get-Content "$env:USERPROFILE\.claude\skills\ffuf\resources\REQUEST_TEMPLATES.md" | Select-Object -First 50
```

**Expected Content**:
```markdown
# ffuf Raw HTTP Request Templates

## Template 1: JWT Bearer Token API Request

```http
GET /api/v1/users/FUZZ HTTP/1.1
Host: api.target.com
Authorization: Bearer eyJhbGci...
```

**Status**: ☐ PASS / ☐ FAIL

---

### 7.2 Wordlists Guide Accessible

**Test**:
```bash
# Unix/Mac
cat "$HOME/.claude/skills/ffuf/resources/WORDLISTS.md"

# Windows (PowerShell)
Get-Content "$env:USERPROFILE\.claude\skills\ffuf\resources\WORDLISTS.md"
```

**Expected Content**:
- ✅ SecLists installation guide
- ✅ Wordlist categories (directories, subdomains, parameters, etc.)
- ✅ Common wordlist paths

**Status**: ☐ PASS / ☐ FAIL

---

## Section 8: SecLists Wordlists (OPTIONAL 🔷)

### 8.1 SecLists Installed

**Test**:
```bash
ls ~/wordlists/SecLists/Discovery/Web-Content/common.txt
```

**Expected**:
- ✅ File exists
- ✅ Size: ~100KB

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

**If FAIL**: See PACK_INSTALL.md Step 7

---

### 8.2 Common Wordlists Present

**Test**:
```bash
# Check key wordlists
ls ~/wordlists/SecLists/Discovery/Web-Content/common.txt
ls ~/wordlists/SecLists/Discovery/Web-Content/raft-large-directories.txt
ls ~/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt
ls ~/wordlists/SecLists/Discovery/Web-Content/burp-parameter-names.txt
```

**Expected**:
- ✅ All files exist
- ✅ Total size: ~50-100MB

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

---

## Section 9: Filtering and Matching (REQUIRED ✅)

### 9.1 Status Code Matcher

**Test**:
```bash
# Match only specific status codes
echo "test" > /tmp/test-matcher.txt

ffuf -w /tmp/test-matcher.txt \
     -u https://example.com/FUZZ \
     -mc 200,301,302 \
     -t 1 -v
```

**Expected Behavior**:
- ✅ ffuf only displays responses with status 200, 301, or 302
- ✅ Other status codes filtered out

**Status**: ☐ PASS / ☐ FAIL

**Cleanup**:
```bash
rm /tmp/test-matcher.txt
```

---

### 9.2 Size Filter

**Test**:
```bash
# Filter responses by size
echo "test" > /tmp/test-filter.txt

ffuf -w /tmp/test-filter.txt \
     -u https://example.com/FUZZ \
     -fs 1234 \
     -mc all -t 1 -v
```

**Expected Behavior**:
- ✅ ffuf excludes responses with size exactly 1234 bytes
- ✅ Other sizes displayed

**Status**: ☐ PASS / ☐ FAIL

**Cleanup**:
```bash
rm /tmp/test-filter.txt
```

---

### 9.3 Multiple Filters Combined

**Test**:
```bash
# Combine auto-calibration + status matcher + size filter
echo "test" > /tmp/test-combined.txt

ffuf -w /tmp/test-combined.txt \
     -u https://example.com/FUZZ \
     -ac -mc 200,301,302 -fs 1234 -fw 567 \
     -t 1 -v
```

**Expected Behavior**:
- ✅ Auto-calibration runs first
- ✅ Then status code filter applied
- ✅ Then size filter applied
- ✅ Then word count filter applied
- ✅ Cascading filter logic works correctly

**Status**: ☐ PASS / ☐ FAIL

**Cleanup**:
```bash
rm /tmp/test-combined.txt
```

---

## Section 10: Multi-Wordlist Modes (RECOMMENDED 🔶)

### 10.1 Clusterbomb Mode

**Test**:
```bash
# Create two wordlists
echo -e "user1\nuser2" > /tmp/users.txt
echo -e "pass1\npass2" > /tmp/passwords.txt

# Create POST request
cat > /tmp/clusterbomb-req.txt << 'EOF'
POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded

username=USER&password=PASS
EOF

# Run clusterbomb mode (all combinations)
ffuf --request /tmp/clusterbomb-req.txt \
     -w /tmp/users.txt:USER \
     -w /tmp/passwords.txt:PASS \
     -mode clusterbomb \
     -ac -mc all -t 1 -v
```

**Expected Behavior**:
- ✅ Tests all combinations (user1+pass1, user1+pass2, user2+pass1, user2+pass2)
- ✅ Total requests: 2 users × 2 passwords = 4 requests

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

**Cleanup**:
```bash
rm /tmp/users.txt /tmp/passwords.txt /tmp/clusterbomb-req.txt
```

---

### 10.2 Pitchfork Mode

**Test**:
```bash
# Create two wordlists (same length)
echo -e "admin\ntest" > /tmp/users2.txt
echo -e "adminpass\ntestpass" > /tmp/passwords2.txt

# Create POST request
cat > /tmp/pitchfork-req.txt << 'EOF'
POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded

username=USER&password=PASS
EOF

# Run pitchfork mode (1-to-1 pairing)
ffuf --request /tmp/pitchfork-req.txt \
     -w /tmp/users2.txt:USER \
     -w /tmp/passwords2.txt:PASS \
     -mode pitchfork \
     -ac -mc all -t 1 -v
```

**Expected Behavior**:
- ✅ Tests pairs (admin+adminpass, test+testpass)
- ✅ Total requests: 2 (equal to wordlist length)

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

**Cleanup**:
```bash
rm /tmp/users2.txt /tmp/passwords2.txt /tmp/pitchfork-req.txt
```

---

## Section 11: JSON Output (REQUIRED ✅)

### 11.1 Save Results to JSON

**Test**:
```bash
# Run ffuf with JSON output
echo "test" > /tmp/test-json-output.txt

ffuf -w /tmp/test-json-output.txt \
     -u https://example.com/FUZZ \
     -ac -mc all -t 1 \
     -o /tmp/ffuf-json-test.json
```

**Verify JSON File**:
```bash
cat /tmp/ffuf-json-test.json
```

**Expected Structure**:
```json
{
  "commandline": "...",
  "time": "...",
  "results": [
    {
      "input": {"FUZZ": "test"},
      "position": 0,
      "status": 404,
      "length": 1234,
      "words": 567,
      "lines": 89,
      "...": "..."
    }
  ],
  "config": {...}
}
```

**Status**: ☐ PASS / ☐ FAIL

**Cleanup**:
```bash
rm /tmp/test-json-output.txt /tmp/ffuf-json-test.json
```

---

## Section 12: Configuration File (OPTIONAL 🔷)

### 12.1 ffufrc File Present

**Test**:
```bash
# Unix/Mac
cat ~/.config/ffuf/ffufrc

# Windows
type %APPDATA%\ffuf\ffufrc
```

**Expected Content**:
```ini
[general]
colors = true
threads = 40
timeout = 10
mc = 200,204,301,302,307,401,403,405
ac = true
v = true
```

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

**If FAIL**: See PACK_INSTALL.md Step 8

---

### 12.2 Config Defaults Applied

**Test**:
```bash
# Run ffuf without explicit flags (should use config defaults)
echo "test" > /tmp/test-config.txt

ffuf -w /tmp/test-config.txt -u https://example.com/FUZZ
```

**Expected Behavior**:
- ✅ Colored output (from colors = true)
- ✅ Auto-calibration runs (from ac = true)
- ✅ Verbose output (from v = true)
- ✅ Default matchers applied

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

**Cleanup**:
```bash
rm /tmp/test-config.txt
```

---

## Section 13: Integration with Burp Suite (OPTIONAL 🔷)

### 13.1 Burp Suite Installed

**Test**:
```bash
# Check if Burp Suite is installed
# Mac
ls "/Applications/Burp Suite Professional.app"
ls "/Applications/Burp Suite Community Edition.app"

# Linux
which burpsuite

# Windows
dir "C:\Program Files\BurpSuiteCommunity\BurpSuiteCommunity.exe"
```

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

**If FAIL**: See PACK_INSTALL.md Section "Burp Suite Integration"

---

### 13.2 Capture Request in Burp

**Manual Test** (if Burp installed):
1. Start Burp Suite
2. Configure browser proxy (127.0.0.1:8080)
3. Navigate to any website
4. Capture a request in HTTP History
5. Right-click → Copy to file → Save as /tmp/burp-req.txt
6. Open /tmp/burp-req.txt and verify it contains valid HTTP request

**Expected**:
- ✅ Request saved in proper format
- ✅ Contains headers and body (if POST)
- ✅ Can be used with ffuf --request flag

**Status**: ☐ PASS / ☐ FAIL / ☐ SKIP (Optional)

---

## Section 14: Complete Workflow Test (REQUIRED ✅)

### 14.1 Directory Discovery End-to-End

**Test**:
```bash
# Step 1: Create test wordlist
cat > /tmp/workflow-test.txt << EOF
admin
api
test
backup
config
uploads
EOF

# Step 2: Run directory scan
ffuf -w /tmp/workflow-test.txt \
     -u https://example.com/FUZZ \
     -ac -mc 200,301,302,403 \
     -o /tmp/workflow-results.json \
     -v

# Step 3: Verify results saved
cat /tmp/workflow-results.json

# Step 4: Analyze with helper script (if Python installed)
python3 ~/.claude/skills/ffuf/ffuf_helper.py analyze /tmp/workflow-results.json
```

**Expected Outcome**:
- ✅ ffuf runs without errors
- ✅ Auto-calibration filters noise
- ✅ Results saved to JSON
- ✅ Helper script analyzes results (if available)

**Status**: ☐ PASS / ☐ FAIL

**Cleanup**:
```bash
rm /tmp/workflow-test.txt /tmp/workflow-results.json
```

---

### 14.2 Authenticated Request Fuzzing End-to-End

**Test**:
```bash
# Step 1: Create authenticated POST request
cat > /tmp/auth-req.txt << 'EOF'
POST /api/users/FUZZ HTTP/1.1
Host: example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_token
Content-Type: application/json
Accept: application/json

{"action":"view"}
EOF

# Step 2: Create user ID wordlist using helper script (if Python installed)
python3 ~/.claude/skills/ffuf/ffuf_helper.py wordlist \
    -o /tmp/user-ids.txt \
    -t numbers \
    -s 1 \
    -e 10

# OR create manually if Python not installed
echo -e "1\n2\n3\n4\n5\n6\n7\n8\n9\n10" > /tmp/user-ids.txt

# Step 3: Run IDOR test
ffuf --request /tmp/auth-req.txt \
     -w /tmp/user-ids.txt \
     -ac -mc 200 \
     -o /tmp/auth-results.json \
     -v

# Step 4: Review results
cat /tmp/auth-results.json
```

**Expected Outcome**:
- ✅ Request template created correctly
- ✅ Wordlist generated (manual or helper script)
- ✅ ffuf sends authenticated requests
- ✅ Results saved and analyzable

**Status**: ☐ PASS / ☐ FAIL

**Cleanup**:
```bash
rm /tmp/auth-req.txt /tmp/user-ids.txt /tmp/auth-results.json
```

---

## Section 15: Skill Activation Triggers (REQUIRED ✅)

### 15.1 Auto-Detection Works

**Test** (in Claude Code session):
```
Fuzz the /api/users endpoint for hidden resources
```

**Expected Behavior**:
- ✅ Kai automatically activates ffuf skill
- ✅ Asks for target URL
- ✅ Recommends wordlist
- ✅ Suggests using `-ac` flag
- ✅ Provides ffuf command

**Status**: ☐ PASS / ☐ FAIL

---

### 15.2 Explicit Activation Works

**Test** (in Claude Code session):
```
Use ffuf skill to scan for directories on example.com
```

**Expected Behavior**:
- ✅ Skill activates immediately
- ✅ Loads ffuf context
- ✅ Provides directory scanning workflow

**Status**: ☐ PASS / ☐ FAIL

---

### 15.3 Template Request

**Test** (in Claude Code session):
```
Show me the JWT Bearer Token request template from ffuf skill
```

**Expected Behavior**:
- ✅ Kai reads resources/REQUEST_TEMPLATES.md
- ✅ Displays Template 1: JWT Bearer Token
- ✅ Shows example usage command

**Status**: ☐ PASS / ☐ FAIL

---

## Verification Summary

### Required Sections (Must Pass ✅)

| Section | Description | Status |
|---------|-------------|--------|
| 1.1 | Skill files present | ☐ |
| 1.2 | Skill loading in Claude Code | ☐ |
| 1.3 | ffuf binary installed | ☐ |
| 1.4 | ffuf basic functionality | ☐ |
| 2.1-2.3 | Pack documentation accessible | ☐ |
| 3.1-3.2 | Workflow documentation | ☐ |
| 4.1-4.2 | Auto-calibration | ☐ |
| 5.1-5.3 | Raw request fuzzing | ☐ |
| 9.1-9.3 | Filtering and matching | ☐ |
| 11.1 | JSON output | ☐ |
| 14.1-14.2 | Complete workflow tests | ☐ |
| 15.1-15.3 | Skill activation triggers | ☐ |

**Required Tests**: 18
**Passed**: _____ / 18
**Overall Status**: ☐ READY FOR USE / ☐ ISSUES FOUND

---

### Recommended Sections (Should Pass 🔶)

| Section | Description | Status |
|---------|-------------|--------|
| 6.1 | Python installed | ☐ |
| 6.2 | Helper script executable | ☐ |
| 6.3-6.5 | Helper script functions | ☐ |
| 7.1-7.2 | Resource files accessible | ☐ |
| 10.1-10.2 | Multi-wordlist modes | ☐ |

**Recommended Tests**: 8
**Passed**: _____ / 8

---

### Optional Sections (Nice to Have 🔷)

| Section | Description | Status |
|---------|-------------|--------|
| 8.1-8.2 | SecLists wordlists | ☐ |
| 12.1-12.2 | Configuration file | ☐ |
| 13.1-13.2 | Burp Suite integration | ☐ |

**Optional Tests**: 5
**Passed**: _____ / 5

---

## Issues Found

**If any tests failed**, document issues here:

**Issue 1**:
- **Section**: _____
- **Test**: _____
- **Error**: _____
- **Resolution**: See PACK_INSTALL.md Troubleshooting Issue #_____

**Issue 2**:
- **Section**: _____
- **Test**: _____
- **Error**: _____
- **Resolution**: _____

---

## Sign-Off

**Verified By**: _____________________
**Date**: _____________________
**ffuf Version**: _____________________
**Python Version** (if using helper script): _____________________
**SecLists Installed**: ☐ Yes / ☐ No

**Ready for Production Use**: ☐ Yes / ☐ No (if all Required tests pass)

---

## Next Steps After Verification

1. **Review PACK_README.md**
   - Study 6 key features in detail
   - Read through 5 complete use cases
   - Understand auto-calibration importance

2. **Practice Safe Fuzzing**
   - Always use `-ac` (auto-calibration)
   - Respect rate limits (`-t` flag)
   - Only fuzz authorized targets
   - Save results for analysis

3. **Build Template Library**
   - Customize REQUEST_TEMPLATES.md examples
   - Create req.txt files for your common scenarios
   - Document custom wordlists

4. **Integrate into Pentesting Workflow**
   - Add ffuf to reconnaissance phase
   - Combine with Burp Suite for authenticated testing
   - Use helper script for result analysis
   - Create automation scripts

5. **Join Community**
   - ffuf GitHub: https://github.com/ffuf/ffuf
   - Share templates and techniques
   - Report bugs and feature requests

---

**Verification Checklist Version**: 2.0
**Last Updated**: 2026-01-03
**Estimated Completion Time**: 30-45 minutes
