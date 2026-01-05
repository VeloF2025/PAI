# ffuf Web Fuzzing - Installation Guide

**Pack Version**: 2.0
**Installation Time**: 15-30 minutes (depending on optional components)
**Complexity**: Medium (external binary + optional Python components)

---

## Prerequisites

### Required

**1. Claude Code CLI**
- **Minimum Version**: Latest stable release
- **Check**: `claude --version`
- **Install**: See [Claude Code documentation](https://github.com/anthropics/claude-code)

**2. PAI Environment**
- **Required**: PAI_DIR environment variable set
- **Check**: `echo $PAI_DIR` (Unix/Mac) or `echo %PAI_DIR%` (Windows)
- **Typical Location**: `~/.claude/` or `C:\Users\<Username>\.claude\`

**3. ffuf Binary**
- **Minimum Version**: v2.0.0+
- **Purpose**: Fast web fuzzer written in Go
- **Install Methods**:
  - **Go**: `go install github.com/ffuf/ffuf/v2@latest`
  - **Homebrew (Mac)**: `brew install ffuf`
  - **APT (Debian/Ubuntu)**: `sudo apt install ffuf`
  - **Binary Download**: https://github.com/ffuf/ffuf/releases
- **Check**: `ffuf -V`

### Optional (Recommended)

**4. Python 3.8+** (for ffuf_helper.py)
- **Purpose**: Result analysis, req.txt generation, IDOR wordlists
- **Check**: `python3 --version`
- **Install**: https://www.python.org/downloads/

**5. SecLists Wordlists**
- **Purpose**: Comprehensive wordlist collection (~450MB)
- **Install**: `git clone https://github.com/danielmiessler/SecLists.git ~/wordlists/SecLists`
- **Verify**: `ls ~/wordlists/SecLists/Discovery/Web-Content/common.txt`

**6. Burp Suite** (Professional or Community)
- **Purpose**: Capture authenticated HTTP requests for raw request fuzzing
- **Install**: https://portswigger.net/burp/communitydownload
- **Alternative**: Browser DevTools (Network tab → Copy as cURL)

---

## Installation Steps

### Step 1: Verify Skill Files Exist

The ffuf skill should already be installed in your PAI skills directory.

**Unix/Mac:**
```bash
ls -la "$HOME/.claude/skills/ffuf/"
```

**Windows (PowerShell):**
```powershell
Get-ChildItem "$env:USERPROFILE\.claude\skills\ffuf\" -Force
```

**Expected Files:**
```
ffuf/
├── SKILL.md              # Main skill documentation (loaded by Claude Code)
├── PACK_README.md        # This pack overview (on-demand)
├── PACK_INSTALL.md       # This installation guide (on-demand)
├── PACK_VERIFY.md        # Verification checklist (on-demand)
├── ffuf_helper.py        # Python helper script (analyze, create-req, wordlist)
├── resources/
│   ├── REQUEST_TEMPLATES.md  # 12+ pre-built authenticated request templates
│   └── WORDLISTS.md          # SecLists wordlist guide
└── workflows/
    ├── directory-scan.md     # Directory/file discovery workflow
    └── parameter-fuzz.md     # GET/POST parameter fuzzing workflow
```

**If files are missing**: The skill may not be installed. Check your PAI installation or contact your PAI administrator.

---

### Step 2: Verify Skill Loading

Start a Claude Code session in any project:

```bash
claude
```

In the session, type:
```
@ffuf
```

**Expected Behavior**:
- Skill activates
- Kai loads ffuf context
- Ready to guide web fuzzing operations

**If skill doesn't load**:
- Check that SKILL.md exists in the skill directory
- Verify Claude Code is recognizing the ~/.claude/skills/ directory
- Try restarting Claude Code session

---

### Step 3: Install ffuf Binary

Choose your installation method based on platform:

#### Option A: Go Install (All Platforms)

**Prerequisites**: Go 1.21+ installed

```bash
go install github.com/ffuf/ffuf/v2@latest
```

**Verify**:
```bash
ffuf -V
# Expected output: ffuf version 2.x.x
```

**Add to PATH** (if needed):
```bash
# Unix/Mac - Add to ~/.bashrc or ~/.zshrc
export PATH=$PATH:$HOME/go/bin

# Windows - Add to PATH environment variable
setx PATH "%PATH%;%USERPROFILE%\go\bin"
```

---

#### Option B: Homebrew (macOS)

```bash
brew install ffuf
```

**Verify**:
```bash
ffuf -V
# Expected output: ffuf version 2.x.x
```

---

#### Option C: APT (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install ffuf
```

**Verify**:
```bash
ffuf -V
# Expected output: ffuf version 2.x.x
```

**Note**: APT version may be outdated. For latest version, use Go install or binary download.

---

#### Option D: Binary Download (All Platforms)

1. **Download** from https://github.com/ffuf/ffuf/releases
2. **Extract** the binary:
   ```bash
   # Unix/Mac
   tar -xzf ffuf_2.x.x_linux_amd64.tar.gz

   # Windows
   # Extract ffuf_2.x.x_windows_amd64.zip using File Explorer
   ```

3. **Move to PATH**:
   ```bash
   # Unix/Mac
   sudo mv ffuf /usr/local/bin/
   sudo chmod +x /usr/local/bin/ffuf

   # Windows
   # Move ffuf.exe to C:\Windows\System32\
   ```

4. **Verify**:
   ```bash
   ffuf -V
   # Expected output: ffuf version 2.x.x
   ```

---

### Step 4: Test Basic ffuf Functionality

Run a simple test to verify ffuf works:

```bash
# Test against a known working target (OWASP WebGoat or similar)
ffuf -w ~/wordlists/common.txt \
     -u https://example.com/FUZZ \
     -ac -mc 200,301,302,403 \
     -t 10 \
     -v
```

**Expected Output**:
```
        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.x.x
________________________________________________

 :: Method           : GET
 :: URL              : https://example.com/FUZZ
 :: Wordlist         : FUZZ: ~/wordlists/common.txt
 :: Follow redirects : false
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 10
 :: Matcher          : Response status: 200,301,302,403
________________________________________________

[Status: 200, Size: 1234, Words: 567, Lines: 89, Duration: 123ms]
    * FUZZ: admin

[Status: 403, Size: 456, Words: 78, Lines: 12, Duration: 98ms]
    * FUZZ: backup
```

**If ffuf runs successfully**: ✅ Installation complete! Skip to Step 7 (Optional Components)

**If ffuf fails**: See Troubleshooting section below

---

### Step 5: Install Python 3.8+ (Optional - for Helper Script)

**Check if Python is installed**:
```bash
python3 --version
# Expected: Python 3.8.x or higher
```

**If Python is not installed**:

**Unix/Mac (Homebrew)**:
```bash
brew install python@3.11
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install python3 python3-pip
```

**Windows**:
1. Download from https://www.python.org/downloads/
2. Run installer
3. **IMPORTANT**: Check "Add Python to PATH" during installation

**Verify**:
```bash
python3 --version
# Expected: Python 3.8.x or higher
```

---

### Step 6: Test Helper Script (Optional)

If Python is installed, test the ffuf_helper.py script:

**Unix/Mac**:
```bash
python3 "$HOME/.claude/skills/ffuf/ffuf_helper.py" --help
```

**Windows (PowerShell)**:
```powershell
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

optional arguments:
  -h, --help            show this help message and exit
```

**If helper script fails**: See Troubleshooting Issue #4 below

---

### Step 7: Install SecLists Wordlists (Optional - Recommended)

SecLists is a comprehensive collection of wordlists used for security testing (~450MB).

**Clone SecLists Repository**:
```bash
# Clone to ~/wordlists/ directory
mkdir -p ~/wordlists
cd ~/wordlists
git clone https://github.com/danielmiessler/SecLists.git

# This will take 2-5 minutes depending on connection speed
```

**Verify Installation**:
```bash
ls ~/wordlists/SecLists/Discovery/Web-Content/
# Expected: common.txt, raft-large-directories.txt, etc.

ls ~/wordlists/SecLists/Discovery/DNS/
# Expected: subdomains-top1million-5000.txt, etc.
```

**Create Symlinks for Quick Access** (Optional):
```bash
ln -s ~/wordlists/SecLists/Discovery/Web-Content ~/wordlists/web
ln -s ~/wordlists/SecLists/Discovery/DNS ~/wordlists/dns
ln -s ~/wordlists/SecLists/Usernames ~/wordlists/users
ln -s ~/wordlists/SecLists/Passwords ~/wordlists/passwords
```

**Now you can use**:
```bash
ffuf -w ~/wordlists/web/common.txt -u https://target.com/FUZZ -ac
```

---

### Step 8: Create ffuf Config File (Optional)

Create a configuration file to set default options:

**Unix/Mac**:
```bash
mkdir -p ~/.config/ffuf
cat > ~/.config/ffuf/ffufrc << 'EOF'
[general]
# Default colors
colors = true

# Default threads
threads = 40

# Default timeout (seconds)
timeout = 10

# Default matchers
mc = 200,204,301,302,307,401,403,405

# Default auto-calibration
ac = true

# Verbose output
v = true
EOF
```

**Windows (PowerShell)**:
```powershell
New-Item -ItemType Directory -Force -Path "$env:APPDATA\ffuf"
@"
[general]
colors = true
threads = 40
timeout = 10
mc = 200,204,301,302,307,401,403,405
ac = true
v = true
"@ | Out-File -FilePath "$env:APPDATA\ffuf\ffufrc" -Encoding ASCII
```

**Verify Config**:
```bash
ffuf -h | grep -i "config"
# Should show config file location
```

**Note**: Command-line flags override config file settings.

---

### Step 9: Verify Pack Documentation Access

Test on-demand loading of Pack documentation:

```
Load the ffuf Pack README
```

**Expected Behavior**:
- Kai reads PACK_README.md
- Provides overview of ffuf methodology, architecture, 6 key features, 5 use cases

**Alternative Test**:
```
Read the ffuf installation guide
```

**Expected Behavior**:
- Kai reads PACK_INSTALL.md (this file)

---

### Step 10: Test Complete Workflow (Optional but Recommended)

Run through a complete fuzzing workflow to verify everything works:

**Scenario**: Directory discovery on a test target

```bash
# Step 1: Create a test wordlist
cat > /tmp/test-wordlist.txt << EOF
admin
backup
test
config
api
uploads
EOF

# Step 2: Run ffuf (replace with your test target)
ffuf -w /tmp/test-wordlist.txt \
     -u https://example.com/FUZZ \
     -ac -mc 200,301,302,403 \
     -o /tmp/ffuf-test-results.json

# Step 3: Analyze results with helper script (if Python installed)
python3 ~/.claude/skills/ffuf/ffuf_helper.py analyze /tmp/ffuf-test-results.json

# Step 4: Clean up
rm /tmp/test-wordlist.txt /tmp/ffuf-test-results.json
```

**Expected Outcome**:
- ffuf runs without errors
- Results saved to JSON file
- Helper script (if installed) analyzes results successfully

---

## Configuration

### Environment Variables (Optional)

Set environment variables for convenience:

**Unix/Mac - Add to ~/.bashrc or ~/.zshrc**:
```bash
# ffuf wordlist directory
export WORDLIST_DIR=~/wordlists/SecLists

# ffuf default config
export FFUF_CONFIG=~/.config/ffuf/ffufrc
```

**Windows - PowerShell Profile**:
```powershell
# Edit $PROFILE and add:
$env:WORDLIST_DIR = "$env:USERPROFILE\wordlists\SecLists"
$env:FFUF_CONFIG = "$env:APPDATA\ffuf\ffufrc"
```

**Reload Shell**:
```bash
# Unix/Mac
source ~/.bashrc  # or source ~/.zshrc

# Windows
. $PROFILE
```

**Now you can use**:
```bash
ffuf -w $WORDLIST_DIR/Discovery/Web-Content/common.txt -u https://target.com/FUZZ -ac
```

---

### Burp Suite Integration (Optional)

**Setup for Raw Request Capture**:

1. **Configure Burp Proxy**:
   - Proxy → Options → Proxy Listeners → Add → Port 8080
   - Intercept → Intercept is off (let requests flow through)

2. **Configure Browser to Use Burp Proxy**:
   - Browser Settings → Network → Manual Proxy → localhost:8080
   - Install Burp CA Certificate for HTTPS

3. **Capture Authenticated Request**:
   - Perform authenticated action in browser
   - HTTP History → Find request → Right-click → Copy to file → Save as req.txt
   - Replace value to fuzz with `FUZZ` keyword

4. **Run ffuf with Captured Request**:
   ```bash
   ffuf --request req.txt -w wordlist.txt -ac -mc 200,201 -o results.json
   ```

**Alternative (Browser DevTools)**:
1. Open DevTools → Network tab
2. Perform authenticated action
3. Right-click request → Copy → Copy as cURL
4. Use helper script to convert cURL to req.txt:
   ```bash
   python3 ~/.claude/skills/ffuf/ffuf_helper.py create-req \
       --from-curl "curl 'https://...' -H 'Authorization: Bearer ...'" \
       -o req.txt
   ```

---

## Troubleshooting

### Issue 1: ffuf Binary Not Found

**Symptoms**:
- `ffuf: command not found`
- `'ffuf' is not recognized as an internal or external command`

**Possible Causes**:
1. ffuf not installed
2. ffuf not in PATH
3. Incorrect installation

**Solutions**:

**A. Verify ffuf is installed**:
```bash
# Unix/Mac - Check common locations
which ffuf
ls /usr/local/bin/ffuf
ls ~/go/bin/ffuf

# Windows - Check common locations
where ffuf
dir C:\Windows\System32\ffuf.exe
dir %USERPROFILE%\go\bin\ffuf.exe
```

**B. Add to PATH**:
```bash
# Unix/Mac - Add to ~/.bashrc or ~/.zshrc
export PATH=$PATH:/usr/local/bin
export PATH=$PATH:$HOME/go/bin

# Reload shell
source ~/.bashrc

# Windows - System Properties → Environment Variables → PATH → Add
# Add: C:\Windows\System32 or %USERPROFILE%\go\bin
```

**C. Reinstall ffuf**:
```bash
# Go install
go install github.com/ffuf/ffuf/v2@latest

# Or Homebrew (Mac)
brew reinstall ffuf

# Or APT (Ubuntu)
sudo apt install --reinstall ffuf
```

---

### Issue 2: Skill Not Activating

**Symptoms**:
- User says "fuzz this endpoint" but ffuf skill doesn't activate
- Kai doesn't enter ffuf workflow

**Possible Causes**:
1. Skill files missing or incorrectly placed
2. SKILL.md not readable by Claude Code
3. Skill name mismatch

**Solutions**:

**A. Verify file structure**:
```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/ffuf/SKILL.md"

# Windows PowerShell
Test-Path "$env:USERPROFILE\.claude\skills\ffuf\SKILL.md"
```

Expected: File exists and is readable

**B. Check SKILL.md frontmatter**:
```bash
# Unix/Mac
head -10 "$HOME/.claude/skills/ffuf/SKILL.md"

# Windows PowerShell
Get-Content "$env:USERPROFILE\.claude\skills\ffuf\SKILL.md" | Select-Object -First 10
```

Expected frontmatter:
```yaml
---
name: ffuf-web-fuzzing
description: Expert guidance for ffuf web fuzzing during penetration testing...
contributor: Joseph Thacker (@rez0)
---
```

**C. Explicit activation**:
Instead of relying on auto-detection, explicitly request:
```
Use ffuf skill to fuzz the /api/users endpoint
```

---

### Issue 3: Python Not Installed

**Symptoms**:
- `python3: command not found`
- Helper script doesn't work

**Possible Causes**:
1. Python not installed
2. Python not in PATH
3. Wrong Python version (< 3.8)

**Solutions**:

**A. Install Python**:
```bash
# Homebrew (Mac)
brew install python@3.11

# APT (Ubuntu)
sudo apt install python3 python3-pip

# Windows
# Download from https://www.python.org/downloads/
# Run installer with "Add Python to PATH" checked
```

**B. Verify Python version**:
```bash
python3 --version
# Expected: Python 3.8.x or higher
```

**C. Add to PATH** (if installed but not found):
```bash
# Unix/Mac - Add to ~/.bashrc
export PATH=$PATH:/usr/local/bin/python3

# Windows - System Properties → Environment Variables → PATH
# Add: C:\Python311 or wherever Python is installed
```

---

### Issue 4: Helper Script Fails

**Symptoms**:
- `python3 ffuf_helper.py` produces errors
- `ModuleNotFoundError` or `ImportError`

**Possible Causes**:
1. Python not installed
2. Missing dependencies
3. Script file corrupted

**Solutions**:

**A. Check Python installation**:
```bash
python3 --version
# Expected: Python 3.8+
```

**B. Check if script is executable**:
```bash
# Unix/Mac
chmod +x ~/.claude/skills/ffuf/ffuf_helper.py
```

**C. Run with explicit Python path**:
```bash
# Unix/Mac
/usr/bin/python3 ~/.claude/skills/ffuf/ffuf_helper.py --help

# Windows
C:\Python311\python.exe %USERPROFILE%\.claude\skills\ffuf\ffuf_helper.py --help
```

**D. Verify script integrity**:
```bash
# Check file size (should be ~5-10 KB)
ls -lh ~/.claude/skills/ffuf/ffuf_helper.py

# Check first few lines (should start with #!/usr/bin/env python3)
head -5 ~/.claude/skills/ffuf/ffuf_helper.py
```

---

### Issue 5: SecLists Wordlists Missing

**Symptoms**:
- `No such file or directory: ~/wordlists/SecLists/...`
- Wordlist not found errors

**Possible Causes**:
1. SecLists not installed
2. Incorrect path
3. Incomplete git clone

**Solutions**:

**A. Verify SecLists installation**:
```bash
ls ~/wordlists/SecLists/Discovery/Web-Content/common.txt
# Expected: File exists
```

**B. Reinstall SecLists**:
```bash
# Remove old installation
rm -rf ~/wordlists/SecLists

# Clone fresh copy
mkdir -p ~/wordlists
cd ~/wordlists
git clone --depth 1 https://github.com/danielmiessler/SecLists.git
```

**C. Use absolute paths**:
Instead of:
```bash
ffuf -w ~/wordlists/SecLists/Discovery/Web-Content/common.txt ...
```

Use:
```bash
# Unix/Mac
ffuf -w /Users/username/wordlists/SecLists/Discovery/Web-Content/common.txt ...

# Windows
ffuf -w C:\Users\username\wordlists\SecLists\Discovery\Web-Content\common.txt ...
```

---

### Issue 6: Auto-Calibration Not Working

**Symptoms**:
- ffuf returns thousands of false positives even with `-ac`
- Auto-calibration seems to have no effect

**Possible Causes**:
1. Target responds with identical content for all requests
2. Target uses dynamic content that defeats auto-calibration
3. Incorrect usage of filters/matchers

**Solutions**:

**A. Verify auto-calibration is enabled**:
```bash
# Check command includes -ac flag
ffuf -w wordlist.txt -u https://target.com/FUZZ -ac -v
```

**B. Add manual filters**:
If auto-calibration doesn't work, manually filter common false positives:
```bash
# Filter by response size
ffuf -w wordlist.txt -u https://target.com/FUZZ -ac -fs 1234

# Filter by word count
ffuf -w wordlist.txt -u https://target.com/FUZZ -ac -fw 567

# Filter by line count
ffuf -w wordlist.txt -u https://target.com/FUZZ -ac -fl 89
```

**C. Use different matchers**:
```bash
# Match only specific status codes
ffuf -w wordlist.txt -u https://target.com/FUZZ -ac -mc 200,301,302

# Match only responses with specific size range
ffuf -w wordlist.txt -u https://target.com/FUZZ -ac -ms 1000-5000
```

**D. Run test without auto-calibration to see baseline**:
```bash
# Run without -ac
ffuf -w wordlist.txt -u https://target.com/FUZZ -mc 200,301,302 -v

# Identify common false positive pattern
# Then add manual filter based on size/words/lines
```

---

### Issue 7: Raw Request Fuzzing Errors

**Symptoms**:
- `Error parsing request file`
- `Invalid HTTP request format`
- ffuf doesn't send authenticated requests correctly

**Possible Causes**:
1. Malformed req.txt file
2. Missing headers or HTTP version
3. Incorrect FUZZ placement

**Solutions**:

**A. Verify req.txt format**:
```http
# Correct format (note HTTP/1.1 and proper headers)
POST /api/endpoint HTTP/1.1
Host: target.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Length: 27

{"action":"FUZZ","id":"1"}
```

**B. Common mistakes**:
```http
# ❌ Missing HTTP version
POST /api/endpoint
Host: target.com

# ❌ Missing Host header
POST /api/endpoint HTTP/1.1
Authorization: Bearer ...

# ❌ Missing blank line before body
POST /api/endpoint HTTP/1.1
Host: target.com
{"action":"FUZZ"}  # Should have blank line above

# ✅ Correct format
POST /api/endpoint HTTP/1.1
Host: target.com
Authorization: Bearer ...

{"action":"FUZZ"}
```

**C. Use helper script to generate req.txt**:
```bash
python3 ~/.claude/skills/ffuf/ffuf_helper.py create-req \
    -o req.txt \
    -m POST \
    -u "https://target.com/api/endpoint" \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"action":"FUZZ","id":"1"}'
