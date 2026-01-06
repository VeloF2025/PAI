# Copy Pack Icons from Global .claude to Repo
# Copies all 41 pack icons from ~/.claude/skills/ to repo's .claude/skills/

$GlobalSkillsDir = "$env:USERPROFILE\.claude\skills"
$RepoSkillsDir = "C:\Jarvis\AI Workspace\Personal_AI_Infrastructure\.claude\skills"

Write-Host "🎨 Copying pack icons from global directory to repo..." -ForegroundColor Cyan
Write-Host ""

$copiedCount = 0
$skippedCount = 0
$errorCount = 0

Get-ChildItem -Path $GlobalSkillsDir -Directory | ForEach-Object {
    $packName = $_.Name
    $globalIconPath = Join-Path $_.FullName "icon.png"
    $repoIconPath = Join-Path $RepoSkillsDir "$packName\icon.png"

    if (Test-Path $globalIconPath) {
        try {
            # Ensure destination directory exists
            $repoPackDir = Split-Path $repoIconPath -Parent
            if (-not (Test-Path $repoPackDir)) {
                New-Item -Path $repoPackDir -ItemType Directory -Force | Out-Null
            }

            # Copy icon
            Copy-Item -Path $globalIconPath -Destination $repoIconPath -Force
            Write-Host "  ✅ $packName" -ForegroundColor Green
            $copiedCount++
        } catch {
            Write-Host "  ❌ $packName - Error: $_" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "  ⏭️  $packName - No icon" -ForegroundColor Gray
        $skippedCount++
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   Copied: $copiedCount" -ForegroundColor Green
Write-Host "   Skipped: $skippedCount" -ForegroundColor Gray
Write-Host "   Errors: $errorCount" -ForegroundColor Red
$total = $copiedCount + $skippedCount + $errorCount
Write-Host "   Total: $total" -ForegroundColor Cyan
