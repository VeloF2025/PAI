# Setup GitHub PAT for MCP servers
# This script adds the GitHub token to your PowerShell profile

$token = gh auth token

# Create profile if it doesn't exist
if (!(Test-Path $PROFILE)) {
    New-Item -Path $PROFILE -ItemType File -Force | Out-Null
    Write-Host "Created PowerShell profile at: $PROFILE"
}

# Check if GITHUB_PAT already exists in profile
if (Select-String -Path $PROFILE -Pattern 'GITHUB_PAT' -Quiet) {
    Write-Host "✅ GITHUB_PAT already exists in PowerShell profile"
} else {
    # Add GITHUB_PAT to profile
    Add-Content -Path $PROFILE -Value "`n# GitHub Personal Access Token for MCP servers"
    Add-Content -Path $PROFILE -Value "`$env:GITHUB_PAT = '$token'"
    Write-Host "✅ Added GITHUB_PAT to PowerShell profile"
}

# Set for current session
$env:GITHUB_PAT = $token
Write-Host "✅ Set GITHUB_PAT for current session"

# Verify
if ($env:GITHUB_PAT) {
    Write-Host "`n✅ GitHub PAT is set!"
    Write-Host "   Token: $($env:GITHUB_PAT.Substring(0,8))..."
} else {
    Write-Host "`n❌ Failed to set GitHub PAT"
}

Write-Host ""
Write-Host "Next steps:"
Write-Host "   1. Restart Claude Code to pick up the new environment variable"
Write-Host "   2. The token will be available in all future PowerShell sessions"