```

**D. Test req.txt manually**:
```bash
# Send request with curl to verify it works
curl --request "$(cat req.txt | sed 's/FUZZ/test/g')"
```

---

### Issue 8: Burp Suite Integration Problems

**Symptoms**:
- Can't capture requests in Burp
- HTTPS requests fail with certificate errors
- Burp proxy not intercepting traffic

**Possible Causes**:
1. Burp proxy not configured correctly
2. Browser not using proxy
3. Burp CA certificate not installed
4. Intercept mode enabled (blocking requests)

**Solutions**:

**A. Verify Burp proxy is running**:
- Burp Suite → Proxy → Options → Proxy Listeners
- Should show: 127.0.0.1:8080 Running

**B. Configure browser proxy**:
```
Browser Settings → Network → Manual Proxy Configuration
HTTP Proxy: 127.0.0.1
Port: 8080
Use for HTTPS: ✓
```

**C. Install Burp CA certificate** (for HTTPS):
1. Navigate to http://burp in browser (with proxy enabled)
2. Click "CA Certificate" → Download
3. Install certificate:
   - **Chrome/Edge**: Settings → Privacy → Manage Certificates → Import
   - **Firefox**: Settings → Privacy → Certificates → Import
   - **macOS**: Open certificate → Install in Keychain → Always Trust

**D. Disable Intercept**:
- Burp Suite → Proxy → Intercept
- Click "Intercept is on" to toggle to "Intercept is off"
- Requests should now flow through to HTTP History

**E. Alternative - Use Browser DevTools**:
If Burp is too complex:
1. Open Browser DevTools (F12)
2. Network tab
3. Perform authenticated action
4. Right-click request → Copy → Copy as cURL
5. Use helper script to convert to req.txt

---

## Production Optimizations

### For Penetration Testers

**1. Wordlist Curation**
Instead of using massive wordlists, curate targeted lists:

```bash
# Create custom directory for curated lists
mkdir -p ~/wordlists/custom

