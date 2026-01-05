# Alex Hormozi Pitch - Installation Guide

**Pack Version**: 2.0
**Installation Time**: 5 minutes
**Complexity**: Low (Verification only, no dependencies)

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

### Optional

**None** - alex-hormozi-pitch is a self-contained methodology skill with no external dependencies.

---

## Installation Steps

### Step 1: Verify Skill Files Exist

The alex-hormozi-pitch skill should already be installed in your PAI skills directory.

**Unix/Mac:**
```bash
ls -la "$HOME/.claude/skills/alex-hormozi-pitch/"
```

**Windows (PowerShell):**
```powershell
Get-ChildItem "$env:USERPROFILE\.claude\skills\alex-hormozi-pitch\" -Force
```

**Expected Files:**
```
alex-hormozi-pitch/
├── SKILL.md              # Main skill documentation (loaded by Claude Code)
├── PACK_README.md        # This pack overview (on-demand)
├── PACK_INSTALL.md       # This installation guide (on-demand)
├── PACK_VERIFY.md        # Verification checklist (on-demand)
└── workflows/
    └── create-pitch.md   # Complete pitch creation workflow (12 steps)
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
@alex-hormozi-pitch
```

**Expected Behavior**:
- Skill activates
- Kai loads alex-hormozi-pitch context
- Ready to guide pitch creation

**If skill doesn't load**:
- Check that SKILL.md exists in the skill directory
- Verify Claude Code is recognizing the ~/.claude/skills/ directory
- Try restarting Claude Code session

---

### Step 3: Test Basic Functionality

In a Claude Code session, try a simple pitch creation request:

```
Create a pitch for a productivity app for remote teams
```

**Expected Response**:
- Kai activates alex-hormozi-pitch skill
- Begins Phase 1: Discovery & Foundation
- Asks 6 key discovery questions:
  1. What are you selling?
  2. Who is your ideal customer?
  3. What problem does this solve?
  4. What's the desired end result?
  5. What's your current price point?
  6. What's your main competition offering?

**If Kai doesn't activate the skill**:
- Try explicit activation: `Use alex-hormozi-pitch to create a pitch for [product]`
- Verify skill files are in correct location
- Check Claude Code session logs for errors

---

### Step 4: Verify Pack Documentation Access

Test on-demand loading of Pack documentation:

```
Load the alex-hormozi-pitch Pack README
```

**Expected Behavior**:
- Kai reads PACK_README.md
- Provides overview of methodology, architecture, use cases

**Alternative Test**:
```
Read the alex-hormozi-pitch installation guide
```

**Expected Behavior**:
- Kai reads PACK_INSTALL.md (this file)

---

### Step 5: Verify Workflow Access

Check that the complete workflow documentation is accessible:

**Unix/Mac:**
```bash
cat "$HOME/.claude/skills/alex-hormozi-pitch/workflows/create-pitch.md" | head -50
```

**Windows (PowerShell):**
```powershell
Get-Content "$env:USERPROFILE\.claude\skills\alex-hormozi-pitch\workflows\create-pitch.md" | Select-Object -First 50
```

**Expected Output**: First 50 lines of the 12-step workflow documentation

---

### Step 6: Confirm No External Dependencies

alex-hormozi-pitch is a **self-contained methodology skill** - it doesn't require:
- ❌ External API keys
- ❌ Additional software installation
- ❌ Database setup
- ❌ Network access
- ❌ Third-party services

**What it DOES require**:
- ✅ Claude Code CLI (already installed)
- ✅ User interaction (answering discovery questions)
- ✅ Creative input (product/service details)

---

## Configuration (Optional)

### No Configuration Required

alex-hormozi-pitch works out-of-the-box with no configuration files, environment variables, or settings to adjust.

**The skill is entirely workflow-driven:**
- Activated by user request
- Guided by interactive questions
- Adapts to user's product/service details
- Outputs customized pitch documents

---

## Troubleshooting

### Issue 1: Skill Not Activating

**Symptoms**:
- User says "create a pitch" but alex-hormozi-pitch skill doesn't activate
- Kai doesn't enter guided workflow

**Possible Causes**:
1. Skill files missing or incorrectly placed
2. SKILL.md not readable by Claude Code
3. Skill name mismatch

**Solutions**:

**A. Verify file structure:**
```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/alex-hormozi-pitch/SKILL.md"

# Windows PowerShell
Test-Path "$env:USERPROFILE\.claude\skills\alex-hormozi-pitch\SKILL.md"
```

Expected: File exists and is readable

**B. Check SKILL.md frontmatter:**
```bash
# Unix/Mac
head -10 "$HOME/.claude/skills/alex-hormozi-pitch/SKILL.md"

# Windows PowerShell
Get-Content "$env:USERPROFILE\.claude\skills\alex-hormozi-pitch\SKILL.md" | Select-Object -First 10
```

