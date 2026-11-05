param(
    [string]$Action = "status",
    [string]$Country = "SG",
    [string]$Proxy = ""
)

$ErrorActionPreference = "SilentlyContinue"

function Refresh-WinINet {
    try {
        $sig = @'
[DllImport("wininet.dll", SetLastError = true, CharSet = CharSet.Auto)]
public static extern bool InternetSetOption(IntPtr hInternet, int dwOption, IntPtr lpBuffer, int dwBufferLength);
'@
        $type = Add-Type -MemberDefinition $sig -Name "WinINetHelper_$([guid]::NewGuid().ToString('N'))" -Namespace "Win32" -PassThru
        # 39 = INTERNET_OPTION_SETTINGS_CHANGED, 37 = INTERNET_OPTION_REFRESH
        $type::InternetSetOption([IntPtr]::Zero, 39, [IntPtr]::Zero, 0) | Out-Null
        $type::InternetSetOption([IntPtr]::Zero, 37, [IntPtr]::Zero, 0) | Out-Null
    } catch {}
}

function Get-ProxyStatus {
    $reg = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
    $enabled = ($reg.ProxyEnable -eq 1)
    $server = if ($reg.ProxyServer) { $reg.ProxyServer } else { "" }
    return @{
        enabled = $enabled
        proxy = $server
    }
}

function Disable-Proxy {
    Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 0 -ErrorAction SilentlyContinue
    Refresh-WinINet
    $st = Get-ProxyStatus
    return (@{
        success = $true
        enabled = $st.enabled
        proxy = ""
    } | ConvertTo-Json -Compress)
}

function Enable-Proxy([string]$srv) {
    if (-not $srv) {
        return (@{ success = $false; error = "No proxy specified" } | ConvertTo-Json -Compress)
    }
    Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 1 -ErrorAction SilentlyContinue
    Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyServer -Value $srv -ErrorAction SilentlyContinue
    Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyOverride -Value "<local>" -ErrorAction SilentlyContinue
    Refresh-WinINet
    $st = Get-ProxyStatus
    return (@{
        success = $true
        enabled = $st.enabled
        proxy = $st.proxy
    } | ConvertTo-Json -Compress)
}

if ($Action -eq "status") {
    $st = Get-ProxyStatus
    Write-Output ($st | ConvertTo-Json -Compress)
    exit 0
}

if ($Action -eq "disable") {
    $res = Disable-Proxy
    Write-Output $res
    exit 0
}

if ($Action -eq "enable") {
    $res = Enable-Proxy -srv $Proxy
    Write-Output $res
    exit 0
}

