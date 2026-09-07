<#
.SYNOPSIS
    Stops and removes the EndpointIQ Agent Windows service and its install directory.

.EXAMPLE
    .\uninstall.ps1

.NOTES
    Must be run from an elevated (Administrator) PowerShell prompt.
#>

param(
    [string]$InstallDir = "$env:ProgramFiles\EndpointIQ\Agent"
)

$ErrorActionPreference = "Stop"

$exePath = Join-Path $InstallDir "EndpointIQ-Agent.exe"

$existing = Get-Service -Name "EndpointIQAgentV2" -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Stopping and removing the EndpointIQAgentV2 service..."
    if (Test-Path $exePath) {
        & $exePath stop
        & $exePath remove
    } else {
        Stop-Service -Name "EndpointIQAgentV2" -Force -ErrorAction SilentlyContinue
        sc.exe delete "EndpointIQAgentV2" | Out-Null
    }
} else {
    Write-Host "EndpointIQAgentV2 service is not installed."
}

if (Test-Path $InstallDir) {
    Write-Host "Removing $InstallDir ..."
    Remove-Item -Path $InstallDir -Recurse -Force
}

Write-Host "EndpointIQ Agent uninstalled."