# Combine and deduplicate common wordlists
cat ~/wordlists/SecLists/Discovery/Web-Content/common.txt \
    ~/wordlists/SecLists/Discovery/Web-Content/raft-medium-directories.txt \
    | sort -u > ~/wordlists/custom/web-combined.txt

# Create technology-specific wordlists
# Example: WordPress-specific endpoints
cat > ~/wordlists/custom/wordpress.txt << EOF
wp-admin
wp-content
wp-includes
wp-json
xmlrpc.php
wp-login.php
EOF
```

**2. Request Template Library**
Maintain a library of pre-built req.txt templates:

```bash
# Create template directory
mkdir -p ~/.claude/skills/ffuf/my-templates

# Copy from resources
cp ~/.claude/skills/ffuf/resources/REQUEST_TEMPLATES.md ~/.claude/skills/ffuf/my-templates/

# Add custom templates
cat > ~/.claude/skills/ffuf/my-templates/oauth-api.txt << 'EOF'
GET /api/v1/FUZZ HTTP/1.1
Host: api.client.com
Authorization: Bearer YOUR_TOKEN_HERE
Accept: application/json
EOF
```

**Reference during engagement**:
```
Load my custom OAuth API request template
```

**3. ffuf Aliases**
Create bash aliases for common operations:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias ffuf-dir='ffuf -w ~/wordlists/custom/web-combined.txt -ac -mc 200,301,302,403 -o ffuf-dir-results.json'
alias ffuf-subdomain='ffuf -w ~/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -ac -mc 200 -o ffuf-subdomain-results.json'
alias ffuf-params='ffuf -w ~/wordlists/SecLists/Discovery/Web-Content/burp-parameter-names.txt -ac -mc 200 -o ffuf-params-results.json'
```

