<#
.SYNOPSIS
    Installs the EndpointIQ Agent as a Windows service on this machine.

.EXAMPLE
    .\install.ps1 -ApiUrl "http://10.0.0.5:8001" -AgentKey "prod-agent-key"

.NOTES
    Must be run from an elevated (Administrator) PowerShell prompt.
    Expects EndpointIQ-Agent.exe to already be built (pyinstaller EndpointIQ-Agent.spec)
    and present in .\dist\ next to this script.
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ApiUrl,

    [Parameter(Mandatory = $true)]
    [string]$AgentKey,

    [int]$IntervalSeconds = 300,

    [string]$InstallDir = "$env:ProgramFiles\EndpointIQ\Agent"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$buildSource = Join-Path $scriptDir "dist\EndpointIQ-Agent"

if (-not (Test-Path (Join-Path $buildSource "EndpointIQ-Agent.exe"))) {
    throw "Build not found at $buildSource. Build it first with: pyinstaller EndpointIQ-Agent.spec"
}

Write-Host "Installing EndpointIQ Agent to $InstallDir ..."

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $InstallDir "config") | Out-Null

Copy-Item -Path (Join-Path $buildSource "*") -Destination $InstallDir -Recurse -Force

$config = @{
    apiUrl          = $ApiUrl
    agentKey        = $AgentKey
    intervalSeconds = $IntervalSeconds
} | ConvertTo-Json

Set-Content -Path (Join-Path $InstallDir "config\agent_config.json") -Value $config -Encoding utf8

$exePath = Join-Path $InstallDir "EndpointIQ-Agent.exe"

$existing = Get-Service -Name "EndpointIQAgentV2" -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Existing service found, stopping and removing it first..."
    & $exePath stop
    & $exePath remove
}

& $exePath --startup auto install

Start-Service -Name "EndpointIQAgentV2"

Write-Host "EndpointIQ Agent installed and started."
Write-Host "API URL:  $ApiUrl"
Write-Host "Interval: $IntervalSeconds seconds"
Write-Host ""
Get-Service -Name "EndpointIQAgentV2"
