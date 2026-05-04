$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$Backend = Join-Path $RepoRoot "backend"
$Frontend = Join-Path $RepoRoot "frontend"

Write-Host "Opening backend (127.0.0.1:8000) and frontend (Next dev) in new windows..."
Start-Process powershell -ArgumentList @(
  "-NoExit", "-NoProfile", "-Command",
  "Set-Location '$Backend'; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
)
Start-Sleep -Milliseconds 500
Start-Process powershell -ArgumentList @(
  "-NoExit", "-NoProfile", "-Command",
  "Set-Location '$Frontend'; npm run dev"
)