Expected frontmatter:
```yaml
---
name: alex-hormozi-pitch
description: Create irresistible offers and pitches using Alex Hormozi's methodology...
---
```

**C. Explicit activation:**
Instead of relying on auto-detection, explicitly request:
```
Use alex-hormozi-pitch skill to create a pitch for [product/service]
```

---

### Issue 2: Pack Files Not Loading

**Symptoms**:
- PACK_README.md, PACK_INSTALL.md, or PACK_VERIFY.md not found
- "File not found" errors when trying to read Pack docs

**Possible Causes**:
1. Pack files not installed
2. Incorrect file permissions
3. Path issues

**Solutions**:

**A. Verify all Pack files exist:**
```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/alex-hormozi-pitch/PACK_"*

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\skills\alex-hormozi-pitch\PACK_*"
```

Expected: PACK_README.md, PACK_INSTALL.md, PACK_VERIFY.md

**B. Check file permissions:**
```bash
# Unix/Mac - ensure files are readable
chmod 644 "$HOME/.claude/skills/alex-hormozi-pitch/PACK_"*
```

**C. Use absolute paths:**
If relative paths fail, use absolute paths:
```
Read C:\Users\<Username>\.claude\skills\alex-hormozi-pitch\PACK_README.md
```

---

### Issue 3: Workflow Documentation Missing

**Symptoms**:
- workflows/create-pitch.md not found
- Guided workflow doesn't provide detailed steps

**Possible Causes**:
1. workflows/ subdirectory missing
2. create-pitch.md file missing or corrupted

**Solutions**:

**A. Verify workflows directory:**
```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/alex-hormozi-pitch/workflows/"

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\skills\alex-hormozi-pitch\workflows\"
```

Expected: create-pitch.md (392 lines, ~11,568 bytes)

**B. Check file integrity:**
```bash
# Unix/Mac
wc -l "$HOME/.claude/skills/alex-hormozi-pitch/workflows/create-pitch.md"

# Windows PowerShell
(Get-Content "$env:USERPROFILE\.claude\skills\alex-hormozi-pitch\workflows\create-pitch.md").Count
```

Expected: ~392 lines

**C. Re-download if corrupted:**
If the file appears corrupted, re-download the alex-hormozi-pitch skill from your PAI source.

---

### Issue 4: Incomplete Pitch Output

**Symptoms**:
- Kai skips workflow phases
- Pitch document missing key sections
- No MAGIC-named bonuses or guarantee framework

**Possible Causes**:
1. User provided incomplete information
2. Workflow interrupted mid-process
3. Kai not following complete 12-step process

**Solutions**:

**A. Provide detailed upfront information:**
Instead of:
```
Create a pitch for my product
```

Provide:
```
Create a pitch for [detailed product description], targeting [specific avatar], solving [specific problem], priced at [range]
```

**B. Request complete workflow explicitly:**
```
Guide me through the complete 12-step Alex Hormozi pitch creation workflow for [product]
```

**C. Resume from specific phase:**
If interrupted, resume:
```
Continue the alex-hormozi-pitch workflow from Phase 4: The Stack
```

---

### Issue 5: Generic Bonuses (Not Using MAGIC Formula)

**Symptoms**:
- Bonuses named generically ("Bonus 1", "Marketing Guide")
- Missing MAGIC formula elements

**Possible Causes**:
1. Kai not applying MAGIC formula rigorously
2. User requested quick output without full workflow

**Solutions**:

**A. Explicitly request MAGIC naming:**
```
Rename all bonuses using the MAGIC formula
```

**B. Reference MAGIC formula during workflow:**
When Kai asks about bonuses, remind:
```
Create bonus names using MAGIC: Make it about them, Announce avatar, Give them goal, Indicate time interval, Complete with container word
```

**C. Review and iterate:**
After initial pitch creation:
```
Review all bonus names and improve using MAGIC formula. Show before/after comparisons.
```

---

### Issue 6: Weak or Missing Guarantee

**Symptoms**:
- No guarantee included in pitch
- Generic "satisfaction guaranteed" language
- Guarantee doesn't match business model

**Possible Causes**:
1. User didn't specify business model clearly
2. Kai didn't complete Phase 5: Guarantee Framework
3. Risk tolerance not discussed

**Solutions**:

**A. Specify business model during discovery:**
Clearly state:
- B2C or B2B
- Ticket price (low/mid/high)
- Expected customer commitment level
- Refund risk tolerance

**B. Request specific guarantee type:**
```
Add a conditional guarantee to the pitch: "Complete all 8 modules, if you don't get [result] in 90 days, triple refund"
```

