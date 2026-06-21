param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$reviewRoot = Join-Path $root "docs\art-pipeline\review-round-02"
$assetRoot = Join-Path $root "visual-packs\artifact-childhood\assets"
$generatedRoot = "C:\Users\User\.codex\generated_images\019ee91e-35e9-7d11-970f-d9b528fc08a5"

$boardLandscapeSource = Join-Path $generatedRoot "ig_0a0d9d86d187dc7a016a37f8a4c42881918c1e770aa1a0f34f.png"
$backgroundPortraitSource = Join-Path $generatedRoot "ig_0a0d9d86d187dc7a016a37f9650a708191a13d1e2b2dfce882.png"

function Open-Bitmap([string]$path) {
  return [System.Drawing.Bitmap]::new([System.IO.Path]::GetFullPath($path))
}

function New-ArgbBitmap([int]$width, [int]$height) {
  return [System.Drawing.Bitmap]::new(
    $width,
    $height,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
}

function Save-Png([System.Drawing.Bitmap]$bitmap, [string]$path) {
  $fullPath = [System.IO.Path]::GetFullPath($path)
  $dir = Split-Path -Parent $fullPath
  if ($dir) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  $bitmap.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Copy-Bitmap([System.Drawing.Bitmap]$source) {
  $copy = New-ArgbBitmap $source.Width $source.Height
  $graphics = [System.Drawing.Graphics]::FromImage($copy)
  try {
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($source, 0, 0, $source.Width, $source.Height)
  }
  finally {
    $graphics.Dispose()
  }
  return $copy
}

function Crop-Bitmap(
  [System.Drawing.Bitmap]$source,
  [int]$x,
  [int]$y,
  [int]$width,
  [int]$height
) {
  $target = New-ArgbBitmap $width $height
  $graphics = [System.Drawing.Graphics]::FromImage($target)
  try {
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $srcRect = [System.Drawing.Rectangle]::new($x, $y, $width, $height)
    $dstRect = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
    $graphics.DrawImage($source, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  }
  finally {
    $graphics.Dispose()
  }
  return $target
}

function Fit-ToCanvas(
  [System.Drawing.Bitmap]$source,
  [int]$width,
  [int]$height
) {
  $canvas = New-ArgbBitmap $width $height
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $graphics.Clear($source.GetPixel(0, 0))
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $scale = [Math]::Min($width / $source.Width, $height / $source.Height)
    $drawWidth = [int][Math]::Round($source.Width * $scale)
    $drawHeight = [int][Math]::Round($source.Height * $scale)
    $offsetX = [int][Math]::Floor(($width - $drawWidth) / 2)
    $offsetY = [int][Math]::Floor(($height - $drawHeight) / 2)
    $graphics.DrawImage($source, $offsetX, $offsetY, $drawWidth, $drawHeight)
  }
  finally {
    $graphics.Dispose()
  }
  return $canvas
}

function Resize-Stretch(
  [System.Drawing.Bitmap]$source,
  [int]$width,
  [int]$height
) {
  $target = New-ArgbBitmap $width $height
  $graphics = [System.Drawing.Graphics]::FromImage($target)
  try {
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($source, 0, 0, $width, $height)
  }
  finally {
    $graphics.Dispose()
  }
  return $target
}

function Remove-BackgroundByCorner(
  [System.Drawing.Bitmap]$source,
  [int]$tolerance = 30
) {
  $target = New-ArgbBitmap $source.Width $source.Height
  $sample = $source.GetPixel(0, 0)

  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      $deltaR = [Math]::Abs($pixel.R - $sample.R)
      $deltaG = [Math]::Abs($pixel.G - $sample.G)
      $deltaB = [Math]::Abs($pixel.B - $sample.B)
      if ($deltaR -le $tolerance -and $deltaG -le $tolerance -and $deltaB -le $tolerance) {
        $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
      }
      else {
        $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $pixel.R, $pixel.G, $pixel.B))
      }
    }
  }

  return $target
}

