<#
    Cleanup Script for Next.js / React Projects
    - Removes unused components from `components/`
    - Removes unused pages/routes from `pages/`
    - Moves them to `archive/` instead of deleting permanently
    - Automatically commits changes to Git
#>

# ------------------ CONFIGURATION ------------------
$projectRoot = Get-Location
$componentsDir = "$projectRoot/components"
$pagesDir = "$projectRoot/pages"
$archiveDir = "$projectRoot/archive"
$gitCommitMessage = "Cleanup: removed unused components and pages"

# Create archive folder if not exists
if (!(Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir | Out-Null
}

# ------------------ HELPER FUNCTIONS ------------------
function Is-FileUsed {
    param (
        [string]$fileName
    )

    $searchPattern = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    $usages = Get-ChildItem -Path $projectRoot -Recurse -Include *.js, *.jsx, *.ts, *.tsx |
              Select-String -Pattern $searchPattern -SimpleMatch

    return $usages.Count -gt 1
}

function Archive-File {
    param (
        [string]$filePath,
        [string]$relativeArchivePath
    )

    $destination = "$archiveDir\$relativeArchivePath"
    $destinationDir = Split-Path $destination

    if (!(Test-Path $destinationDir)) {
        New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    }

    Move-Item -Path $filePath -Destination $destination -Force
    Write-Host "Archived → $filePath"
}

# ------------------ CLEAN UNUSED COMPONENTS ------------------
Write-Host "----- Checking unused components -----"
Get-ChildItem -Path $componentsDir -Recurse -File -Include *.js, *.jsx, *.tsx | ForEach-Object {
    $file = $_.FullName
    $relativePath = $_.FullName.Substring($componentsDir.Length + 1)

    if (-not (Is-FileUsed $_.Name)) {
        Write-Host "Unused component found: $relativePath"
        Archive-File -filePath $file -relativeArchivePath "components\$relativePath"
    }
}

# ------------------ CLEAN UNUSED PAGES ------------------
Write-Host "----- Checking unused pages/routes -----"
Get-ChildItem -Path $pagesDir -Recurse -File -Include *.js, *.jsx, *.tsx | ForEach-Object {
    $file = $_.FullName
    $relativePath = $_.FullName.Substring($pagesDir.Length + 1)

    if (-not (Is-FileUsed $_.Name)) {
        Write-Host "Unused page found: $relativePath"
        Archive-File -filePath $file -relativeArchivePath "pages\$relativePath"
    }
}

# ------------------ GIT COMMIT AUTOMATICALLY ------------------
Write-Host "----- Adding changes to Git -----"
git add .

if ($LASTEXITCODE -eq 0) {
    git commit -m $gitCommitMessage
    Write-Host "Git commit created."
} else {
    Write-Host "Git add failed. Commit skipped."
}

Write-Host "----- Cleanup complete -----"
