param([string]$Action = "set", [string]$Mode = "")

$dataPath = "C:\ProgramData\Nexora"
$targetFile = "$dataPath\thermal_target.txt"
$currentFile = "$dataPath\thermal_current.txt"

function Get-ModeValue {
    try {
        $gz = Get-WmiObject -Namespace "root\WMI" -Class LENOVO_GAMEZONE_DATA -ErrorAction Stop
        $res = $gz.GetSmartFanMode()
        return [int]$res.Data
    } catch {
        try {
            $gz = Get-CimInstance -Namespace root\wmi -ClassName LENOVO_GAMEZONE_DATA -ErrorAction Stop
            $res = Invoke-CimMethod -InputObject $gz -MethodName GetSmartFanMode -ErrorAction Stop
            return [int]$res.Data
        } catch {
            if (Test-Path $currentFile) {
                return (Get-Content $currentFile -ErrorAction SilentlyContinue).Trim()
            }
            return 2
        }
    }
}

function Set-ModeValue([uint32]$m) {
    try {
        $gz = Get-WmiObject -Namespace "root\WMI" -Class LENOVO_GAMEZONE_DATA -ErrorAction Stop
        $res = $gz.SetSmartFanMode($m)
        return $true
    } catch {
        $gz = Get-CimInstance -Namespace root\wmi -ClassName LENOVO_GAMEZONE_DATA -ErrorAction Stop
        $res = Invoke-CimMethod -InputObject $gz -MethodName SetSmartFanMode -Arguments @{ Data = $m } -ErrorAction Stop
        return $true
    }
}

if ($Action -eq "get" -or $Action -eq "sync") {
    $val = Get-ModeValue
    $val | Out-File -FilePath $currentFile -Encoding ascii -Force
    Write-Output $val
    exit 0
}

if (-not $Mode -and (Test-Path $targetFile)) {
    $Mode = (Get-Content $targetFile -ErrorAction SilentlyContinue | Out-String).Trim()
}

$modeNum = 2
if ($Mode -eq "1" -or $Mode -eq "Quiet" -or $Mode -eq "quiet") {
    $modeNum = 1
} elseif ($Mode -eq "3" -or $Mode -eq "Performance" -or $Mode -eq "performance") {
    $modeNum = 3
} else {
    $modeNum = 2
}

try {
    Set-ModeValue -m ([uint32]$modeNum)
    $modeNum | Out-File -FilePath $currentFile -Encoding ascii -Force
    # Update Lenovo Vantage registry key so all software agrees
    try {
        reg.exe add "HKLM\SOFTWARE\Lenovo\VantageService\AddinData\LenovoGamingAddin\Event\FanManagerPlugin\SmartFanModeEvent" /v SmartFanMode /t REG_DWORD /d $modeNum /f /reg:64 2>$null
        reg.exe add "HKLM\SOFTWARE\Lenovo\VantageService\AddinData\LenovoGamingAddin\Event\FanManagerPlugin\RealStatusEvent" /v SmartFanMode /t REG_DWORD /d $modeNum /f /reg:64 2>$null
    } catch {}
    Write-Output "SUCCESS:$modeNum"
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