function Tint-ByLuminance(
  [System.Drawing.Bitmap]$source,
  [System.Drawing.Color]$targetColor
) {
  $target = New-ArgbBitmap $source.Width $source.Height

  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      if ($pixel.A -eq 0) {
        $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        continue
      }

      $lum = (($pixel.R * 0.299) + ($pixel.G * 0.587) + ($pixel.B * 0.114)) / 255.0
      $highlight = [Math]::Pow($lum, 2.1)
      $r = [int][Math]::Min(255, [Math]::Round(($targetColor.R * $lum) + (255 * $highlight * 0.18)))
      $g = [int][Math]::Min(255, [Math]::Round(($targetColor.G * $lum) + (255 * $highlight * 0.12)))
      $b = [int][Math]::Min(255, [Math]::Round(($targetColor.B * $lum) + (255 * $highlight * 0.08)))
      $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $r, $g, $b))
    }
  }

  return $target
}

function To-Grayscale([System.Drawing.Bitmap]$source) {
  $target = New-ArgbBitmap $source.Width $source.Height

  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      $lum = [int][Math]::Round(($pixel.R * 0.299) + ($pixel.G * 0.587) + ($pixel.B * 0.114))
      $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $lum, $lum, $lum))
    }
  }

  return $target
}

function Write-Blank([string]$path, [int]$width, [int]$height) {
  $bitmap = New-ArgbBitmap $width $height
  try {
    Save-Png $bitmap $path
  }
  finally {
    $bitmap.Dispose()
  }
}

function Export-CroppedAsset {
  param(
    [string]$SourcePath,
    [int]$X,
    [int]$Y,
    [int]$Width,
    [int]$Height,
    [string]$OutputPath,
    [int]$TargetWidth,
    [int]$TargetHeight,
    [switch]$Transparent,
    [int]$Tolerance = 30
  )

  $source = Open-Bitmap $SourcePath
  try {
    $cropped = Crop-Bitmap $source $X $Y $Width $Height
    try {
      if ($Transparent) {
        $alphaBitmap = Remove-BackgroundByCorner -source $cropped -tolerance $Tolerance
        $cropped.Dispose()
        $cropped = $alphaBitmap
      }

      $resized = Resize-Stretch $cropped $TargetWidth $TargetHeight
      try {
        Save-Png $resized $OutputPath
      }
      finally {
        $resized.Dispose()
      }
    }
    finally {
      $cropped.Dispose()
    }
  }
  finally {
    $source.Dispose()
  }
}

$panelSource = Join-Path $reviewRoot "panels\01-ui-panel-family.png"
$buttonSource = Join-Path $reviewRoot "buttons\01-button-family.png"
$iconSource = Join-Path $reviewRoot "icons\01-seal-icon-family.png"
$particleSource = Join-Path $reviewRoot "particles\01-particle-and-ring-family.png"
$backgroundLandscapeSource = Join-Path $reviewRoot "background\01-idle-background.png"

# Board and background
$boardLandscape = Open-Bitmap $boardLandscapeSource
try {
  $boardLandscapeFit = Fit-ToCanvas $boardLandscape 2048 1024
  try {
    Save-Png $boardLandscapeFit (Join-Path $assetRoot "board-landscape-base.png")
  }
  finally {
    $boardLandscapeFit.Dispose()
  }
}
finally {
  $boardLandscape.Dispose()
}

$boardPortraitDerived = Open-Bitmap $boardLandscapeSource
try {
  $boardPortraitFit = Fit-ToCanvas $boardPortraitDerived 1536 1024
  try {
    Save-Png $boardPortraitFit (Join-Path $assetRoot "board-portrait-base.png")
  }
  finally {
    $boardPortraitFit.Dispose()
  }
}
finally {
  $boardPortraitDerived.Dispose()
}

$bgLandscape = Open-Bitmap $backgroundLandscapeSource
try {
  $bgLandscapeFit = Resize-Stretch $bgLandscape 2560 1440
  try {
    Save-Png $bgLandscapeFit (Join-Path $assetRoot "background-landscape-idle.png")
  }
  finally {
    $bgLandscapeFit.Dispose()
  }
}
finally {
  $bgLandscape.Dispose()
}