**C. Reference guarantee frameworks explicitly:**
```
Review the 4 guarantee types (unconditional, conditional, outcome-based, anti-guarantee) and recommend the best fit for my business model
```

---

### Issue 7: Fake or Weak Scarcity

**Symptoms**:
- Generic "limited time offer" language
- No real constraint backing scarcity claim
- Arbitrary urgency ("ends tonight!")

**Possible Causes**:
1. User trying to force scarcity where none exists
2. Kai not enforcing "scarcity must be real" rule
3. Lack of legitimate constraints in business

**Solutions**:

**A. Identify REAL constraints:**
Ask yourself:
- What is my actual fulfillment capacity?
- What bonuses can I legitimately limit?
- What time-based factors create natural urgency?
- What market conditions create exploding opportunity?

**B. Request capacity-based scarcity (most legitimate):**
```
Create capacity-based scarcity for the pitch based on my ability to onboard X clients per month
```

**C. Remove scarcity if none exists:**
Better to have NO scarcity than FAKE scarcity:
```
Remove the scarcity/urgency section - I don't have legitimate constraints right now
```

---

### Issue 8: Pricing Too Low (Not Premium Positioned)

**Symptoms**:
- Price feels too low for value provided
- No 10x value-to-price ratio
- Competing on price instead of value

**Possible Causes**:
1. User undervaluing their offer
2. Fear of premium pricing
3. Not maximizing value stack

**Solutions**:

**A. Review value equation optimization:**
```
Re-evaluate the pricing. Show me how to increase the value stack to justify 3x higher pricing.
```

**B. Add more bonuses to increase total value:**
```
Add 3 more high-value bonuses to the stack to justify premium pricing
```

**C. Reference Hormozi pricing principles:**
Remind Kai:
- "Charge the highest prices in your market"
- "Never discount - add more value instead"
- "Create 10x value-to-price ratio"

---

## Production Optimizations

### For Agencies/Consultants Creating Multiple Pitches

**1. Create Pitch Templates**
After creating a few pitches, identify patterns:
- Save MAGIC-named bonus templates
- Reuse guarantee frameworks
- Document scarcity strategies

**2. Batch Discovery Questions**
For similar clients/products:
- Pre-fill discovery answers
- Focus on differentiation questions only
- Speed up Phase 1 from 10 min to 2 min

**3. Library of Examples**
Maintain a library of:
- Strong value stacks (by industry)
- Effective guarantees (by business model)
- Legitimate scarcity mechanisms
- Objection handling scripts

**Reference during pitch creation**:
```
Review my pitch library and suggest the best guarantee framework for a B2B SaaS product
```

---

### For Product/Course Creators

**1. Iterative Refinement**
Don't expect perfection on first pass:
- Create v1 pitch quickly (30 min)
- Test with small audience
- Refine based on feedback
- Run through workflow again for v2

**2. A/B Testing Frameworks**
Create variations:
- Test different guarantee types
- Test different scarcity mechanisms
- Test different bonus combinations

**3. Seasonal Updates**
Refresh pitch quarterly:
- Update bonuses for relevance
- Adjust scarcity (new cohorts)
- Incorporate new testimonials

---

## Next Steps

After successful installation and verification:

1. **Run Your First Pitch Creation**
   - Choose a real product/service
   - Go through complete 12-step workflow
   - Generate complete pitch document

2. **Review Pack Documentation**
   - Read PACK_README.md for methodology deep-dive
   - Study 5 detailed use cases
   - Understand all 4 guarantee types

3. **Complete Verification**
   - Follow PACK_VERIFY.md checklist
   - Test all workflow phases
   - Validate pitch output quality

4. **Iterate and Improve**
   - Test pitch with real prospects
   - Refine based on objections encountered
   - Re-run workflow for v2 pitch

---

## Support

### Documentation
- **PACK_README.md**: Methodology overview, architecture, use cases
- **PACK_VERIFY.md**: Comprehensive verification checklist
- **workflows/create-pitch.md**: Complete 12-step workflow details

### Learning Resources
- **Book**: "$100M Offers" by Alex Hormozi
- **Skill Examples**: 5 detailed use cases in PACK_README.md
- **Hormozi Wisdom**: Quick reference quotes in PACK_README.md

### Getting Help

**Within Claude Code Session**:
```
Help me troubleshoot alex-hormozi-pitch skill - [describe issue]
```

**PAI Community**:
- Share pitch creation experiences
- Exchange MAGIC-named bonus examples
- Discuss guarantee framework variations

---

**Installation Guide Version**: 2.0
**Last Updated**: 2026-01-03
**Estimated Installation Time**: 5 minutes (verification only)
