# MT5 Trading Skill

Automate MT5 EA compilation and backtest execution for trading strategy development and optimization.

## Description

This skill enables programmatic interaction with MetaTrader 5 (MT5) for:
- Compiling Expert Advisors (EAs) via MetaEditor
- Running automated backtests via Strategy Tester
- Analyzing backtest results and logs
- Managing MT5 configurations for different accounts

Use this skill when the user asks to:
- "compile the EA"
- "run a backtest"
- "test this trading strategy"
- "backtest programmatically"
- "analyze MT5 results"

## When to Use

- User wants to test a trading strategy without manual MT5 interaction
- User needs to compile MQL5 code and run backtests
- User wants to automate trading strategy development workflow
- User needs to analyze MT5 backtest results

## Tools Available

All Claude Code tools are available, with focus on:
- `Bash` - Running mt5_backtest.py scripts, MetaEditor compilation
- `Read` - Reading EA source code (.mq5), backtest logs, configuration files
- `Write/Edit` - Modifying EA code, updating backtest configurations
- `Grep` - Searching log files for trade entries, errors, performance metrics

## Skill Procedure

### 1. Locate MT5 Installation

First, identify the MT5 installation paths:

```python
# Common MT5 paths
MT5_TERMINAL = r"C:\Program Files\MetaTrader 5 EXNESS\terminal64.exe"
MT5_METAEDITOR = r"C:\Program Files\MetaTrader 5 EXNESS\MetaEditor64.exe"
MT5_DATA_PATH = r"C:\Users\{username}\AppData\Roaming\MetaQuotes\Terminal\{GUID}"
```

**Key directories:**
- `MQL5\Experts\Advisors\` - EA source files (.mq5)
- `MQL5\Experts\Advisors\` - Compiled EAs (.ex5)
- `Tester\logs\` - Backtest execution logs
- `config\` - Backtest configuration files (.ini)

### 2. Compile Expert Advisor

Use MetaEditor to compile the EA:

```bash
cd "{project_directory}"
python mt5_backtest.py  # Includes compilation step
```

Or compile directly:

```bash
"{MT5_METAEDITOR}" /compile:"{EA_SOURCE_PATH}" /log
```

**Check compilation:**
1. Read compile log: `{MT5_DATA_PATH}\MQL5\Experts\Advisors\{EA_NAME}.log`
2. Look for: `Result: 0 errors, 0 warnings`
3. Verify .ex5 file created

### 3. Configure Backtest

Create or update `backtest.ini` configuration:

```ini
[Common]
Login=297737635  # Demo account number (CRITICAL - required for backtest)
ProxyEnable=0

[Tester]
Expert=Advisors\{EA_NAME}
Symbol=EURUSD
Period=M15
Login=297737635  # Must match [Common] login
Deposit=10000
Leverage=1:100
Model=1  # 0=Every tick, 1=1min OHLC, 2=Open prices
FromDate=2025.06.01
ToDate=2026.01.02
Report=backtest_report_{timestamp}
```

**CRITICAL:** `Login` field must be set to a valid demo account number. If `Login=0`, backtest will fail with "account is not specified".

### 4. Run Backtest

Execute the automated backtest:

```bash
cd "{project_directory}"
python mt5_backtest.py
```

The script will:
1. Compile the EA (if needed)
2. Create backtest configuration
3. Launch MT5 Strategy Tester
4. Wait for completion (up to 10 minutes timeout)

**Return codes:**
- `0` = Success
- Non-zero = Failure (check logs)

### 5. Analyze Results

Read the backtest log:

```bash
# Find latest log
{MT5_DATA_PATH}\Tester\logs\{YYYYMMDD}.log
```

**Key metrics to extract:**
- Final balance: `final balance {amount} USD`
- Total trades: Count of `order` entries
- Win rate: Analyze profit/loss per trade
- Drawdown: Maximum equity drop
- Liquidity sweeps detected: Search for `LIQUIDITY SWEEP`
- Entry reasons: Search for `ENTRY` or `confluence`

**Log search patterns:**

```bash
# Find final results
grep "final balance" {log_file}

# Find all trades
grep -i "order" {log_file}

# Find entry attempts
grep -i "ENTRY\|confluence\|insufficient" {log_file}

# Find detected patterns
grep -i "LIQUIDITY SWEEP\|ORDER BLOCK\|FVG" {log_file}
```

### 6. Optimization Workflow

For strategy optimization:

1. **Baseline Test** - Run current EA configuration
2. **Read Results** - Extract performance metrics from logs
3. **Identify Issues** - Search logs for why trades weren't taken
4. **Adjust Parameters** - Modify EA input parameters
5. **Re-compile & Test** - Run backtest with new settings
6. **Compare Results** - Track improvements vs baseline

**Common adjustments:**
- Reduce `MinConfluenceScore` if no trades
- Disable strict filters (`RequireBOS`, `RequireRejection`)
- Adjust `MinRiskReward` ratio
- Modify killzone times for timezone
- Change `UseDisplacement` if too strict

## Example Workflows

### Workflow 1: Quick Backtest

```bash
# User: "Run a backtest on the ICT EA"

