# scripts/setup_helper.ps1
# Requires Administrator / SYSTEM elevation

$dataPath = "C:\ProgramData\Nexora"
if (-not (Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
}

# 1. Grant read/write permissions on C:\ProgramData\Nexora to all users
icacls $dataPath /grant "*S-1-5-32-545:(OI)(CI)(M)" /t /c
icacls $dataPath /grant "*S-1-5-11:(OI)(CI)(M)" /t /c

# 2. Write thermal_control.ps1 (STRICTLY controls fan mode via WMI; NEVER touches powercfg or screen brightness!)
$controlScript = @'
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
    # Also update Lenovo Vantage registry key so all software agrees
    try {
        reg.exe add "HKLM\SOFTWARE\Lenovo\VantageService\AddinData\LenovoGamingAddin\Event\FanManagerPlugin\SmartFanModeEvent" /v SmartFanMode /t REG_DWORD /d $modeNum /f /reg:64 2>$null
        reg.exe add "HKLM\SOFTWARE\Lenovo\VantageService\AddinData\LenovoGamingAddin\Event\FanManagerPlugin\RealStatusEvent" /v SmartFanMode /t REG_DWORD /d $modeNum /f /reg:64 2>$null
    } catch {}
    Write-Output "SUCCESS:$modeNum"
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
'@
Set-Content -Path "$dataPath\thermal_control.ps1" -Value $controlScript -Encoding UTF8 -Force

# 3. Write thermal_watcher.ps1 with continuous 2-way hotkey sync (NO powercfg)
$watcherScript = @'
$dataPath = "C:\ProgramData\Nexora"
$targetFile = "$dataPath\thermal_target.txt"
$currentFile = "$dataPath\thermal_current.txt"

function Get-HardwareMode {
    try {
        $gz = Get-WmiObject -Namespace "root\WMI" -Class LENOVO_GAMEZONE_DATA -ErrorAction Stop
        $res = $gz.GetSmartFanMode()
        $m = [int]$res.Data
        if ($m -in 1, 2, 3) { return $m }
    } catch {
        try {
            $gz = Get-CimInstance -Namespace root\wmi -ClassName LENOVO_GAMEZONE_DATA -ErrorAction Stop
            $res = Invoke-CimMethod -InputObject $gz -MethodName GetSmartFanMode -ErrorAction Stop
            $m = [int]$res.Data
            if ($m -in 1, 2, 3) { return $m }
        } catch {}
    }
    return 0
}

function Apply-FanMode([int]$modeNum) {
    try {
        $gz = Get-WmiObject -Namespace "root\WMI" -Class LENOVO_GAMEZONE_DATA -ErrorAction Stop
        $gz.SetSmartFanMode([uint32]$modeNum)
    } catch {
        try {
            $gz = Get-CimInstance -Namespace root\wmi -ClassName LENOVO_GAMEZONE_DATA -ErrorAction Stop
            Invoke-CimMethod -InputObject $gz -MethodName SetSmartFanMode -Arguments @{ Data = [uint32]$modeNum } -ErrorAction Stop
        } catch {}
    }
    $modeNum | Out-File -FilePath $currentFile -Encoding ascii -Force
    try {
        reg.exe add "HKLM\SOFTWARE\Lenovo\VantageService\AddinData\LenovoGamingAddin\Event\FanManagerPlugin\SmartFanModeEvent" /v SmartFanMode /t REG_DWORD /d $modeNum /f /reg:64 2>$null
        reg.exe add "HKLM\SOFTWARE\Lenovo\VantageService\AddinData\LenovoGamingAddin\Event\FanManagerPlugin\RealStatusEvent" /v SmartFanMode /t REG_DWORD /d $modeNum /f /reg:64 2>$null
    } catch {}
}

$lastKnownMode = 0
$lastTargetContent = ""

while ($true) {
    # A. Check hardware hotkey (e.g. Fn+Q on Lenovo)
    $hwMode = Get-HardwareMode
    if ($hwMode -gt 0) {
        if ($hwMode -ne $lastKnownMode) {
            $lastKnownMode = $hwMode
            $hwMode | Out-File -FilePath $currentFile -Encoding ascii -Force
        }
    }

    # B. Check if UI requested a mode change via thermal_target.txt
    if (Test-Path $targetFile) {
        $targetContent = (Get-Content $targetFile -ErrorAction SilentlyContinue | Out-String).Trim()
        if ($targetContent -match '^[123]$' -and $targetContent -ne $lastTargetContent) {
            $lastTargetContent = $targetContent
            $targetNum = [int]$targetContent
            if ($targetNum -ne $lastKnownMode) {
                $lastKnownMode = $targetNum
                Apply-FanMode $targetNum
            }
        }
    }

    Start-Sleep -Milliseconds 600
}
'@
Set-Content -Path "$dataPath\thermal_watcher.ps1" -Value $watcherScript -Encoding UTF8 -Force

# 4. Register NexoraThermalHelper task
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File C:\ProgramData\Nexora\thermal_control.ps1 -Action set'
$principal = New-ScheduledTaskPrincipal -UserId 'NT AUTHORITY\SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'NexoraThermalHelper' -Action $action -Principal $principal -Settings $settings -Force

# 5. Grant SDDL permissions to Authenticated Users (AU)
try {
    $scheduler = New-Object -ComObject "Schedule.Service"
    $scheduler.Connect()
    $folder = $scheduler.GetFolder("\")
    $task = $folder.GetTask("NexoraThermalHelper")
    $sddl = $task.GetSecurityDescriptor(0xF)
    $ace = "(A;;GRGX;;;AU)"
    if ($sddl -notmatch [regex]::Escape($ace)) {
        $newSddl = $sddl + $ace
        $task.SetSecurityDescriptor($newSddl, 0)
    }
} catch {
    Write-Warning "SDDL error: $_"
}

# 6. Grant NTFS permissions on the task file
$taskFile = "$env:WINDIR\System32\Tasks\NexoraThermalHelper"
if (Test-Path $taskFile) {
    icacls $taskFile /grant "*S-1-5-32-545:(RX)" /c
    icacls $taskFile /grant "*S-1-5-11:(RX)" /c
}

# 7. Register and start NexoraThermalWatcher
$watchAction = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File C:\ProgramData\Nexora\thermal_watcher.ps1'
$watchTrigger1 = New-ScheduledTaskTrigger -AtStartup
$watchTrigger2 = New-ScheduledTaskTrigger -AtLogOn
$watchPrincipal = New-ScheduledTaskPrincipal -UserId 'NT AUTHORITY\SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$watchSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Days 9999) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'NexoraThermalWatcher' -Action $watchAction -Trigger @($watchTrigger1, $watchTrigger2) -Principal $watchPrincipal -Settings $watchSettings -Force
Start-ScheduledTask -TaskName 'NexoraThermalWatcher' -ErrorAction SilentlyContinue

Set-Content -Path "$dataPath\helper_configured.txt" -Value "1" -Force
Write-Host "Nexora Thermal Helper and Watcher configured successfully without altering screen brightness!" -ForegroundColor Green
