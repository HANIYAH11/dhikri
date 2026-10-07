# خادم ملفات محلي بسيط لتشغيل الموقع أثناء التطوير (PowerShell + TcpListener)
# الاستخدام:  powershell -ExecutionPolicy Bypass -File serve.ps1 [port]
param([int]$Port = 8931, [string]$Root = '')

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = Split-Path -Parent $PSCommandPath }
$root = (Resolve-Path -LiteralPath $Root).Path

$MIME = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.woff2'= 'font/woff2'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.ico'  = 'image/x-icon'
  '.json' = 'application/json; charset=utf-8'
  '.txt'  = 'text/plain; charset=utf-8'
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "Server running at http://127.0.0.1:$Port  (root: $root)"

function Send-Response($client, [byte[]]$body, [string]$status, [string]$type) {
  $head = "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  $hb = [System.Text.Encoding]::ASCII.GetBytes($head)
  $stream = $client.GetStream()
  $stream.Write($hb, 0, $hb.Length)
  if ($body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
  $stream.Flush()
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII)
      $requestLine = $reader.ReadLine()
      if (-not $requestLine) { continue }

      while ($true) {
        $line = $reader.ReadLine()
        if ([string]::IsNullOrWhiteSpace($line)) { break }
      }

      $path = ($requestLine -split '\s+')[1]
      if ($path -eq '/') { $path = '/index.html' }
      $path = [System.Uri]::UnescapeDataString(($path -split '\?')[0])
      $full = Join-Path $root ($path.TrimStart('/') -replace '/', '\')

      if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
        Send-Response $client $msg "404 Not Found" 'text/plain; charset=utf-8'
        continue
      }

      $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
      $type = if ($MIME.ContainsKey($ext)) { $MIME[$ext] } else { 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($full)
      Send-Response $client $bytes "200 OK" $type
    }
    catch {
      Write-Host ("error: " + $_.Exception.Message)
    }
    finally {
      $client.Close()
    }
  }
}
finally {
  $listener.Stop()
}