if ($Action -eq "connect") {
    $CountryUpper = $Country.ToUpper().Trim()

    # Build candidate pool of (protocol, host:port)
    $candidates = @()

    if ($Proxy) {
        $candidates += [PSCustomObject]@{ Protocol = "http"; Server = $Proxy }
        $candidates += [PSCustomObject]@{ Protocol = "socks5"; Server = $Proxy }
    }

    # 1. Fetch from Geonode (high quality, verified proxies)
    try {
        $gnUrl = "https://proxylist.geonode.com/api/proxy-list?limit=12&page=1&sort_by=lastChecked&sort_type=desc&country=$CountryUpper"
        $gnJson = curl.exe -s --max-time 3 $gnUrl
        if ($gnJson) {
            $gnData = $gnJson | ConvertFrom-Json
            if ($gnData -and $gnData.data) {
                foreach ($item in $gnData.data) {
                    $proto = if ($item.protocols -contains "socks5") { "socks5" } else { "http" }
                    $candidates += [PSCustomObject]@{ Protocol = $proto; Server = "$($item.ip):$($item.port)" }
                }
            }
        }
    } catch {}

    # 2. Fetch from Proxyscrape (backup)
    try {
        $psUrl = "https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=3000&country=$CountryUpper&ssl=yes&anonymity=all"
        $psList = (curl.exe -s --max-time 3 $psUrl) -split "`r?`n"
        foreach ($srv in $psList) {
            if ($srv -match '^\d+\.\d+\.\d+\.\d+:\d+$') {
                $candidates += [PSCustomObject]@{ Protocol = "http"; Server = $srv }
            }
        }
    } catch {}

    # Known fallback servers for major countries
    if ($CountryUpper -eq "SG") {
        $candidates += [PSCustomObject]@{ Protocol = "socks5"; Server = "43.106.31.95:1080" }
        $candidates += [PSCustomObject]@{ Protocol = "http"; Server = "8.219.97.248:80" }
        $candidates += [PSCustomObject]@{ Protocol = "socks5"; Server = "128.199.202.122:1080" }
    } elseif ($CountryUpper -eq "US") {
        $candidates += [PSCustomObject]@{ Protocol = "http"; Server = "174.138.119.88:80" }
        $candidates += [PSCustomObject]@{ Protocol = "http"; Server = "34.44.49.215:80" }
    } elseif ($CountryUpper -eq "JP") {
        $candidates += [PSCustomObject]@{ Protocol = "http"; Server = "163.227.252.5:8080" }
    }

    $found = $null
    $foundProto = "http"
    $foundIp = ""
    $geoInfo = $null

    # Test top candidates for working HTTPS CONNECT and location match
    $testCount = [Math]::Min($candidates.Count, 8)
    for ($i = 0; $i -lt $testCount; $i++) {
        $cand = $candidates[$i]
        $pUrl = "$($cand.Protocol)://$($cand.Server)"
        try {
            # Critical: Test against HTTPS endpoint to guarantee Chrome HTTPS works!
            $res = curl.exe -s --max-time 2.5 --proxy $pUrl "https://api.ipify.org?format=json"
            if ($res -and $res -match '"ip"') {
                $ipObj = $res | ConvertFrom-Json
                if ($ipObj.ip) {
                    # Verify location
                    $geoRes = curl.exe -s --max-time 2 "http://ip-api.com/json/$($ipObj.ip)"
                    if ($geoRes -and $geoRes -match '"status":"success"') {
                        $parsedGeo = $geoRes | ConvertFrom-Json
                        if ($parsedGeo.countryCode -eq $CountryUpper -or $CountryUpper -eq "ANY") {
                            $found = $cand.Server
                            $foundProto = $cand.Protocol
                            $foundIp = $ipObj.ip
                            $geoInfo = $parsedGeo
                            break
                        }
                    }
                }
            }
        } catch {}
    }

    # If exact country match not found, but a working HTTPS proxy exists, take the best working one
    if (-not $found -and $candidates.Count -gt 0) {
        for ($i = 0; $i -lt [Math]::Min($candidates.Count, 4); $i++) {
            $cand = $candidates[$i]
            $pUrl = "$($cand.Protocol)://$($cand.Server)"
            try {
                $res = curl.exe -s --max-time 2 --proxy $pUrl "https://api.ipify.org?format=json"
                if ($res -and $res -match '"ip"') {
                    $ipObj = $res | ConvertFrom-Json
                    $found = $cand.Server
                    $foundProto = $cand.Protocol
                    $foundIp = $ipObj.ip
                    try {
                        $geoInfo = (curl.exe -s --max-time 2 "http://ip-api.com/json/$foundIp") | ConvertFrom-Json
                    } catch {}
                    break
                }
            } catch {}
        }
    }

    if ($found) {
        # Format Windows Proxy string appropriately
        $proxyVal = if ($foundProto -eq "socks5") { "socks=$found" } else { "http=$found;https=$found" }

        Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 1 -ErrorAction SilentlyContinue
        Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyServer -Value $proxyVal -ErrorAction SilentlyContinue
        Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyOverride -Value "<local>" -ErrorAction SilentlyContinue
        Refresh-WinINet

        $countryName = if ($geoInfo.country) { $geoInfo.country } else { $CountryUpper }
        $countryCode = if ($geoInfo.countryCode) { $geoInfo.countryCode } else { $CountryUpper }
        $cityName = if ($geoInfo.city) { $geoInfo.city } else { "Online" }
        $ispName = if ($geoInfo.isp) { $geoInfo.isp } else { "Proxy Route" }

        $out = @{
            success = $true
            enabled = $true
            proxy = $proxyVal
            ip = $foundIp
            country = $countryName
            countryCode = $countryCode
            city = $cityName
            isp = $ispName
        }
        Write-Output ($out | ConvertTo-Json -Compress)
        exit 0
    } else {
        # Never leave broken proxy enabled!
        Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 0 -ErrorAction SilentlyContinue
        Refresh-WinINet

        $out = @{
            success = $false
            error = "Could not find a responsive server for $CountryUpper. Please try again or choose another country."
        }
        Write-Output ($out | ConvertTo-Json -Compress)
        exit 1
    }
}
