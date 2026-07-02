$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $projectRoot ".runtime"
$appData = Join-Path $runtimeRoot "appdata"
$localAppData = Join-Path $runtimeRoot "localappdata"
$tempDir = Join-Path $runtimeRoot "temp"

New-Item -ItemType Directory -Force -Path $appData, $localAppData, $tempDir | Out-Null

$env:APPDATA = $appData
$env:LOCALAPPDATA = $localAppData
$env:TEMP = $tempDir
$env:TMP = $tempDir
$env:TENNODEX_RUNTIME_DIR = $runtimeRoot
$env:ELECTRON_DISABLE_GPU = "1"
$env:ELECTRON_ENABLE_LOGGING = "1"
$env:ELECTRON_NO_ATTACH_CONSOLE = "1"

$electron = Join-Path $projectRoot "node_modules\@overwolf\ow-electron\dist\electron.exe"
$main = Join-Path $projectRoot "dist\browser\index.js"

if (-not (Test-Path $main)) {
  & npm.cmd run build
}

& $electron $main
