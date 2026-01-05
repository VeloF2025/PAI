# MT5 Trading Skill - Quick Reference

## Activate This Skill

```
"Run a backtest on my EA"
"Compile the MT5 expert advisor"
"Test this trading strategy"
"Analyze MT5 backtest results"
```

## What This Skill Does

- ✅ Compiles MQL5 Expert Advisors
- ✅ Runs automated MT5 backtests
- ✅ Analyzes performance logs
- ✅ Identifies why trades weren't taken
- ✅ Recommends parameter optimizations

## Quick Start

```bash
# Run full backtest (compile + test + analyze)
cd "{project_dir}"
python mt5_backtest.py
```

## Common Tasks

### 1. Quick Backtest
```bash
python mt5_backtest.py
```

### 2. Check Compilation
```bash
cat "{MT5_DATA}\MQL5\Experts\Advisors\{EA_NAME}.log"
```

### 3. Analyze Results
```bash
grep "final balance" "{MT5_DATA}\Tester\logs\{date}.log"
```

### 4. Find Why No Trades
```bash
grep -i "displacement\|rejection\|confluence" {log_file}
```

## Key Files

- **EA Source**: `MQL5\Experts\Advisors\*.mq5`
- **Backtest Script**: `mt5_backtest.py`
- **Results Log**: `Tester\logs\YYYYMMDD.log`
- **Config**: `config\backtest.ini`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "account not specified" | Set `Login=` in backtest.ini |
| No trades taken | Reduce `MinConfluenceScore` |
| Compilation fails | Check `.log` file for errors |
| Timeout | Increase timeout or reduce date range |

---

See `SKILL.md` for detailed documentation.