$bgPortrait = Open-Bitmap $backgroundPortraitSource
try {
  $bgPortraitFit = Resize-Stretch $bgPortrait 1440 2560
  try {
    Save-Png $bgPortraitFit (Join-Path $assetRoot "background-portrait-idle.png")
  }
  finally {
    $bgPortraitFit.Dispose()
  }
}
finally {
  $bgPortrait.Dispose()
}

Write-Blank (Join-Path $assetRoot "board-landscape-rim-overlay.png") 2048 1024
Write-Blank (Join-Path $assetRoot "board-landscape-shadow.png") 2048 1024
Write-Blank (Join-Path $assetRoot "board-landscape-slot-mask.png") 2048 1024
Write-Blank (Join-Path $assetRoot "board-portrait-rim-overlay.png") 1536 1024
Write-Blank (Join-Path $assetRoot "board-portrait-shadow.png") 1536 1024
Write-Blank (Join-Path $assetRoot "board-portrait-slot-mask.png") 1536 1024

# Panel crops
Export-CroppedAsset -SourcePath $panelSource -X 46 -Y 102 -Width 698 -Height 196 `
  -OutputPath (Join-Path $assetRoot "ui-score-panel-9slice.png") `
  -TargetWidth 1024 -TargetHeight 256 -Tolerance 34

Export-CroppedAsset -SourcePath $panelSource -X 804 -Y 111 -Width 670 -Height 198 `
  -OutputPath (Join-Path $assetRoot "ui-dialogue-panel-9slice.png") `
  -TargetWidth 1536 -TargetHeight 320 -Tolerance 34

Export-CroppedAsset -SourcePath $panelSource -X 54 -Y 371 -Width 701 -Height 592 `
  -OutputPath (Join-Path $assetRoot "ui-modal-panel-9slice.png") `
  -TargetWidth 1400 -TargetHeight 1200 -Tolerance 34

Export-CroppedAsset -SourcePath $panelSource -X 806 -Y 367 -Width 676 -Height 604 `
  -OutputPath (Join-Path $assetRoot "ui-result-panel-9slice.png") `
  -TargetWidth 1024 -TargetHeight 1024 -Tolerance 34

# Buttons and frames
Export-CroppedAsset -SourcePath $buttonSource -X 290 -Y 753 -Width 956 -Height 186 `
  -OutputPath (Join-Path $assetRoot "ui-button-primary-9slice.png") `
  -TargetWidth 768 -TargetHeight 224 -Tolerance 34

Export-CroppedAsset -SourcePath $buttonSource -X 290 -Y 753 -Width 956 -Height 186 `
  -OutputPath (Join-Path $assetRoot "ui-button-secondary-9slice.png") `
  -TargetWidth 768 -TargetHeight 224 -Tolerance 34

Export-CroppedAsset -SourcePath $iconSource -X 1182 -Y 424 -Width 306 -Height 313 `
  -OutputPath (Join-Path $assetRoot "ui-icon-frame.png") `
  -TargetWidth 256 -TargetHeight 256 -Transparent -Tolerance 34

Export-CroppedAsset -SourcePath $iconSource -X 28 -Y 30 -Width 350 -Height 350 `
  -OutputPath (Join-Path $assetRoot "ui-turn-badge.png") `
  -TargetWidth 384 -TargetHeight 384 -Transparent -Tolerance 34

# Rings
Export-CroppedAsset -SourcePath $particleSource -X 66 -Y 548 -Width 164 -Height 164 `
  -OutputPath (Join-Path $assetRoot "hint-ring-red.png") `
  -TargetWidth 512 -TargetHeight 512 -Transparent -Tolerance 22

Export-CroppedAsset -SourcePath $particleSource -X 66 -Y 548 -Width 164 -Height 164 `
  -OutputPath (Join-Path $assetRoot "hint-ring-purple.png") `
  -TargetWidth 512 -TargetHeight 512 -Transparent -Tolerance 22

Export-CroppedAsset -SourcePath $particleSource -X 66 -Y 548 -Width 164 -Height 164 `
  -OutputPath (Join-Path $assetRoot "hint-ring-landing.png") `
  -TargetWidth 512 -TargetHeight 512 -Transparent -Tolerance 22

