param(
  [int]$Port = 8123,
  [string]$Root = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

$rootPath = [System.IO.Path]::GetFullPath($Root)
$address = [System.Net.IPAddress]::Parse("127.0.0.1")
$listener = [System.Net.Sockets.TcpListener]::new($address, $Port)

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".mjs" = "text/javascript; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".svg" = "image/svg+xml"
  ".wav" = "audio/wav"
  ".ogg" = "audio/ogg"
  ".ico" = "image/x-icon"
}

function Resolve-RequestPath {
  param([string]$RawPath)

  $pathOnly = ($RawPath -split "\?", 2)[0]
  $decoded = [System.Uri]::UnescapeDataString($pathOnly)
  $relative = $decoded.TrimStart("/")
  if ([string]::IsNullOrWhiteSpace($relative)) {
    $relative = "index.html"
  }

  $candidate = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($rootPath, $relative))
  if (!$candidate.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }

  return $candidate
}

function Write-Response {
  param(
    [System.IO.Stream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [string]$ContentType,
    [byte[]]$Body,
    [bool]$HeadOnly = $false
  )

  $header = @(
    "HTTP/1.1 $StatusCode $StatusText",
    "Content-Type: $ContentType",
    "Content-Length: $($Body.Length)",
    "Cache-Control: no-cache",
    "Service-Worker-Allowed: /",
    "Connection: close",
    "",
    ""
  ) -join "`r`n"

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if (!$HeadOnly -and $Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

function Write-TextResponse {
  param(
    [System.IO.Stream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [string]$Message,
    [bool]$HeadOnly = $false
  )

  $body = [System.Text.Encoding]::UTF8.GetBytes($Message)
  Write-Response $Stream $StatusCode $StatusText "text/plain; charset=utf-8" $body $HeadOnly
}

$listener.Start()
Write-Host "Serving $rootPath at http://127.0.0.1:$Port/"

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 8192, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        Write-TextResponse $stream 400 "Bad Request" "Bad request"
        continue
      }

      do {
        $line = $reader.ReadLine()
      } while ($null -ne $line -and $line.Length -gt 0)

      $parts = $requestLine.Split(" ")
      if ($parts.Count -lt 2) {
        Write-TextResponse $stream 400 "Bad Request" "Bad request"
        continue
      }

      $method = $parts[0].ToUpperInvariant()
      $target = $parts[1]
      $headOnly = $method -eq "HEAD"

      if ($method -ne "GET" -and $method -ne "HEAD") {
        Write-TextResponse $stream 405 "Method Not Allowed" "Method not allowed" $headOnly
        continue
      }

      $path = Resolve-RequestPath $target
      if ($null -eq $path -or !(Test-Path -LiteralPath $path -PathType Leaf)) {
        Write-TextResponse $stream 404 "Not Found" "Not found" $headOnly
        continue
      }

      $extension = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
      $contentType = $mimeTypes[$extension]
      if ([string]::IsNullOrWhiteSpace($contentType)) {
        $contentType = "application/octet-stream"
      }

      $body = [System.IO.File]::ReadAllBytes($path)
      Write-Response $stream 200 "OK" $contentType $body $headOnly
    } catch {
      try {
        Write-TextResponse $stream 500 "Internal Server Error" $_.Exception.Message
      } catch {
      }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
