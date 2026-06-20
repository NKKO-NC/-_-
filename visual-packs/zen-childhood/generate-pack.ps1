Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$PackRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$AssetRoot = Join-Path $PackRoot "assets"
$AssetVersion = "20260621-visual-b"
$ZenVisualDisplayName = -join @([char]0x79aa, [char]0x98a8, [char]0x8996, [char]0x89ba)
$SampleSeed = 20260621
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
    $graphics.Clear([System.Drawing.Color]::FromArgb(244, 239, 228))
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
    source = "original-generated"
    license = "project-owned-generated-commercial-use-ok"
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

function Add-RakedSandLines(
  [System.Drawing.Graphics]$Graphics,
  [float]$X,
  [float]$Y,
  [float]$Width,
  [float]$Height,
  [int]$Count,
  [int]$Alpha = 34
) {
  for ($i = 0; $i -lt $Count; $i++) {
    $offset = ($i / [Math]::Max(1, $Count - 1)) * $Height
    $pen = New-PenColor ([Math]::Max(12, $Alpha - ($i % 3) * 4)) 125 108 76 ([Math]::Max(1.2, $Width / 1600))
    $Graphics.DrawArc($pen, $X, $Y + $offset, $Width, $Height * 0.34, 184, 172)
    $pen.Dispose()
  }
}

function Add-ZenGardenStone(
  [System.Drawing.Graphics]$Graphics,
  [float]$CenterX,
  [float]$CenterY,
  [float]$Radius,
  [int]$Alpha = 210
) {
  for ($i = 0; $i -lt 8; $i++) {
    $inset = $Radius * (0.86 + $i * 0.34)
    $pen = New-PenColor ([Math]::Max(12, 42 - $i * 4)) 128 116 89 ([Math]::Max(1.4, $Radius / 22))
    $Graphics.DrawEllipse($pen, $CenterX - $inset, $CenterY - $inset * 0.64, $inset * 2, $inset * 1.28)
    $pen.Dispose()
  }

  $stoneRect = [System.Drawing.RectangleF]::new($CenterX - $Radius, $CenterY - $Radius * 0.7, $Radius * 2, $Radius * 1.4)
  $stone = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $stoneRect,
    (New-Color $Alpha 175 166 142),
    (New-Color $Alpha 82 81 72),
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
  )
  $Graphics.FillEllipse($stone, $stoneRect)
  $stone.Dispose()

  $rim = New-PenColor ([Math]::Min(230, $Alpha + 24)) 78 72 58 ([Math]::Max(1.5, $Radius / 18))
  $shine = New-PenColor ([Math]::Max(36, $Alpha - 86)) 246 238 210 ([Math]::Max(1, $Radius / 30))
  $Graphics.DrawEllipse($rim, $stoneRect)
  $Graphics.DrawArc($shine, $stoneRect.X + $Radius * 0.18, $stoneRect.Y + $Radius * 0.12, $stoneRect.Width * 0.58, $stoneRect.Height * 0.42, 200, 100)
  $rim.Dispose()
  $shine.Dispose()
}

