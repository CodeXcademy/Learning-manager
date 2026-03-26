# Builds the Python API as a one-file executable for the Tauri bundle (Windows x64).
# Prerequisites: Python on PATH; pip install -r learning-manager-backend/requirements.txt pyinstaller
#
# Tauri externalBin expects this exact filename (see src-tauri/tauri.conf.json):
#   src-tauri\binaries\learning-manager-api-x86_64-pc-windows-msvc.exe

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "learning-manager-backend"
$OutDir = Join-Path $Root "src-tauri\binaries"
$TargetName = "learning-manager-api-x86_64-pc-windows-msvc.exe"

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

Push-Location $Backend
try {
    pip install -q pyinstaller
    pyinstaller --noconfirm --onefile --name learning-manager-api `
        --paths . `
        --add-data "app;app" `
        --collect-all uvicorn `
        --collect-all fastapi `
        --collect-all pydantic `
        --collect-all pydantic_settings `
        --collect-all sqlalchemy `
        --collect-all jose `
        --collect-all passlib `
        --collect-all email_validator `
        launcher.py
    Copy-Item -Force "dist\learning-manager-api.exe" (Join-Path $OutDir $TargetName)
    Write-Host "Sidecar OK:" (Join-Path $OutDir $TargetName)
}
finally {
    Pop-Location
}
