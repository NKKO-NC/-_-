Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$PackRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$AssetRoot = Join-Path $PackRoot "assets"
$AssetVersion = "20260619-visual-b"
$SampleSeed = 20260619
$script:Random = [System.Random]::new($SampleSeed)
$script:Assets = [ordered]@{}
$script:ChecksumLines = New-Object System.Collections.Generic.List[string]

New-Item -ItemType Directory -Force -Path $AssetRoot | Out-Null

function New-Bitmap([int]$Width, [int]$Height, [bool]$Transparent = $true) {
  $bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  if ($Transparent) {
    $graphics.Clear([System.Drawing.Color]::Transparent)
  } else {
    $graphics.Clear([System.Drawing.Color]::FromArgb(7, 8, 10))
  }

  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function New-Color([int]$A, [int]$R, [int]$G, [int]$B) {
  return [System.Drawing.Color]::FromArgb($A, $R, $G, $B)
}

function New-PenColor([int]$A, [int]$R, [int]$G, [int]$B, [float]$Width) {
  return [System.Drawing.Pen]::new((New-Color $A $R $G $B), $Width)
}

function New-BrushColor([int]$A, [int]$R, [int]$G, [int]$B) {
  return [System.Drawing.SolidBrush]::new((New-Color $A $R $G $B))
}

function New-RoundedPath([System.Drawing.RectangleF]$Rect, [float]$Radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $Radius * 2
  $path.AddArc($Rect.X, $Rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($Rect.Right - $diameter, $Rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($Rect.Right - $diameter, $Rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($Rect.X, $Rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Save-Asset(
  [System.Drawing.Bitmap]$Bitmap,
  [string]$AssetId,
  [string]$FileName,
  [string]$Role,
  [bool]$Alpha
) {
  $path = Join-Path $AssetRoot $FileName
  $Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $hash = (Get-FileHash -Path $path -Algorithm SHA256).Hash.ToLowerInvariant()
  $script:ChecksumLines.Add("$hash  assets/$FileName")

  $script:Assets[$AssetId] = [ordered]@{
    src = $FileName
    type = "image/png"
    width = $Bitmap.Width
    height = $Bitmap.Height
    alpha = $Alpha
    role = $Role
    source = "original-procedural-generated"
    license = "project-owned-procedural-placeholder-commercial-use-ok"
    sha256 = $hash
  }
}

function Add-GoldVeins([System.Drawing.Graphics]$Graphics, [int]$Width, [int]$Height, [int]$Count, [int]$Alpha = 88) {
  for ($i = 0; $i -lt $Count; $i++) {
    $x1 = $script:Random.Next([int]($Width * 0.08), [int]($Width * 0.92))
    $y1 = $script:Random.Next([int]($Height * 0.1), [int]($Height * 0.9))
    $x2 = $x1 + $script:Random.Next([int](-$Width * 0.12), [int]($Width * 0.12))
    $y2 = $y1 + $script:Random.Next([int](-$Height * 0.12), [int]($Height * 0.12))
    $pen = New-PenColor $Alpha 176 139 78 ([Math]::Max(1.6, [Math]::Min($Width, $Height) / 900))
    $Graphics.DrawLine($pen, $x1, $y1, $x2, $y2)
    if ($script:Random.NextDouble() -gt 0.55) {
      $highlight = New-PenColor ([Math]::Max(24, $Alpha - 30)) 228 210 168 1
      $Graphics.DrawLine($highlight, $x1 + 1, $y1 + 1, $x2 + 1, $y2 + 1)
      $highlight.Dispose()
    }
    $pen.Dispose()
  }
}

function Add-PaperFibers([System.Drawing.Graphics]$Graphics, [int]$Width, [int]$Height, [int]$Count) {
  for ($i = 0; $i -lt $Count; $i++) {
    $shade = $script:Random.Next(120, 170)
    $alpha = $script:Random.Next(10, 30)
    $brush = New-BrushColor $alpha $shade ($shade - 8) ($shade - 18)
    $x = $script:Random.Next(0, $Width)
    $y = $script:Random.Next(0, $Height)
    $w = $script:Random.Next(10, [Math]::Max(16, [int]($Width * 0.04)))
    $h = $script:Random.Next(2, 6)
    $Graphics.FillEllipse($brush, $x, $y, $w, $h)
    $brush.Dispose()
  }
}

function Get-LandscapeSlots([int]$Width, [int]$Height) {
  $slots = New-Object System.Collections.Generic.List[object]
  $storeWidth = [int]($Width * 0.11)
  $storeHeight = [int]($Height * 0.57)
  $slots.Add(@{ Kind = "store"; Rect = [System.Drawing.RectangleF]::new($Width * 0.08, $Height * 0.215, $storeWidth, $storeHeight) })
  $slots.Add(@{ Kind = "store"; Rect = [System.Drawing.RectangleF]::new($Width * 0.81, $Height * 0.215, $storeWidth, $storeHeight) })

  for ($row = 0; $row -lt 2; $row++) {
    $cy = if ($row -eq 0) { $Height * 0.34 } else { $Height * 0.66 }
    for ($i = 0; $i -lt 6; $i++) {
      $cx = $Width * (0.285 + $i * 0.087)
      $r = [Math]::Min($Width, $Height) * 0.095
      $slots.Add(@{ Kind = "pit"; Rect = [System.Drawing.RectangleF]::new($cx - $r, $cy - $r, $r * 2, $r * 2) })
    }
  }

  return $slots
}

function Get-PortraitSlots([int]$Width, [int]$Height) {
  $slots = New-Object System.Collections.Generic.List[object]
  $storeWidth = [int]($Width * 0.56)
  $storeHeight = [int]($Height * 0.105)
  $slots.Add(@{ Kind = "store"; Rect = [System.Drawing.RectangleF]::new($Width * 0.22, $Height * 0.075, $storeWidth, $storeHeight) })
  $slots.Add(@{ Kind = "store"; Rect = [System.Drawing.RectangleF]::new($Width * 0.22, $Height * 0.82, $storeWidth, $storeHeight) })

  foreach ($cx in @(($Width * 0.35), ($Width * 0.65))) {
    for ($i = 0; $i -lt 6; $i++) {
      $cy = $Height * (0.265 + $i * 0.085)
      $r = [Math]::Min($Width, $Height) * 0.085
      $slots.Add(@{ Kind = "pit"; Rect = [System.Drawing.RectangleF]::new($cx - $r, $cy - $r, $r * 2, $r * 2) })
    }
  }

  return $slots
}

function New-BoardBase([int]$Width, [int]$Height, [string]$Layout) {
  $ctx = New-Bitmap $Width $Height $true
  $g = $ctx.Graphics
  $outer = [System.Drawing.RectangleF]::new($Width * 0.055, $Height * 0.08, $Width * 0.89, $Height * 0.84)
  $radius = [Math]::Min($Width, $Height) * 0.11
  $path = New-RoundedPath $outer $radius

  $baseBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $outer,
    (New-Color 250 8 10 12),
    (New-Color 250 28 31 33),
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
  )
  $g.FillPath($baseBrush, $path)
  $baseBrush.Dispose()

  $crystalSheen = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.RectangleF]::new($outer.X, $outer.Y, $outer.Width, $outer.Height * 0.58),
    (New-Color 72 70 82 74),
    (New-Color 0 70 82 74),
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
  )
  $g.FillPath($crystalSheen, $path)
  $crystalSheen.Dispose()

  for ($i = 0; $i -lt 8; $i++) {
    $inset = $i * 8
    $rect = [System.Drawing.RectangleF]::new($outer.X + $inset, $outer.Y + $inset, $outer.Width - $inset * 2, $outer.Height - $inset * 2)
    $pen = New-PenColor ([Math]::Max(28, 136 - $i * 12)) 116 90 56 2
    $g.DrawPath($pen, (New-RoundedPath $rect ([Math]::Max(16, $radius - $inset * 0.7))))
    $pen.Dispose()
  }

  Add-GoldVeins $g $Width $Height 24 54

  $slots = if ($Layout -eq "landscape") { Get-LandscapeSlots $Width $Height } else { Get-PortraitSlots $Width $Height }
  foreach ($slot in $slots) {
    $wellBrush = New-BrushColor 240 5 6 8
    $rimPen = New-PenColor 178 160 124 72 ([Math]::Max(4, $Width / 420))
    $innerPen = New-PenColor 76 98 106 110 ([Math]::Max(2, $Width / 760))
    $g.FillEllipse($wellBrush, $slot.Rect)
    $g.DrawEllipse($rimPen, $slot.Rect)
    $inner = [System.Drawing.RectangleF]::new($slot.Rect.X + $slot.Rect.Width * 0.14, $slot.Rect.Y + $slot.Rect.Height * 0.14, $slot.Rect.Width * 0.72, $slot.Rect.Height * 0.72)
    $g.DrawEllipse($innerPen, $inner)
    $wellBrush.Dispose()
    $rimPen.Dispose()
    $innerPen.Dispose()
  }

  $path.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-BoardRim([int]$Width, [int]$Height, [string]$Layout) {
  $ctx = New-Bitmap $Width $Height $true
  $g = $ctx.Graphics
  $outer = [System.Drawing.RectangleF]::new($Width * 0.055, $Height * 0.08, $Width * 0.89, $Height * 0.84)
  $inner = [System.Drawing.RectangleF]::new($Width * 0.105, $Height * 0.15, $Width * 0.79, $Height * 0.7)
  $radiusOuter = [Math]::Min($Width, $Height) * 0.11
  $radiusInner = [Math]::Min($Width, $Height) * 0.075
  $shadowPen = New-PenColor 118 54 41 24 ([Math]::Max(10, $Width / 150))
  $goldPen = New-PenColor 230 224 189 124 ([Math]::Max(5, $Width / 230))
  $innerPen = New-PenColor 170 164 130 84 ([Math]::Max(2, $Width / 410))
  $g.DrawPath($shadowPen, (New-RoundedPath $outer $radiusOuter))
  $g.DrawPath($goldPen, (New-RoundedPath $outer $radiusOuter))
  $g.DrawPath($innerPen, (New-RoundedPath $inner $radiusInner))

  $slots = if ($Layout -eq "landscape") { Get-LandscapeSlots $Width $Height } else { Get-PortraitSlots $Width $Height }
  foreach ($slot in $slots) {
    $pen = New-PenColor 168 214 178 112 ([Math]::Max(3, $Width / 360))
    $g.DrawEllipse($pen, $slot.Rect)
    $pen.Dispose()
  }

  Add-GoldVeins $g $Width $Height 16 74
  $shadowPen.Dispose()
  $goldPen.Dispose()
  $innerPen.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-BoardShadow([int]$Width, [int]$Height) {
  $ctx = New-Bitmap $Width $Height $true
  $g = $ctx.Graphics
  $rect = [System.Drawing.RectangleF]::new($Width * 0.075, $Height * 0.12, $Width * 0.85, $Height * 0.82)
  $brush = New-BrushColor 118 0 0 0
  $g.FillPath($brush, (New-RoundedPath $rect ([Math]::Min($Width, $Height) * 0.12)))
  $brush.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-SlotMask([int]$Width, [int]$Height, [string]$Layout) {
  $ctx = New-Bitmap $Width $Height $true
  $g = $ctx.Graphics
  $brush = New-BrushColor 255 255 255 255
  $slots = if ($Layout -eq "landscape") { Get-LandscapeSlots $Width $Height } else { Get-PortraitSlots $Width $Height }
  foreach ($slot in $slots) {
    $g.FillEllipse($brush, $slot.Rect)
  }
  $brush.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-Material([int]$Width, [int]$Height, [string]$Type) {
  $ctx = New-Bitmap $Width $Height $false
  $g = $ctx.Graphics
  if ($Type -eq "normal") {
    $g.Clear((New-Color 255 128 128 245))
    $pen = New-PenColor 100 158 158 255 4
    for ($i = 0; $i -lt 12; $i++) {
      $inset = $i * [Math]::Min($Width, $Height) / 28
      $g.DrawEllipse($pen, $inset, $inset, $Width - $inset * 2, $Height - $inset * 2)
    }
    $pen.Dispose()
  } elseif ($Type -eq "roughness") {
    $g.Clear((New-Color 255 132 132 132))
    for ($i = 0; $i -lt 160; $i++) {
      $shade = $script:Random.Next(86, 192)
      $brush = New-BrushColor 68 $shade $shade $shade
      $x = $script:Random.Next(0, $Width)
      $y = $script:Random.Next(0, $Height)
      $g.FillEllipse($brush, $x, $y, $script:Random.Next(12, 80), $script:Random.Next(12, 80))
      $brush.Dispose()
    }
  } else {
    $rect = [System.Drawing.RectangleF]::new(0, 0, $Width, $Height)
    $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, (New-Color 255 10 12 14), (New-Color 255 28 30 31), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()
    $centerBrush = New-BrushColor 128 3 3 4
    $g.FillEllipse($centerBrush, $Width * 0.16, $Height * 0.18, $Width * 0.68, $Height * 0.64)
    $centerBrush.Dispose()
    $sheen = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
      [System.Drawing.RectangleF]::new($Width * 0.1, $Height * 0.08, $Width * 0.8, $Height * 0.42),
      (New-Color 54 88 100 94),
      (New-Color 0 88 100 94),
      [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
    )
    $g.FillEllipse($sheen, $Width * 0.1, $Height * 0.08, $Width * 0.8, $Height * 0.42)
    $sheen.Dispose()
    $rimPen = New-PenColor 155 182 145 86 ([Math]::Max(3, $Width / 120))
    $g.DrawEllipse($rimPen, $Width * 0.08, $Height * 0.08, $Width * 0.84, $Height * 0.84)
    $rimPen.Dispose()
    Add-GoldVeins $g $Width $Height 8 36
  }
  $g.Dispose()
  return $ctx.Bitmap
}

function New-UiPanel([int]$Width, [int]$Height, [string]$Kind) {
  $ctx = New-Bitmap $Width $Height $true
  $g = $ctx.Graphics
  $rect = [System.Drawing.RectangleF]::new($Width * 0.045, $Height * 0.12, $Width * 0.91, $Height * 0.76)
  $radius = [Math]::Max(18, [Math]::Min($Width, $Height) * 0.16)
  $baseColor = if ($Kind -like "*primary*") { @(232, 206, 176) } elseif ($Kind -like "*secondary*") { @(214, 195, 166) } else { @(224, 205, 174) }
  $path = New-RoundedPath $rect $radius

  $fill = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $rect,
    (New-Color 238 $baseColor[0] $baseColor[1] $baseColor[2]),
    (New-Color 238 ($baseColor[0] - 26) ($baseColor[1] - 24) ($baseColor[2] - 24)),
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
  )
  $g.FillPath($fill, $path)
  $fill.Dispose()

  $wash = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.RectangleF]::new($rect.X, $rect.Y, $rect.Width, $rect.Height * 0.5),
    (New-Color 62 255 247 226),
    (New-Color 0 255 247 226),
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
  )
  $g.FillPath($wash, $path)
  $wash.Dispose()

  Add-PaperFibers $g $Width $Height ([Math]::Max(24, [int](($Width + $Height) / 18)))

  $goldPen = New-PenColor 185 138 107 64 ([Math]::Max(3, $Width / 180))
  $innerPen = New-PenColor 98 92 70 46 ([Math]::Max(1.5, $Width / 420))
  $g.DrawPath($goldPen, $path)
  $inner = [System.Drawing.RectangleF]::new($rect.X + $rect.Width * 0.06, $rect.Y + $rect.Height * 0.1, $rect.Width * 0.88, $rect.Height * 0.8)
  $g.DrawPath($innerPen, (New-RoundedPath $inner ([Math]::Max(12, $radius * 0.5))))
  Add-GoldVeins $g $Width $Height 4 28
  $goldPen.Dispose()
  $innerPen.Dispose()
  $path.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-IconFrame([int]$Size) {
  $ctx = New-Bitmap $Size $Size $true
  $g = $ctx.Graphics
  $fill = New-BrushColor 228 12 14 16
  $gold = New-PenColor 220 224 189 124 8
  $inner = New-PenColor 120 110 88 60 4
  $g.FillEllipse($fill, 24, 24, $Size - 48, $Size - 48)
  $g.DrawEllipse($gold, 24, 24, $Size - 48, $Size - 48)
  $g.DrawEllipse($inner, 50, 50, $Size - 100, $Size - 100)
  Add-GoldVeins $g $Size $Size 6 40
  $fill.Dispose()
  $gold.Dispose()
  $inner.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-TurnBadge([int]$Size) {
  $ctx = New-Bitmap $Size $Size $true
  $g = $ctx.Graphics
  $points = @(
    [System.Drawing.PointF]::new($Size / 2, 22),
    [System.Drawing.PointF]::new($Size - 58, $Size / 2),
    [System.Drawing.PointF]::new($Size / 2, $Size - 22),
    [System.Drawing.PointF]::new(58, $Size / 2)
  )
  $fill = New-BrushColor 232 16 18 20
  $gold = New-PenColor 220 224 189 124 7
  $g.FillPolygon($fill, $points)
  $g.DrawPolygon($gold, $points)
  Add-GoldVeins $g $Size $Size 6 34
  $fill.Dispose()
  $gold.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-Background([int]$Width, [int]$Height, [string]$Layout) {
  $ctx = New-Bitmap $Width $Height $false
  $g = $ctx.Graphics
  $rect = [System.Drawing.RectangleF]::new(0, 0, $Width, $Height)
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, (New-Color 255 6 8 10), (New-Color 255 17 19 21), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
  $g.FillRectangle($brush, $rect)
  $brush.Dispose()

  for ($i = 0; $i -lt 5; $i++) {
    $x = $script:Random.Next([int]($Width * 0.08), [int]($Width * 0.92))
    $y = $script:Random.Next([int]($Height * 0.08), [int]($Height * 0.92))
    $r = $script:Random.Next([int]([Math]::Min($Width, $Height) * 0.12), [int]([Math]::Min($Width, $Height) * 0.28))
    $blob = New-BrushColor 14 104 90 62
    $g.FillEllipse($blob, $x - $r, $y - $r, $r * 2, $r * 2)
    $blob.Dispose()
  }

  Add-GoldVeins $g $Width $Height 46 24
  $g.Dispose()
  return $ctx.Bitmap
}

function New-Particle([string]$Kind) {
  $ctx = New-Bitmap 128 128 $true
  $g = $ctx.Graphics
  if ($Kind -eq "ruby") { $color = @(220, 45, 72) }
  elseif ($Kind -eq "amethyst") { $color = @(150, 88, 235) }
  else { $color = @(245, 190, 70) }
  $glow = New-BrushColor 85 $color[0] $color[1] $color[2]
  $main = New-BrushColor 225 $color[0] $color[1] $color[2]
  $line = New-PenColor 150 255 235 190 2
  $g.FillEllipse($glow, 22, 22, 84, 84)
  $points = @(
    [System.Drawing.PointF]::new(64, 14),
    [System.Drawing.PointF]::new(78, 52),
    [System.Drawing.PointF]::new(114, 64),
    [System.Drawing.PointF]::new(78, 78),
    [System.Drawing.PointF]::new(64, 114),
    [System.Drawing.PointF]::new(50, 78),
    [System.Drawing.PointF]::new(14, 64),
    [System.Drawing.PointF]::new(50, 52)
  )
  $g.FillPolygon($main, $points)
  $g.DrawPolygon($line, $points)
  $g.DrawLine($line, 64, 14, 64, 114)
  $g.DrawLine($line, 14, 64, 114, 64)
  $glow.Dispose()
  $main.Dispose()
  $line.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function Add-Asset([string]$AssetId, [string]$FileName, [int]$Width, [int]$Height, [bool]$Alpha, [string]$Role, [scriptblock]$Maker) {
  $bitmap = & $Maker $Width $Height
  Save-Asset $bitmap $AssetId $FileName $Role $Alpha
  $bitmap.Dispose()
}

Add-Asset "board.landscape.base" "board-landscape-base.png" 2048 1024 $true "board-base" { param($w,$h) New-BoardBase $w $h "landscape" }
Add-Asset "board.landscape.rim" "board-landscape-rim-overlay.png" 2048 1024 $true "board-rim-overlay" { param($w,$h) New-BoardRim $w $h "landscape" }
Add-Asset "board.landscape.shadow" "board-landscape-shadow.png" 2048 1024 $true "board-shadow" { param($w,$h) New-BoardShadow $w $h }
Add-Asset "board.landscape.slot-mask" "board-landscape-slot-mask.png" 2048 1024 $true "board-slot-mask" { param($w,$h) New-SlotMask $w $h "landscape" }
Add-Asset "board.portrait.base" "board-portrait-base.png" 1536 2048 $true "board-base" { param($w,$h) New-BoardBase $w $h "portrait" }
Add-Asset "board.portrait.rim" "board-portrait-rim-overlay.png" 1536 2048 $true "board-rim-overlay" { param($w,$h) New-BoardRim $w $h "portrait" }
Add-Asset "board.portrait.shadow" "board-portrait-shadow.png" 1536 2048 $true "board-shadow" { param($w,$h) New-BoardShadow $w $h }
Add-Asset "board.portrait.slot-mask" "board-portrait-slot-mask.png" 1536 2048 $true "board-slot-mask" { param($w,$h) New-SlotMask $w $h "portrait" }

Add-Asset "pit.albedo" "pit-well-albedo.png" 512 512 $false "pit-material" { param($w,$h) New-Material $w $h "albedo" }
Add-Asset "pit.normal" "pit-well-normal.png" 512 512 $false "pit-material-normal" { param($w,$h) New-Material $w $h "normal" }
Add-Asset "pit.roughness" "pit-well-roughness.png" 512 512 $false "pit-material-roughness" { param($w,$h) New-Material $w $h "roughness" }
Add-Asset "store.landscape.albedo" "store-well-landscape-albedo.png" 512 1024 $false "store-material" { param($w,$h) New-Material $w $h "albedo" }
Add-Asset "store.portrait.albedo" "store-well-portrait-albedo.png" 512 768 $false "store-material" { param($w,$h) New-Material $w $h "albedo" }
Add-Asset "store.normal" "store-well-normal.png" 512 1024 $false "store-material-normal" { param($w,$h) New-Material $w $h "normal" }
Add-Asset "store.roughness" "store-well-roughness.png" 512 1024 $false "store-material-roughness" { param($w,$h) New-Material $w $h "roughness" }

Add-Asset "ui.score.panel" "ui-score-panel-9slice.png" 1024 256 $true "ui-score-panel" { param($w,$h) New-UiPanel $w $h "score" }
Add-Asset "ui.dialogue.panel" "ui-dialogue-panel-9slice.png" 1536 320 $true "ui-dialogue-panel" { param($w,$h) New-UiPanel $w $h "dialogue" }
Add-Asset "ui.modal.panel" "ui-modal-panel-9slice.png" 1400 1200 $true "ui-modal-panel" { param($w,$h) New-UiPanel $w $h "modal" }
Add-Asset "ui.result.panel" "ui-result-panel-9slice.png" 1024 1024 $true "ui-result-panel" { param($w,$h) New-UiPanel $w $h "result" }
Add-Asset "ui.button.primary" "ui-button-primary-9slice.png" 768 224 $true "ui-button-primary" { param($w,$h) New-UiPanel $w $h "button-primary" }
Add-Asset "ui.button.secondary" "ui-button-secondary-9slice.png" 768 224 $true "ui-button-secondary" { param($w,$h) New-UiPanel $w $h "button-secondary" }
Add-Asset "ui.icon.frame" "ui-icon-frame.png" 256 256 $true "ui-icon-frame" { param($w,$h) New-IconFrame $w }
Add-Asset "ui.turn.badge" "ui-turn-badge.png" 384 384 $true "ui-turn-badge" { param($w,$h) New-TurnBadge $w }

Add-Asset "background.landscape.idle" "background-landscape-idle.png" 2560 1440 $false "background" { param($w,$h) New-Background $w $h "landscape" }
Add-Asset "background.portrait.idle" "background-portrait-idle.png" 1440 2560 $false "background" { param($w,$h) New-Background $w $h "portrait" }

foreach ($kind in @("ruby", "amethyst", "gold")) {
  for ($i = 1; $i -le 5; $i++) {
    $id = "particle.$kind.$($i.ToString('00'))"
    $file = "particle-$kind-$($i.ToString('00')).png"
    Add-Asset $id $file 128 128 $true "particle" { param($w,$h) New-Particle $kind }
  }
}

$manifest = [ordered]@{
  schemaVersion = 1
  id = "crystal-childhood-visual"
  displayName = "Crystal Childhood Visual"
  assetVersion = $AssetVersion
  engineCompatibility = "^1.0.0"
  baseUrl = "./assets/"
  compliance = [ordered]@{
    source = "original-or-procedural-generated"
    commercialUseIntended = $true
    commercialUse = $true
    thirdPartySourceAssets = $false
    attributionRequired = $false
    licenseNote = "Original generated visual assets for Kalah Childhood Memories. Keep source notes and hashes with redistributed files."
  }
  layouts = [ordered]@{
    landscape = [ordered]@{ canvas = @(2048, 1024); physicalModel = "kalah-6x6-landscape" }
    portrait = [ordered]@{ canvas = @(1536, 2048); physicalModel = "kalah-6x6-portrait" }
  }
  assets = $script:Assets
  nineSlice = [ordered]@{
    "ui.score.panel" = [ordered]@{ left = 96; right = 96; top = 72; bottom = 72 }
    "ui.dialogue.panel" = [ordered]@{ left = 128; right = 128; top = 88; bottom = 88 }
    "ui.modal.panel" = [ordered]@{ left = 128; right = 128; top = 128; bottom = 128 }
    "ui.result.panel" = [ordered]@{ left = 120; right = 120; top = 120; bottom = 120 }
    "ui.button.primary" = [ordered]@{ left = 96; right = 96; top = 72; bottom = 72 }
    "ui.button.secondary" = [ordered]@{ left = 96; right = 96; top = 72; bottom = 72 }
  }
  notes = [ordered]@{
    artPass = "obsidian-and-kraft revision pass for current playable build; preserve ids and dimensions for future art replacement"
    backgroundFormatNote = "PNG is used instead of WebP because the local PowerShell/.NET generator has no WebP encoder."
  }
}

$manifestPath = Join-Path $PackRoot "manifest.json"
$manifest | ConvertTo-Json -Depth 8 | Set-Content -Path $manifestPath -Encoding UTF8
$manifestHash = (Get-FileHash -Path $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
$script:ChecksumLines.Add("$manifestHash  manifest.json")
$script:ChecksumLines | Set-Content -Path (Join-Path $PackRoot "checksums.sha256") -Encoding UTF8

@"
# Crystal Childhood Visual Pack

Generated revised playable visual pack for Kalah Childhood Memories.

This pass aligns the board toward obsidian / black crystal with restrained gold
veins and shifts text-bearing UI surfaces toward light khaki kraft-paper cards.
Final artwork can still replace these files while preserving asset ids,
filenames, dimensions, and manifest structure.
"@ | Set-Content -Path (Join-Path $PackRoot "README.md") -Encoding UTF8

@"
# Visual License Notes

Pack id: crystal-childhood-visual

All generated files in this first-round pack are original procedural placeholders
created for the Kalah Childhood Memories project.

- Third-party source images: none.
- Text, numbers, logos, watermarks, baked stones: intentionally excluded.
- Commercial use intended: true.
- Attribution required: false.

Replace procedural placeholders with final department-approved artwork when ready.
"@ | Set-Content -Path (Join-Path $PackRoot "VISUAL_LICENSE.md") -Encoding UTF8

@"
# Source Notes

Source method: original procedural generation via PowerShell and System.Drawing.
Generated asset date: 2026-06-19.
Theme: black crystal / ink jade board body, restrained gold veins, quiet dark
background, khaki kraft-paper text panels.
"@ | Set-Content -Path (Join-Path $PackRoot "SOURCE_NOTES.md") -Encoding UTF8

Write-Host "Generated visual pack at $PackRoot"
Write-Host "Assets generated: $($script:Assets.Count)"
