# Build and Copy Script for Zotshort
# Run this script to build the extension and copy it to the releases directory with version number

# Build the extension
Write-Host "Building Zotshort extension..." -ForegroundColor Green
npm run build

# Get version from package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$version = $packageJson.version

# Create releases directory if it doesn't exist
$releasesDir = ".\releases"
if (-not (Test-Path -Path $releasesDir)) {
    New-Item -ItemType Directory -Path $releasesDir | Out-Null
}

# Find if files with this version already exist
$baseFileName = "zotshort-v$version"
$files = Get-ChildItem -Path "$releasesDir\$baseFileName*.xpi" -File
$suffix = ""
if ($files.Count -gt 0) {
    $maxSuffix = 0
    foreach ($file in $files) {
        if ($file.Name -match "$baseFileName(?:_(\d+))?\.xpi") {
            $currentSuffix = if ($matches.Count -gt 1) { [int]$matches[1] } else { 0 }
            $maxSuffix = [Math]::Max($maxSuffix, $currentSuffix)
        }
    }
    $suffix = "_$($maxSuffix + 1)"
}

# Copy the built XPI with version number
$sourcePath = ".\.scaffold\build\zotshort.xpi"
$destPath = "$releasesDir\$baseFileName$suffix.xpi"

Write-Host "Copying to $destPath..." -ForegroundColor Green
Copy-Item $sourcePath -Destination $destPath -Force

Write-Host "Done! Created $($baseFileName)$($suffix).xpi" -ForegroundColor Green 