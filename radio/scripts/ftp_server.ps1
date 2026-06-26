param(
    [string]$Action = "start",
    [string]$Dir = "",
    [int]$Port = 2121,
    [string]$User = "seed",
    [string]$Password = "seed123"
)

$ScriptPath = Join-Path $PSScriptRoot "ftp_server.py"
$PidFile = Join-Path $PSScriptRoot "ftp_server.pid"

if ($Action -eq "stop") {
    if (Test-Path $PidFile) {
        $oldPid = Get-Content $PidFile
        $proc = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
        if ($proc) {
            Stop-Process -Id $oldPid -Force
            Write-Host "FTP server stopped (PID: $oldPid)"
        }
        Remove-Item $PidFile -Force
    } else {
        Write-Host "FTP server is not running"
    }
    exit
}

if ($Action -eq "start") {
    if (Test-Path $PidFile) {
        $oldPid = Get-Content $PidFile
        $proc = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "FTP server already running (PID: $oldPid)"
            exit
        }
        Remove-Item $PidFile -Force
    }

    $musicDir = if ($Dir) { $Dir } else { Resolve-Path (Join-Path $PSScriptRoot "..\music") }

    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.PrefixOrigin -ne "WellKnown" } | Select-Object -First 1).IPAddress

    $logFile = Join-Path $PSScriptRoot "ftp_server.log"

    if (Get-Command "py" -ErrorAction SilentlyContinue) {
        $pythonCmd = "py"
        $pythonArgs = @("-3.12", $ScriptPath)
    } else {
        $pythonCmd = "python"
        $pythonArgs = @($ScriptPath)
    }

    $allArgs = $pythonArgs + @(
        "-u", $ScriptPath,
        "--dir", $musicDir,
        "--port", $Port,
        "--user", $User,
        "--password", $Password
    )

    $proc = Start-Process -FilePath $pythonCmd -ArgumentList $allArgs -WindowStyle Hidden -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $logFile

    $proc.Id | Out-File -FilePath $PidFile -Encoding ascii

    Start-Sleep -Seconds 1

    if ($proc.HasExited) {
        Write-Host "ERROR: FTP server failed to start. Check log: $logFile"
        Get-Content $logFile
    } else {
        Write-Host "=========================================="
        Write-Host "  FTP SERVER STARTED"
        Write-Host "=========================================="
        Write-Host "  URL:     ftp://$ip`:$Port"
        Write-Host "  Local:   ftp://localhost`:$Port"
        Write-Host "  User:    $User"
        Write-Host "  Pass:    $Password"
        Write-Host "  Dir:     $musicDir"
        Write-Host "  PID:     $($proc.Id)"
        Write-Host "=========================================="
        Write-Host "To stop:  .\ftp_server.ps1 -Action stop"
        Write-Host "Connect from Windows:"
        Write-Host "  Explorer -> ftp://localhost:2121"
        Write-Host "  (user: $User, pass: $Password)"
    }
}
