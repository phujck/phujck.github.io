param()

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceRoot = Join-Path (Split-Path -Parent $repoRoot) "dynamics-as-computation\beamer"
$sourceVideoDir = Join-Path $sourceRoot "videos"
$sourcePosterDir = Join-Path $sourceRoot "posters"

$targetRoot = Join-Path $repoRoot "assets\talks\dynamics-as-computation"
$targetVideoDir = Join-Path $targetRoot "videos"
$targetPosterDir = Join-Path $targetRoot "posters"

if (-not (Test-Path -LiteralPath $sourceVideoDir)) {
    throw "Missing source video directory: $sourceVideoDir"
}

if (-not (Test-Path -LiteralPath $sourcePosterDir)) {
    throw "Missing source poster directory: $sourcePosterDir"
}

New-Item -ItemType Directory -Force -Path $targetVideoDir | Out-Null
New-Item -ItemType Directory -Force -Path $targetPosterDir | Out-Null

Get-ChildItem -LiteralPath $targetVideoDir -File -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -LiteralPath $targetPosterDir -File -ErrorAction SilentlyContinue | Remove-Item -Force

Copy-Item -Path (Join-Path $sourceVideoDir "*") -Destination $targetVideoDir -Force
Copy-Item -Path (Join-Path $sourcePosterDir "*") -Destination $targetPosterDir -Force

Write-Host "Synced Dynamics as Computation assets."
Write-Host "Videos:  $targetVideoDir"
Write-Host "Posters: $targetPosterDir"