# Particle families
$particleRects = @(
  @{ X = 34; Y = 286; W = 214; H = 214; Name = "01" },
  @{ X = 256; Y = 286; W = 214; H = 214; Name = "02" },
  @{ X = 476; Y = 286; W = 214; H = 214; Name = "03" },
  @{ X = 698; Y = 286; W = 214; H = 214; Name = "04" },
  @{ X = 920; Y = 286; W = 214; H = 214; Name = "05" }
)

$gold = [System.Drawing.Color]::FromArgb(255, 236, 187, 96)
$ruby = [System.Drawing.Color]::FromArgb(255, 214, 88, 100)
$amethyst = [System.Drawing.Color]::FromArgb(255, 150, 123, 235)
$particleBitmap = Open-Bitmap $particleSource
try {
  foreach ($rect in $particleRects) {
    $crop = Crop-Bitmap $particleBitmap $rect.X $rect.Y $rect.W $rect.H
    try {
      $alpha = Remove-BackgroundByCorner -source $crop -tolerance 22
      try {
        foreach ($variant in @(
          @{ Prefix = "gold"; Color = $gold },
          @{ Prefix = "ruby"; Color = $ruby },
          @{ Prefix = "amethyst"; Color = $amethyst }
        )) {
          $tinted = Tint-ByLuminance $alpha $variant.Color
          try {
            $scaled = Resize-Stretch $tinted 128 128
            try {
              $name = "particle-{0}-{1}.png" -f $variant.Prefix, $rect.Name
              Save-Png $scaled (Join-Path $assetRoot $name)
            }
            finally {
              $scaled.Dispose()
            }
          }
          finally {
            $tinted.Dispose()
          }
        }
      }
      finally {
        $alpha.Dispose()
      }
    }
    finally {
      $crop.Dispose()
    }
  }
}
finally {
  $particleBitmap.Dispose()
}

# Well materials
$boardBitmap = Open-Bitmap $boardLandscapeSource
try {
  $pitTexture = Crop-Bitmap $boardBitmap 625 256 220 220
  $storeTexture = Crop-Bitmap $boardBitmap 82 225 206 412
  try {
    $pitAlbedo = Resize-Stretch $pitTexture 512 512
    $pitRoughness = To-Grayscale $pitAlbedo
    $pitNormal = New-ArgbBitmap 512 512
    try {
      for ($y = 0; $y -lt $pitNormal.Height; $y++) {
        for ($x = 0; $x -lt $pitNormal.Width; $x++) {
          $pitNormal.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 128, 128, 255))
        }
      }

      Save-Png $pitAlbedo (Join-Path $assetRoot "pit-well-albedo.png")
      Save-Png $pitRoughness (Join-Path $assetRoot "pit-well-roughness.png")
      Save-Png $pitNormal (Join-Path $assetRoot "pit-well-normal.png")
    }
    finally {
      $pitAlbedo.Dispose()
      $pitRoughness.Dispose()
      $pitNormal.Dispose()
    }

    $storeLandscape = Resize-Stretch $storeTexture 512 1024
    $storePortrait = Resize-Stretch $storeTexture 512 768
    $storeRoughness = To-Grayscale $storeLandscape
    $storeNormal = New-ArgbBitmap 512 1024
    try {
      for ($y = 0; $y -lt $storeNormal.Height; $y++) {
        for ($x = 0; $x -lt $storeNormal.Width; $x++) {
          $storeNormal.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 128, 128, 255))
        }
      }

      Save-Png $storeLandscape (Join-Path $assetRoot "store-well-landscape-albedo.png")
      Save-Png $storePortrait (Join-Path $assetRoot "store-well-portrait-albedo.png")
      Save-Png $storeRoughness (Join-Path $assetRoot "store-well-roughness.png")
      Save-Png $storeNormal (Join-Path $assetRoot "store-well-normal.png")
    }
    finally {
      $storeLandscape.Dispose()
      $storePortrait.Dispose()
      $storeRoughness.Dispose()
      $storeNormal.Dispose()
    }
  }
  finally {
    $pitTexture.Dispose()
    $storeTexture.Dispose()
  }
}
finally {
  $boardBitmap.Dispose()
}

Write-Host "Artifact runtime pack rebuilt from approved mother art and current master board renders."