**Usage**:
```bash
ffuf-dir -u https://target.com/FUZZ
ffuf-subdomain -u https://FUZZ.target.com
ffuf-params -u https://target.com/api?FUZZ=test
```

---

### For Organizations (Centralized Wordlists)

**1. Shared Wordlist Repository**
Set up centralized wordlist storage:

```bash
# Create shared directory (adjust path for your org)
sudo mkdir -p /opt/wordlists
sudo chown -R pentesting-team:pentesting-team /opt/wordlists

# Clone SecLists to shared location
cd /opt/wordlists
git clone https://github.com/danielmiessler/SecLists.git

# Create org-specific wordlists
mkdir -p /opt/wordlists/custom

# All team members use same path
export WORDLIST_DIR=/opt/wordlists
```

**2. Template Sharing**
Share req.txt templates across team:

```bash
# Create shared template repository
mkdir -p /opt/ffuf-templates

# Team members contribute templates
cp my-oauth-template.txt /opt/ffuf-templates/oauth-api.txt

# Everyone references shared templates
ffuf --request /opt/ffuf-templates/oauth-api.txt -w wordlist.txt -ac
```

**3. Standardized Configuration**
Deploy standard ffufrc to all team members:

```bash
# Create org-standard config
cat > /opt/ffuf-templates/ffufrc-standard << 'EOF'
[general]
colors = true
threads = 40
timeout = 10
mc = 200,204,301,302,307,401,403,405
ac = true
v = true
EOF

# Team members copy to their config location
cp /opt/ffuf-templates/ffufrc-standard ~/.config/ffuf/ffufrc
```

