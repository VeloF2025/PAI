# Input Leap Manager - KVM Auto-Fix Skill

**Triggers**: "input leap", "ileap", "kvm not working", "mouse not crossing", "input leap fix"
**Purpose**: Automatically diagnose and fix Input Leap KVM connectivity issues

---

## Configuration

**Windows Server**: Hein-Dell (192.168.1.47)
**Linux Client**: velo-server (192.168.1.150) - user: hein
**Physical Layout**: Velo server on LEFT ← Windows PC on RIGHT
**Config File**: C:\Users\HeinvanVuuren\input-leap.conf
**Startup Script**: C:\Users\HeinvanVuuren\start-input-leap-reliable.vbs
**Startup Location**: %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\start-input-leap-hidden.vbs

---

## Common Issues & Fixes

### 1. **Scroll Lock is ON** (Most Common - 80% of issues)
**Symptoms**: Connection established but mouse won't cross screens
**Fix**:
```bash
# Check Scroll Lock status
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Control]::IsKeyLocked([System.Windows.Forms.Keys]::Scroll)"

# If True, toggle it off
powershell -ExecutionPolicy Bypass -File "C:\Users\HeinvanVuuren\toggle-scrolllock.ps1"
```

### 2. **Windows Server Not Running** (15% of issues)
**Symptoms**: Linux client shows "Timed out" trying to connect
**Fix**:
```bash
# Start server with Scroll Lock fix
cscript.exe //NoLogo "C:\Users\HeinvanVuuren\start-input-leap-reliable.vbs"

# Verify it started
netstat -ano | findstr :24800
```

### 3. **Linux Client Not Running** (3% of issues)
**Symptoms**: Windows server has no ESTABLISHED connection
**Fix**:
```bash
# Restart client
ssh velocity-server 'systemctl --user restart input-leap.service'

# Verify connection
ssh velocity-server 'systemctl --user status input-leap.service --no-pager'
```

### 4. **Both Systems Restarted** (2% of issues)
**Symptoms**: Nothing works after reboot
**Fix**: Run diagnostic workflow (see below)

---

## Diagnostic Workflow

When user reports "Input Leap not working":

### Step 1: Quick Status Check
```bash
# Windows server status
netstat -ano | findstr :24800

# Linux client status
ssh velocity-server 'systemctl --user status input-leap.service --no-pager | tail -20'

# Scroll Lock check
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Control]::IsKeyLocked([System.Windows.Forms.Keys]::Scroll)"
```

### Step 2: Automated Fix
Based on Step 1 results:
- **If Scroll Lock = True**: Toggle it off → Problem solved 80% of time
- **If Windows server not running**: Start it with startup script
- **If Linux client not connected**: Restart systemd service
- **If both running but not connected**: Check network/firewall

### Step 3: Verify Fix
```bash
# Connection should show ESTABLISHED
netstat -ano | findstr :24800
# Expected: TCP 192.168.1.47:24800 192.168.1.150:XXXXX ESTABLISHED

# Scroll Lock should be False
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Control]::IsKeyLocked([System.Windows.Forms.Keys]::Scroll)"
# Expected: False
```

---

## Auto-Start Configuration

### Windows Startup Script
File: `C:\Users\HeinvanVuuren\start-input-leap-reliable.vbs`
```vbscript
Set WshShell = CreateObject("WScript.Shell")

' Wait 5 seconds for Windows to fully load
WScript.Sleep 5000

' Ensure Scroll Lock is OFF
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -Command ""$wsh = New-Object -ComObject WScript.Shell; Add-Type -AssemblyName System.Windows.Forms; if ([System.Windows.Forms.Control]::IsKeyLocked([System.Windows.Forms.Keys]::Scroll)) { $wsh.SendKeys('{SCROLLLOCK}') }""", 0, True

' Wait for Scroll Lock toggle
WScript.Sleep 1000

' Start Input Leap server
WshShell.Run """C:\Program Files\InputLeap\input-leaps.exe"" -f --disable-crypto --name Hein-Dell -c ""C:\Users\HeinvanVuuren\input-leap.conf"" --address 192.168.1.47", 0, False

Set WshShell = Nothing
```

### Linux systemd Service
File: `~/.config/systemd/user/input-leap.service` on velo-server
```ini
[Unit]
Description=Input Leap Client
After=graphical-session.target

[Service]
Type=simple
Environment="DISPLAY=:1"
ExecStart=/usr/local/bin/input-leapc -f --disable-crypto --name velo-server 192.168.1.47
Restart=always
RestartSec=5

[Install]
WantedBy=graphical-session.target
```

---

## Troubleshooting Commands

### Check if processes are running
```bash
# Windows
tasklist | findstr /i "input-leap"

# Linux
ssh velocity-server 'pgrep -a input-leapc'
```

### View recent logs
```bash
# Linux client logs
ssh velocity-server 'journalctl --user -u input-leap.service --since "5 minutes ago" --no-pager'
```

### Kill and restart everything
```bash
# Windows
taskkill //F //IM input-leaps.exe
cscript.exe //NoLogo "C:\Users\HeinvanVuuren\start-input-leap-reliable.vbs"

# Linux
ssh velocity-server 'systemctl --user restart input-leap.service'
```

---

## Skill Behavior

When triggered:
1. **Immediately run diagnostic workflow** without asking questions
2. **Auto-fix the most likely issue** (Scroll Lock)
3. **Verify the fix worked** (connection established, Scroll Lock off)
4. **Report status** to user in simple terms
5. **If still broken**: Escalate to manual troubleshooting

**Response Format**:
```
🔍 Input Leap Diagnostic Running...

✅ Windows Server: Running (PID: XXXXX)
✅ Linux Client: Connected
❌ Scroll Lock: ON (fixing...)

🔧 Toggling Scroll Lock OFF...
✅ Scroll Lock: OFF

✅ Input Leap is now working!
Try moving your mouse to the left edge of your leftmost monitor.
```

---

## Edge Cases

### Multi-Monitor Windows Setup
- Windows has 3 monitors (DISPLAY1, DISPLAY2, DISPLAY3)
- DISPLAY3 is leftmost at X=-1920
- User must move mouse to **left edge of DISPLAY3**, not laptop screen
- Config correctly maps: Hein-Dell (left) = velo-server

### Persistent Scroll Lock
If Scroll Lock keeps getting enabled:
- Check for stuck keyboard state
- Add auto-toggle to startup script (already done)
- Consider disabling Scroll Lock feature in Input Leap (not currently supported)

---

## Quick Reference

**Most Common Fix** (80% of issues):
```bash
powershell -ExecutionPolicy Bypass -File "C:\Users\HeinvanVuuren\toggle-scrolllock.ps1"
```

**Full Restart**:
```bash
# Windows
taskkill //F //IM input-leaps.exe && cscript.exe //NoLogo "C:\Users\HeinvanVuuren\start-input-leap-reliable.vbs"

# Linux
ssh velocity-server 'systemctl --user restart input-leap.service'
```

**Verify Working**:
```bash
netstat -ano | findstr :24800 && powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Control]::IsKeyLocked([System.Windows.Forms.Keys]::Scroll)"
```

---

**Implementation Notes**:
- This skill should auto-trigger when user mentions Input Leap issues
- Diagnostic workflow runs automatically without user interaction
- Most issues (Scroll Lock) are fixed in <5 seconds
- Reduces troubleshooting from 10+ minutes to 5 seconds