# 1. Navigate to project
cd "C:\Jarvis\AI Workspace\Trading\ICT_LiquidityGrab_Strategy"

# 2. Run automated backtest
python mt5_backtest.py

# 3. Read results
grep "final balance" {log_path}
```

### Workflow 2: Compilation Only

```bash
# User: "Compile the EA to check for errors"

# 1. Compile
python mt5_backtest.py  # Compiles first step

# 2. Check compile log
cat "{MT5_DATA_PATH}\MQL5\Experts\Advisors\Strategy1_LiquidityGrab_ICT_v3.log"
```

### Workflow 3: Analyze Failed Backtest

```bash
# User: "Why didn't my EA take any trades?"

# 1. Read tester log
cd "{MT5_DATA_PATH}\Tester\logs"
cat {latest_log}

# 2. Search for entry attempts
grep -i "confluence\|ENTRY\|insufficient" {latest_log}

# 3. Check detected patterns
grep -i "LIQUIDITY SWEEP" {latest_log} | head -20

# 4. Report findings to user
```

### Workflow 4: Parameter Optimization

```python
# User: "Test different confluence scores from 3 to 7"

# 1. Create parameter test list
confluence_scores = [3, 4, 5, 6, 7]

# 2. For each score:
#    - Edit EA source: MinConfluenceScore = score
#    - Compile EA
#    - Run backtest
#    - Extract final balance
#    - Store result

# 3. Compare results and recommend optimal value
```

## Common Issues & Solutions

### Issue 1: "account is not specified"

**Symptom:** Backtest fails immediately, log shows "tester not started because the account is not specified"

**Solution:**
1. Read demo account from `{MT5_DATA_PATH}\config\common.ini`
2. Extract `Login=XXXXXXXXX` value
3. Update `mt5_backtest.py` to use this login number
4. Ensure both `[Common]` and `[Tester]` sections have matching `Login=` values

### Issue 2: Compilation fails silently

**Symptom:** `mt5_backtest.py` says compilation failed with empty output

**Solution:**
1. Read compile log: `{MT5_DATA_PATH}\MQL5\Experts\Advisors\{EA_NAME}.log`
2. Look for actual errors/warnings in log
3. If log shows "0 errors", compilation succeeded (script detection issue)
4. Verify .ex5 file exists

### Issue 3: No trades taken

**Symptom:** Backtest completes successfully, but 0 trades executed

**Solution:**
1. Read backtest log
2. Search for pattern detection: `grep -i "LIQUIDITY SWEEP" {log}`
3. Check why entries weren't taken: `grep -i "displacement\|rejection" {log}`
4. Identify missing confluence factors
5. Recommend parameter adjustments (reduce `MinConfluenceScore`, disable strict filters)

### Issue 4: Backtest timeout

**Symptom:** Script times out after 10 minutes

**Solution:**
1. Increase timeout in `run_backtest(timeout=600)` → `timeout=1200`
2. Reduce backtest period (shorter date range)
3. Use faster model: `Model=2` (open prices only)
4. Check if MT5 terminal is already running (close it first)

## MT5 File Locations Reference

```
MT5 Terminal:     C:\Program Files\MetaTrader 5 EXNESS\terminal64.exe
MT5 MetaEditor:   C:\Program Files\MetaTrader 5 EXNESS\MetaEditor64.exe

Data Directory:   C:\Users\{user}\AppData\Roaming\MetaQuotes\Terminal\{GUID}\
├── MQL5\
│   ├── Experts\Advisors\        # EA source (.mq5) and compiled (.ex5)
│   └── Logs\                    # Compilation logs
├── Tester\
│   ├── logs\                    # Backtest execution logs
│   └── Agent-*\logs\            # Agent-specific logs
├── config\
│   ├── common.ini               # Account login (extract from here)
│   └── backtest.ini             # Generated backtest config
└── logs\                        # Terminal logs
```

## Success Criteria

**Skill execution is successful when:**

1. ✅ EA compiles with 0 errors and 0 warnings
2. ✅ Backtest runs to completion (return code 0)
3. ✅ Final balance and performance metrics extracted
4. ✅ User receives clear summary of results
5. ✅ Any issues are identified with specific solutions

**Report format:**

```markdown
## Backtest Results: {EA_NAME}

**Performance:**
- Starting Balance: $10,000
- Final Balance: ${final_balance}
- Net P/L: ${pnl} ({pnl_percent}%)
- Period: {from_date} → {to_date}
- Trades: {trade_count}

**Analysis:**
{key_findings}

**Recommendations:**
{suggested_improvements}
```

## Integration with Trading Projects

This skill is designed for:

- **ICT Liquidity Grab Strategy** (current project)
- **Any MT5-based trading EA development**
- **Strategy backtesting and optimization**
- **Automated trading system validation**

**Related workflows:**
- Research → Strategy Design → EA Development → **MT5 Backtesting** → Optimization → Live Trading

---

**Version:** 1.0
**Last Updated:** 2026-01-04
**Tested With:** MT5 EXNESS, Strategy1_LiquidityGrab_ICT_v3.mq5