---

## Next Steps

After successful installation and verification:

1. **Run Your First Fuzzing Operation**
   - Choose a test target (your own application or authorized target)
   - Start with directory discovery workflow
   - Generate results and analyze with helper script

2. **Review Pack Documentation**
   - Read PACK_README.md for comprehensive methodology
   - Study 5 detailed use cases
   - Understand 6 key features (especially auto-calibration and raw requests)

3. **Complete Verification**
   - Follow PACK_VERIFY.md checklist
   - Test all workflow scenarios
   - Validate helper script functions

4. **Build Your Template Library**
   - Capture authenticated requests from real engagements
   - Create req.txt files for reuse
   - Document custom wordlists

5. **Integrate with Workflow**
   - Add ffuf to your reconnaissance phase
   - Combine with other tools (nmap, Burp, etc.)
   - Automate common fuzzing operations

---

## Support

### Documentation
- **PACK_README.md**: Comprehensive methodology, architecture, 6 key features, 5 use cases
- **PACK_VERIFY.md**: Verification checklist with 10+ test scenarios
- **workflows/directory-scan.md**: Directory/file discovery workflow
- **workflows/parameter-fuzz.md**: GET/POST parameter fuzzing workflow
- **resources/REQUEST_TEMPLATES.md**: 12+ pre-built authenticated request templates
- **resources/WORDLISTS.md**: SecLists wordlist guide

### Learning Resources
- **ffuf GitHub**: https://github.com/ffuf/ffuf
- **SecLists**: https://github.com/danielmiessler/SecLists
- **Skill Contributor**: Joseph Thacker (@rez0) - Professional penetration tester
- **Auto-Calibration Guide**: See SKILL.md for detailed `-ac` explanation

### Getting Help

**Within Claude Code Session**:
```
Help me troubleshoot ffuf skill - [describe issue]
```

**PAI Community**:
- Share fuzzing workflows and techniques
- Exchange req.txt templates for different auth scenarios
- Discuss wordlist curation strategies

**ffuf Community**:
- GitHub Issues: https://github.com/ffuf/ffuf/issues
- Twitter: Follow @joohoi (ffuf author)

---

**Installation Guide Version**: 2.0
**Last Updated**: 2026-01-03
**Estimated Installation Time**: 15-30 minutes (depending on optional components)
