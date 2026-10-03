param(
  [string]$OutDir = "assets"
)

Add-Type -AssemblyName System.Drawing

function Hex([string]$h) {
  $r = [Convert]::ToInt32($h.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($h.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($h.Substring(4, 2), 16)
  return [System.Drawing.Color]::FromArgb($r, $g, $b)
}

function New-Canvas([int]$size) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  return @($bmp, $g)
}

function Fill-Rect($g, [double]$cx, [double]$cy, [double]$x, [double]$y, [double]$w, [double]$h, [double]$s, $color) {
  $rect = New-Object System.Drawing.RectangleF(
    [float]($cx + $x * $s), [float]($cy + $y * $s), [float]($w * $s), [float]($h * $s))
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $color), $rect)
}

# Draws the dumbbell mark centred on the canvas.
function Draw-Mark($g, [int]$size, [double]$scale, [bool]$monochrome) {
  $cx = $size / 2.0
  $cy = $size / 2.0
  $s = $size / 1024.0 * $scale

  if ($monochrome) {
    $bright = Hex "FFFFFF"
    $mid = Hex "FFFFFF"
    $steel = Hex "FFFFFF"
  } else {
    $bright = Hex "E9EBEE"
    $mid = Hex "C9CDD4"
    $steel = Hex "6E7480"
  }

  # Bar
  Fill-Rect $g $cx $cy -244 -18 488 36 $s $bright
  # Inner plates
  Fill-Rect $g $cx $cy -212 -162 58 324 $s $bright
  Fill-Rect $g $cx $cy 154 -162 58 324 $s $bright
  # Outer caps
  Fill-Rect $g $cx $cy -280 -108 48 216 $s $mid
  Fill-Rect $g $cx $cy 232 -108 48 216 $s $mid

  # Knurling across the bar
  $penWidth = [Math]::Max(2.0, 6.0 * $s)
  $pen = New-Object System.Drawing.Pen -ArgumentList $steel, ([float]$penWidth)
  $x = -200.0
  while ($x -le 200.0) {
    $g.DrawLine($pen, [float]($cx + $x * $s), [float]($cy - 17 * $s), [float]($cx + $x * $s), [float]($cy + 19 * $s))
    $x += 26.0
  }
  $pen.Dispose()
}

$size = 1024

# Launcher icon: gradient background with a soft glow behind the mark
$parts = New-Canvas $size
$bmp = $parts[0]
$g = $parts[1]

$rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $rect, (Hex "16161C"), (Hex "050507"), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillRectangle($bgBrush, $rect)

for ($i = 0; $i -lt 26; $i++) {
  $t = $i / 25.0
  $d = 900 - ($i * 26)
  $alpha = [int](30 * (1 - $t))
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, 233, 235, 238))
  $g.FillEllipse($brush, [float]($size / 2 - $d / 2), [float]($size / 2 - $d / 2), [float]$d, [float]$d)
}

Draw-Mark $g $size 1.0 $false
$bmp.Save((Join-Path $OutDir "icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

# Adaptive foreground: the mark alone, inside the 66% safe zone
$parts = New-Canvas $size
$bmp = $parts[0]
$g = $parts[1]
$g.Clear([System.Drawing.Color]::Transparent)
Draw-Mark $g $size 0.60 $false
$bmp.Save((Join-Path $OutDir "android-icon-foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

# Adaptive background: flat near-black
$parts = New-Canvas $size
$bmp = $parts[0]
$g = $parts[1]
$g.Clear((Hex "0A0A0C"))
$bmp.Save((Join-Path $OutDir "android-icon-background.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

# Monochrome layer for themed icons
$parts = New-Canvas $size
$bmp = $parts[0]
$g = $parts[1]
$g.Clear([System.Drawing.Color]::Transparent)
Draw-Mark $g $size 0.60 $true
$bmp.Save((Join-Path $OutDir "android-icon-monochrome.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

Write-Output "icons written to $OutDir"