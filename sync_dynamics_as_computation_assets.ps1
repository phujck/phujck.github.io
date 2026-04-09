param()

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceRoot = Join-Path (Split-Path -Parent $repoRoot) "dynamics-as-computation\beamer"
$sourceVideoDir = Join-Path $sourceRoot "videos"
$sourcePosterDir = Join-Path $sourceRoot "posters"
$sourceEndPosterDir = Join-Path $sourceRoot "end_posters"

$targetRoot = Join-Path $repoRoot "assets\talks\dynamics-as-computation"
$targetVideoDir = Join-Path $targetRoot "videos"
$targetPosterDir = Join-Path $targetRoot "posters"
$targetEndPosterDir = Join-Path $targetRoot "end_posters"

if (-not (Test-Path -LiteralPath $sourceVideoDir)) {
    throw "Missing source video directory: $sourceVideoDir"
}

if (-not (Test-Path -LiteralPath $sourcePosterDir)) {
    throw "Missing source poster directory: $sourcePosterDir"
}

if (-not (Test-Path -LiteralPath $sourceEndPosterDir)) {
    throw "Missing source end_poster directory: $sourceEndPosterDir"
}

New-Item -ItemType Directory -Force -Path $targetVideoDir | Out-Null
New-Item -ItemType Directory -Force -Path $targetPosterDir | Out-Null
New-Item -ItemType Directory -Force -Path $targetEndPosterDir | Out-Null

Get-ChildItem -LiteralPath $targetVideoDir -File -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -LiteralPath $targetPosterDir -File -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -LiteralPath $targetEndPosterDir -File -ErrorAction SilentlyContinue | Remove-Item -Force

Copy-Item -Path (Join-Path $sourceVideoDir "*") -Destination $targetVideoDir -Force
Copy-Item -Path (Join-Path $sourcePosterDir "*") -Destination $targetPosterDir -Force
Copy-Item -Path (Join-Path $sourceEndPosterDir "*") -Destination $targetEndPosterDir -Force

Write-Host "Synced Dynamics as Computation assets."
Write-Host "Videos:      $targetVideoDir"
Write-Host "Posters:     $targetPosterDir"
Write-Host "End posters: $targetEndPosterDir"