function Add-BambooLeaves(
  [System.Drawing.Graphics]$Graphics,
  [float]$X,
  [float]$Y,
  [float]$Scale,
  [int]$Alpha = 62
) {
  $stem = New-PenColor ([Math]::Max(18, $Alpha)) 86 122 73 ([Math]::Max(1.2, $Scale * 2.2))
  $Graphics.DrawBezier($stem, $X, $Y, $X + $Scale * 12, $Y + $Scale * 34, $X - $Scale * 8, $Y + $Scale * 74, $X + $Scale * 18, $Y + $Scale * 112)
  $stem.Dispose()

  for ($i = 0; $i -lt 7; $i++) {
    $side = if ($i % 2 -eq 0) { 1 } else { -1 }
    $leafX = $X + $side * $Scale * (9 + $script:Random.Next(0, 6))
    $leafY = $Y + $Scale * (14 + $i * 14)
    $leaf = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $leaf.AddBezier(
      $leafX,
      $leafY,
      $leafX + $side * $Scale * 34,
      $leafY - $Scale * 7,
      $leafX + $side * $Scale * 48,
      $leafY + $Scale * 8,
      $leafX + $side * $Scale * 58,
      $leafY + $Scale * 14
    )
    $leaf.AddBezier(
      $leafX + $side * $Scale * 58,
      $leafY + $Scale * 14,
      $leafX + $side * $Scale * 38,
      $leafY + $Scale * 18,
      $leafX + $side * $Scale * 15,
      $leafY + $Scale * 12,
      $leafX,
      $leafY
    )
    $leaf.CloseFigure()
    $brush = New-BrushColor ([Math]::Max(14, $Alpha - 14)) 86 122 73
    $Graphics.FillPath($brush, $leaf)
    $brush.Dispose()
    $leaf.Dispose()
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
    (New-Color 250 214 196 158),
    (New-Color 250 184 154 104),
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
  )
  $g.FillPath($baseBrush, $path)
  $baseBrush.Dispose()

  $crystalSheen = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.RectangleF]::new($outer.X, $outer.Y, $outer.Width, $outer.Height * 0.58),
    (New-Color 92 255 245 218),
    (New-Color 0 255 245 218),
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
  )
  $g.FillPath($crystalSheen, $path)
  $crystalSheen.Dispose()

  for ($i = 0; $i -lt 8; $i++) {
    $inset = $i * 8
    $rect = [System.Drawing.RectangleF]::new($outer.X + $inset, $outer.Y + $inset, $outer.Width - $inset * 2, $outer.Height - $inset * 2)
    $pen = New-PenColor ([Math]::Max(28, 136 - $i * 12)) 138 111 72 2
    $g.DrawPath($pen, (New-RoundedPath $rect ([Math]::Max(16, $radius - $inset * 0.7))))
    $pen.Dispose()
  }

  $g.SetClip($path)
  Add-GoldVeins $g $Width $Height 24 54
  $g.ResetClip()

  $slots = if ($Layout -eq "landscape") { Get-LandscapeSlots $Width $Height } else { Get-PortraitSlots $Width $Height }
  foreach ($slot in $slots) {
    $wellBrush = New-BrushColor 240 96 93 84
    $rimPen = New-PenColor 178 138 111 72 ([Math]::Max(4, $Width / 420))
    $innerPen = New-PenColor 86 238 228 202 ([Math]::Max(2, $Width / 760))
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
  $shadowPen = New-PenColor 96 98 75 42 ([Math]::Max(10, $Width / 150))
  $goldPen = New-PenColor 230 199 164 90 ([Math]::Max(5, $Width / 230))
  $innerPen = New-PenColor 170 138 111 72 ([Math]::Max(2, $Width / 410))
  $g.DrawPath($shadowPen, (New-RoundedPath $outer $radiusOuter))
  $g.DrawPath($goldPen, (New-RoundedPath $outer $radiusOuter))
  $g.DrawPath($innerPen, (New-RoundedPath $inner $radiusInner))

  $slots = if ($Layout -eq "landscape") { Get-LandscapeSlots $Width $Height } else { Get-PortraitSlots $Width $Height }
  foreach ($slot in $slots) {
    $pen = New-PenColor 168 242 224 185 ([Math]::Max(3, $Width / 360))
    $g.DrawEllipse($pen, $slot.Rect)
    $pen.Dispose()
  }

  $rimClip = New-RoundedPath $outer $radiusOuter
  $g.SetClip($rimClip)
  Add-GoldVeins $g $Width $Height 16 74
  $g.ResetClip()
  $rimClip.Dispose()
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
    $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, (New-Color 255 172 166 150), (New-Color 255 96 93 84), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()
    $centerBrush = New-BrushColor 138 58 55 50
    $g.FillEllipse($centerBrush, $Width * 0.16, $Height * 0.18, $Width * 0.68, $Height * 0.64)
    $centerBrush.Dispose()
    $sheen = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
      [System.Drawing.RectangleF]::new($Width * 0.1, $Height * 0.08, $Width * 0.8, $Height * 0.42),
      (New-Color 68 236 226 204),
      (New-Color 0 236 226 204),
      [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
    )
    $g.FillEllipse($sheen, $Width * 0.1, $Height * 0.08, $Width * 0.8, $Height * 0.42)
    $sheen.Dispose()
    $rimPen = New-PenColor 155 138 111 72 ([Math]::Max(3, $Width / 120))
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

  $g.SetClip($path)
  Add-PaperFibers $g $Width $Height ([Math]::Max(24, [int](($Width + $Height) / 18)))
  $g.ResetClip()

  $goldPen = New-PenColor 185 138 107 64 ([Math]::Max(3, $Width / 180))
  $innerPen = New-PenColor 98 92 70 46 ([Math]::Max(1.5, $Width / 420))
  $g.DrawPath($goldPen, $path)
  $inner = [System.Drawing.RectangleF]::new($rect.X + $rect.Width * 0.06, $rect.Y + $rect.Height * 0.1, $rect.Width * 0.88, $rect.Height * 0.8)
  $g.DrawPath($innerPen, (New-RoundedPath $inner ([Math]::Max(12, $radius * 0.5))))
  $g.SetClip($path)
  Add-GoldVeins $g $Width $Height 4 28
  $g.ResetClip()
  $goldPen.Dispose()
  $innerPen.Dispose()
  $path.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-IconFrame([int]$Size) {
  $ctx = New-Bitmap $Size $Size $true
  $g = $ctx.Graphics
  $fill = New-BrushColor 228 247 241 223
  $gold = New-PenColor 220 199 164 90 8
  $inner = New-PenColor 120 138 111 72 4
  $g.FillEllipse($fill, 24, 24, $Size - 48, $Size - 48)
  $g.DrawEllipse($gold, 24, 24, $Size - 48, $Size - 48)
  $g.DrawEllipse($inner, 50, 50, $Size - 100, $Size - 100)
  $clip = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $clip.AddEllipse(24, 24, $Size - 48, $Size - 48)
  $g.SetClip($clip)
  Add-GoldVeins $g $Size $Size 6 40
  $g.ResetClip()
  $clip.Dispose()
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
  $fill = New-BrushColor 232 214 196 158
  $gold = New-PenColor 220 199 164 90 7
  $g.FillPolygon($fill, $points)
  $g.DrawPolygon($gold, $points)
  $clip = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $clip.AddPolygon($points)
  $g.SetClip($clip)
  Add-GoldVeins $g $Size $Size 6 34
  $g.ResetClip()
  $clip.Dispose()
  $fill.Dispose()
  $gold.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-HintRing([int]$Size, [string]$Kind) {
  $ctx = New-Bitmap $Size $Size $true
  $g = $ctx.Graphics
  if ($Kind -eq "red") { $color = @(183, 71, 42) }
  elseif ($Kind -eq "purple") { $color = @(49, 74, 115) }
  else { $color = @(199, 164, 90) }

  for ($i = 0; $i -lt 10; $i++) {
    $inset = 38 + $i * 4
    $alpha = [Math]::Max(8, 72 - $i * 6)
    $pen = New-PenColor $alpha $color[0] $color[1] $color[2] ([Math]::Max(6, 24 - $i))
    $g.DrawEllipse($pen, $inset, $inset, $Size - $inset * 2, $Size - $inset * 2)
    $pen.Dispose()
  }

  $main = New-PenColor 220 $color[0] $color[1] $color[2] 14
  $shine = New-PenColor 128 255 245 218 3
  $g.DrawEllipse($main, 76, 76, $Size - 152, $Size - 152)
  $g.DrawArc($shine, 84, 84, $Size - 168, $Size - 168, 205, 80)
  $main.Dispose()
  $shine.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-Background([int]$Width, [int]$Height, [string]$Layout) {
  $ctx = New-Bitmap $Width $Height $false
  $g = $ctx.Graphics
  $rect = [System.Drawing.RectangleF]::new(0, 0, $Width, $Height)
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, (New-Color 255 239 232 214), (New-Color 255 211 197 166), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
  $g.FillRectangle($brush, $rect)
  $brush.Dispose()

  Add-PaperFibers $g $Width $Height ([Math]::Max(90, [int](($Width + $Height) / 18)))

  $gardenWidth = if ($Layout -eq "portrait") { $Width * 1.16 } else { $Width * 0.82 }
  $gardenHeight = if ($Layout -eq "portrait") { $Height * 0.36 } else { $Height * 0.34 }
  $gardenX = if ($Layout -eq "portrait") { -$Width * 0.08 } else { $Width * 0.14 }
  $gardenY = if ($Layout -eq "portrait") { $Height * 0.42 } else { $Height * 0.39 }
  $sandPanel = [System.Drawing.RectangleF]::new($gardenX, $gardenY, $gardenWidth, $gardenHeight)
  $sandWash = New-BrushColor 42 248 241 221
  $g.FillRectangle($sandWash, $sandPanel)
  $sandWash.Dispose()
  Add-RakedSandLines $g $gardenX $gardenY $gardenWidth $gardenHeight 30 42

  if ($Layout -eq "portrait") {
    Add-ZenGardenStone $g ($Width * 0.72) ($Height * 0.2) ($Width * 0.07) 186
    Add-ZenGardenStone $g ($Width * 0.82) ($Height * 0.22) ($Width * 0.045) 172
    Add-RakedSandLines $g ($Width * 0.44) ($Height * 0.1) ($Width * 0.76) ($Height * 0.18) 16 35
    Add-BambooLeaves $g ($Width * 0.08) ($Height * 0.04) ([Math]::Max(1.8, $Width / 760)) 46
  } else {
    Add-ZenGardenStone $g ($Width * 0.84) ($Height * 0.2) ($Height * 0.055) 190
    Add-ZenGardenStone $g ($Width * 0.89) ($Height * 0.22) ($Height * 0.034) 172
    Add-ZenGardenStone $g ($Width * 0.78) ($Height * 0.24) ($Height * 0.03) 158
    Add-RakedSandLines $g ($Width * 0.66) ($Height * 0.07) ($Width * 0.3) ($Height * 0.18) 18 38
    Add-BambooLeaves $g ($Width * 0.02) ($Height * 0.02) ([Math]::Max(1.4, $Height / 620)) 50
  }

  for ($i = 0; $i -lt 16; $i++) {
    $x1 = $script:Random.Next([int]($Width * 0.04), [int]($Width * 0.96))
    $y1 = $script:Random.Next([int]($Height * 0.08), [int]($Height * 0.94))
    $x2 = $x1 + $script:Random.Next([int](-$Width * 0.055), [int]($Width * 0.055))
    $y2 = $y1 + $script:Random.Next([int](-$Height * 0.055), [int]($Height * 0.055))
    $pen = New-PenColor 20 145 118 75 ([Math]::Max(1, $Width / 1900))
    $g.DrawLine($pen, $x1, $y1, $x2, $y2)
    $pen.Dispose()
  }

  $g.Dispose()
  return $ctx.Bitmap
}

function New-Particle([string]$Kind) {
  $ctx = New-Bitmap 128 128 $true
  $g = $ctx.Graphics
  if ($Kind -eq "ruby") { $color = @(183, 71, 42) }
  elseif ($Kind -eq "amethyst") { $color = @(49, 74, 115) }
  else { $color = @(199, 164, 90) }
  $cx = 64 + $script:Random.Next(-5, 6)
  $cy = 64 + $script:Random.Next(-5, 6)
  $outer = 48 + $script:Random.Next(-8, 9)
  $inner = 16 + $script:Random.Next(-4, 5)
  $glow = New-BrushColor 85 $color[0] $color[1] $color[2]
  $main = New-BrushColor 225 $color[0] $color[1] $color[2]
  $line = New-PenColor 150 255 235 190 2
  $g.FillEllipse($glow, $cx - 42, $cy - 42, 84, 84)
  $points = @(
    [System.Drawing.PointF]::new($cx, $cy - $outer),
    [System.Drawing.PointF]::new($cx + $inner, $cy - $inner),
    [System.Drawing.PointF]::new($cx + $outer, $cy),
    [System.Drawing.PointF]::new($cx + $inner, $cy + $inner),
    [System.Drawing.PointF]::new($cx, $cy + $outer),
    [System.Drawing.PointF]::new($cx - $inner, $cy + $inner),
    [System.Drawing.PointF]::new($cx - $outer, $cy),
    [System.Drawing.PointF]::new($cx - $inner, $cy - $inner)
  )
  $g.FillPolygon($main, $points)
  $g.DrawPolygon($line, $points)
  $g.DrawLine($line, $cx, $cy - $outer, $cx, $cy + $outer)
  $g.DrawLine($line, $cx - $outer, $cy, $cx + $outer, $cy)
  $glow.Dispose()
  $main.Dispose()
  $line.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function Add-LotusMark(
  [System.Drawing.Graphics]$Graphics,
  [float]$CenterX,
  [float]$CenterY,
  [float]$Scale,
  [System.Drawing.Color]$FillColor,
  [System.Drawing.Color]$LineColor
) {
  $brush = [System.Drawing.SolidBrush]::new($FillColor)
  $pen = [System.Drawing.Pen]::new($LineColor, [Math]::Max(1.2, $Scale * 0.035))
  for ($i = 0; $i -lt 6; $i++) {
    $angle = (-90 + $i * 60) * [Math]::PI / 180
    $tipX = $CenterX + [Math]::Cos($angle) * $Scale * 0.46
    $tipY = $CenterY + [Math]::Sin($angle) * $Scale * 0.46
    $leftX = $CenterX + [Math]::Cos($angle - 0.62) * $Scale * 0.18
    $leftY = $CenterY + [Math]::Sin($angle - 0.62) * $Scale * 0.18
    $rightX = $CenterX + [Math]::Cos($angle + 0.62) * $Scale * 0.18
    $rightY = $CenterY + [Math]::Sin($angle + 0.62) * $Scale * 0.18
    $petal = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $petal.AddBezier($CenterX, $CenterY, $leftX, $leftY, $tipX, $tipY, $tipX, $tipY)
    $petal.AddBezier($tipX, $tipY, $tipX, $tipY, $rightX, $rightY, $CenterX, $CenterY)
    $petal.CloseFigure()
    $Graphics.FillPath($brush, $petal)
    $Graphics.DrawPath($pen, $petal)
    $petal.Dispose()
  }
  $center = New-BrushColor 180 244 224 170
  $Graphics.FillEllipse($center, $CenterX - $Scale * 0.08, $CenterY - $Scale * 0.08, $Scale * 0.16, $Scale * 0.16)
  $center.Dispose()
  $brush.Dispose()
  $pen.Dispose()
}

function Add-WaveMark(
  [System.Drawing.Graphics]$Graphics,
  [float]$CenterX,
  [float]$CenterY,
  [float]$Scale,
  [System.Drawing.Color]$LineColor
) {
  $pen = [System.Drawing.Pen]::new($LineColor, [Math]::Max(2, $Scale * 0.04))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  for ($i = 0; $i -lt 3; $i++) {
    $y = $CenterY + ($i - 1) * $Scale * 0.14
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.AddBezier(
      $CenterX - $Scale * 0.36,
      $y,
      $CenterX - $Scale * 0.15,
      $y - $Scale * 0.2,
      $CenterX + $Scale * 0.08,
      $y + $Scale * 0.2,
      $CenterX + $Scale * 0.36,
      $y - $Scale * 0.02
    )
    $Graphics.DrawPath($pen, $path)
    $path.Dispose()
  }
  $pen.Dispose()
}

function Add-GoldFlecks([System.Drawing.Graphics]$Graphics, [int]$Size, [int]$Count, [int]$Alpha = 120) {
  $brush = New-BrushColor $Alpha 232 204 122
  for ($i = 0; $i -lt $Count; $i++) {
    $x = $script:Random.Next([int]($Size * 0.22), [int]($Size * 0.78))
    $y = $script:Random.Next([int]($Size * 0.22), [int]($Size * 0.78))
    $r = $script:Random.Next([int]([Math]::Max(2, $Size * 0.012)), [int]([Math]::Max(4, $Size * 0.026)))
    $Graphics.FillEllipse($brush, $x, $y, $r, $r)
  }
  $brush.Dispose()
}

function New-ZenStone([int]$Size, [string]$Kind) {
  $ctx = New-Bitmap $Size $Size $true
  $g = $ctx.Graphics
  $shadow = New-BrushColor 70 48 38 24
  $g.FillEllipse($shadow, $Size * 0.16, $Size * 0.2, $Size * 0.7, $Size * 0.68)
  $shadow.Dispose()

  $rect = [System.Drawing.RectangleF]::new($Size * 0.14, $Size * 0.12, $Size * 0.72, $Size * 0.72)
  if ($Kind -eq "vermilion") {
    $top = New-Color 255 185 84 62
    $bottom = New-Color 255 103 47 39
    $mark = New-Color 178 248 221 170
    $line = New-Color 130 106 55 33
  } else {
    $top = New-Color 255 62 91 126
    $bottom = New-Color 255 24 39 62
    $mark = New-Color 170 222 235 218
    $line = New-Color 150 226 214 174
  }
  $fill = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $top, $bottom, [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
  $g.FillEllipse($fill, $rect)
  $fill.Dispose()

  $rim = New-PenColor 220 178 139 70 ([Math]::Max(4, $Size / 38))
  $inner = New-PenColor 76 255 245 211 ([Math]::Max(2, $Size / 92))
  $g.DrawEllipse($rim, $rect)
  $g.DrawEllipse($inner, $Size * 0.23, $Size * 0.21, $Size * 0.54, $Size * 0.5)
  Add-GoldFlecks $g $Size 16 92

  if ($Kind -eq "vermilion") {
    Add-LotusMark $g ($Size / 2) ($Size * 0.49) ($Size * 0.48) $mark $line
  } else {
    Add-WaveMark $g ($Size / 2) ($Size * 0.48) ($Size * 0.66) $mark
  }

  $rim.Dispose()
  $inner.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-ZenSigil([int]$Size, [string]$Kind) {
  $ctx = New-Bitmap $Size $Size $true
  $g = $ctx.Graphics
  $shadow = New-BrushColor 76 44 34 22
  $g.FillEllipse($shadow, $Size * 0.11, $Size * 0.14, $Size * 0.8, $Size * 0.8)
  $shadow.Dispose()

  $rect = [System.Drawing.RectangleF]::new($Size * 0.1, $Size * 0.08, $Size * 0.8, $Size * 0.8)
  if ($Kind -eq "vermilion") {
    $top = New-Color 255 180 72 55
    $bottom = New-Color 255 91 44 37
    $mark = New-Color 188 246 222 174
    $line = New-Color 132 97 49 35
  } else {
    $top = New-Color 255 50 78 113
    $bottom = New-Color 255 18 31 52
    $mark = New-Color 182 224 236 218
    $line = New-Color 134 234 223 182
  }
  $fill = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $top, $bottom, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
  $g.FillEllipse($fill, $rect)
  $fill.Dispose()

  $rim = New-PenColor 230 189 147 78 ([Math]::Max(8, $Size / 40))
  $inner = New-PenColor 118 255 241 195 ([Math]::Max(3, $Size / 118))
  $g.DrawEllipse($rim, $rect)
  $g.DrawEllipse($inner, $Size * 0.2, $Size * 0.18, $Size * 0.6, $Size * 0.58)
  Add-GoldFlecks $g $Size 24 92

  if ($Kind -eq "vermilion") {
    Add-LotusMark $g ($Size / 2) ($Size * 0.47) ($Size * 0.56) $mark $line
  } else {
    Add-WaveMark $g ($Size / 2) ($Size * 0.47) ($Size * 0.72) $mark
  }

  $rim.Dispose()
  $inner.Dispose()
  $g.Dispose()
  return $ctx.Bitmap
}

function New-ZenCoinBody([int]$Size) {
  $ctx = New-Bitmap $Size $Size $true
  $g = $ctx.Graphics
  $circle = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $circle.AddEllipse($Size * 0.07, $Size * 0.07, $Size * 0.86, $Size * 0.86)
  $rect = [System.Drawing.RectangleF]::new($Size * 0.07, $Size * 0.07, $Size * 0.86, $Size * 0.86)
  $fill = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, (New-Color 255 239 223 182), (New-Color 255 151 112 55), [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
  $g.FillPath($fill, $circle)
  $fill.Dispose()
  $g.SetClip($circle)
  Add-RakedSandLines $g (-$Size * 0.16) ($Size * 0.2) ($Size * 1.32) ($Size * 0.48) 17 46
  Add-PaperFibers $g $Size $Size 40
  $g.ResetClip()

  for ($i = 0; $i -lt 4; $i++) {
    $inset = $Size * (0.08 + $i * 0.035)
    $pen = New-PenColor ([Math]::Max(70, 212 - $i * 28)) 108 80 38 ([Math]::Max(4, $Size / (76 + $i * 20)))
    $g.DrawEllipse($pen, $inset, $inset, $Size - $inset * 2, $Size - $inset * 2)
    $pen.Dispose()
  }
  $rim = New-PenColor 245 194 147 74 ([Math]::Max(9, $Size / 44))
  $shine = New-PenColor 116 255 242 196 ([Math]::Max(3, $Size / 180))
  $g.DrawEllipse($rim, $rect)
  $g.DrawArc($shine, $Size * 0.17, $Size * 0.15, $Size * 0.58, $Size * 0.36, 198, 110)
  $rim.Dispose()
  $shine.Dispose()
  $circle.Dispose()
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

Add-Asset "object.stone.vermilion" "object-stone-vermilion.png" 256 256 $true "object-stone" { param($w,$h) New-ZenStone $w "vermilion" }
Add-Asset "object.stone.indigo" "object-stone-indigo.png" 256 256 $true "object-stone" { param($w,$h) New-ZenStone $w "indigo" }
Add-Asset "object.coin.body" "object-coin-body.png" 1024 1024 $true "object-coin" { param($w,$h) New-ZenCoinBody $w }
Add-Asset "object.sigil.vermilion" "object-sigil-vermilion.png" 512 512 $true "object-sigil" { param($w,$h) New-ZenSigil $w "vermilion" }
Add-Asset "object.sigil.indigo" "object-sigil-indigo.png" 512 512 $true "object-sigil" { param($w,$h) New-ZenSigil $w "indigo" }

Add-Asset "hint.ring.red" "hint-ring-red.png" 512 512 $true "hint-ring" { param($w,$h) New-HintRing $w "red" }
Add-Asset "hint.ring.purple" "hint-ring-purple.png" 512 512 $true "hint-ring" { param($w,$h) New-HintRing $w "purple" }
Add-Asset "hint.ring.landing" "hint-ring-landing.png" 512 512 $true "hint-ring" { param($w,$h) New-HintRing $w "landing" }

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
  id = "zen-childhood-visual"
  displayName = $ZenVisualDisplayName
  assetVersion = $AssetVersion
  engineCompatibility = "^1.0.0"
  baseUrl = "./assets/"
  compliance = [ordered]@{
    source = "original-generated"
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
    artPass = "DALL-E concept guided Zen visual pack with hinoki wood, bamboo, river stone, rice paper, aged brass, vermilion, indigo, and jade accents; preserve ids and dimensions for runtime compatibility"
    backgroundFormatNote = "PNG is used instead of WebP because the local PowerShell/.NET generator has no WebP encoder."
  }
}

$manifestPath = Join-Path $PackRoot "manifest.json"
$manifest | ConvertTo-Json -Depth 8 | Set-Content -Path $manifestPath -Encoding UTF8
$manifestHash = (Get-FileHash -Path $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
$script:ChecksumLines.Add("$manifestHash  manifest.json")
$script:ChecksumLines | Set-Content -Path (Join-Path $PackRoot "checksums.sha256") -Encoding UTF8

@"
# Zen Childhood Visual Pack

Generated playable visual pack for Kalah Childhood Memories.

This pass translates the DALL-E Zen concept sheet into runtime-ready PNG assets:
pale hinoki wood board surfaces, bamboo inlay, river-stone wells, raked-sand
backgrounds, rice-paper UI panels, Zen object stones, Zen coin/token faces,
aged brass trim, muted vermilion player-one feedback, deep indigo player-two
feedback, and jade utility accents.

The files preserve asset ids, filenames, dimensions, and manifest structure.
"@ | Set-Content -Path (Join-Path $PackRoot "README.md") -Encoding UTF8

@"
# Visual License Notes

Pack id: zen-childhood-visual

All generated files in this pack are original project-owned generated assets
created for the Kalah Childhood Memories project. The visual direction was
seeded by a native DALL-E concept sheet and converted into runtime-ready PNGs
with local PowerShell/System.Drawing generation.

- Third-party source images: none.
- Text, numbers, logos, watermarks, baked stones: intentionally excluded.
- Commercial use intended: true.
- Attribution required: false.

Replace these generated assets with final department-approved artwork only if a
later art pass requires it.
"@ | Set-Content -Path (Join-Path $PackRoot "VISUAL_LICENSE.md") -Encoding UTF8

@"
# Source Notes

Source method: native DALL-E concept sheet plus original local generation via
PowerShell and System.Drawing.
Generated asset date: 2026-06-21.
Theme: Zen garden childhood memory, pale hinoki wood, bamboo inlay, raked-sand
grooves, river-stone wells, rice-paper panels, aged brass trim, muted vermilion,
deep indigo, and jade utility accents.

DALL-E concept sheet copied to:
docs/zen-childhood-dalle-concept-sheet.png
"@ | Set-Content -Path (Join-Path $PackRoot "SOURCE_NOTES.md") -Encoding UTF8

Write-Host "Generated visual pack at $PackRoot"
Write-Host "Assets generated: $($script:Assets.Count)"
