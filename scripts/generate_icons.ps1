Add-Type -AssemblyName System.Drawing

$root = Resolve-Path .
$originalLogoPath = Join-Path $root "public/tanglish-logo.png"

Write-Output "Loading source logo from: $originalLogoPath"
$src = [System.Drawing.Bitmap]::FromFile($originalLogoPath)

# 1. Create clean master 512x512 PNG with smooth rounded transparent corners
$masterSize = 512
$masterBmp = New-Object System.Drawing.Bitmap($masterSize, $masterSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gMaster = [System.Drawing.Graphics]::FromImage($masterBmp)
$gMaster.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gMaster.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gMaster.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gMaster.Clear([System.Drawing.Color]::Transparent)

# Exact bounding box of the badge card inside public/tanglish-logo.png
$srcRect = New-Object System.Drawing.Rectangle(7, 6, 533, 526)
$radius = 75
$d = $radius * 2
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$rect = New-Object System.Drawing.Rectangle(0, 0, $masterSize, $masterSize)
$path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
$path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
$path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
$path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
$path.CloseFigure()

$gMaster.SetClip($path)
$gMaster.DrawImage($src, $rect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$gMaster.Dispose()
$src.Dispose()

# Save master PNG to public/icon.png, public/tanglish-logo.png, src/assets/tanglish-logo.png
$publicIconPath = Join-Path $root "public/icon.png"
$publicLogoPath = Join-Path $root "public/tanglish-logo.png"
$srcLogoPath = Join-Path $root "src/assets/tanglish-logo.png"

$masterBmp.Save($publicIconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$masterBmp.Save($publicLogoPath, [System.Drawing.Imaging.ImageFormat]::Png)
$masterBmp.Save($srcLogoPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved master 512x512 PNGs to public/icon.png, public/tanglish-logo.png, src/assets/tanglish-logo.png"

# Helper function to resize bitmap
function Resize-Image($sourceBmp, $width, $height) {
    $dest = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($sourceBmp, 0, 0, $width, $height)
    $g.Dispose()
    return $dest
}

# Helper function to create round launcher icon
function Create-Round-Icon($sourceBmp, $size) {
    $dest = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Clip to circle
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $size, $size)
    $g.SetClip($path)
    
    # Draw background
    $darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 11, 17, 32))
    $g.FillEllipse($darkBrush, 0, 0, $size, $size)
    $darkBrush.Dispose()
    
    # Draw badge centered inside the circle (at 85% scale)
    $innerSize = [int]($size * 0.85)
    $offset = [int](($size - $innerSize) / 2)
    $g.DrawImage($sourceBmp, $offset, $offset, $innerSize, $innerSize)
    
    $g.Dispose()
    return $dest
}

# Helper function to create adaptive foreground icon (108dp canvas, safe zone centered)
function Create-Foreground-Icon($sourceBmp, $canvasSize) {
    $dest = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # In Android adaptive icons, safe zone is 72dp out of 108dp (66.7%). Let's make badge 70% of canvas.
    $badgeSize = [int]($canvasSize * 0.70)
    $offset = [int](($canvasSize - $badgeSize) / 2)
    $g.DrawImage($sourceBmp, $offset, $offset, $badgeSize, $badgeSize)
    
    $g.Dispose()
    return $dest
}

# Android mipmap densities and dimensions
$densities = @(
    @{ Name = "mdpi"; Size = 48; Foreground = 108 },
    @{ Name = "hdpi"; Size = 72; Foreground = 162 },
    @{ Name = "xhdpi"; Size = 96; Foreground = 216 },
    @{ Name = "xxhdpi"; Size = 144; Foreground = 324 },
    @{ Name = "xxxhdpi"; Size = 192; Foreground = 432 }
)

$androidResDir = Join-Path $root "android/app/src/main/res"

foreach ($d in $densities) {
    $folder = Join-Path $androidResDir ("mipmap-" + $d.Name)
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
    }
    
    # 1. ic_launcher.png
    $launcherBmp = Resize-Image $masterBmp $d.Size $d.Size
    $launcherPath = Join-Path $folder "ic_launcher.png"
    $launcherBmp.Save($launcherPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $launcherBmp.Dispose()
    
    # 2. ic_launcher_round.png
    $roundBmp = Create-Round-Icon $masterBmp $d.Size
    $roundPath = Join-Path $folder "ic_launcher_round.png"
    $roundBmp.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $roundBmp.Dispose()
    
    # 3. ic_launcher_foreground.png
    $fgBmp = Create-Foreground-Icon $masterBmp $d.Foreground
    $fgPath = Join-Path $folder "ic_launcher_foreground.png"
    $fgBmp.Save($fgPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $fgBmp.Dispose()
    
    Write-Output "Generated Android icons for mipmap-$($d.Name): $($d.Size)x$($d.Size), FG $($d.Foreground)x$($d.Foreground)"
}

$masterBmp.Dispose()
Write-Output "Android mipmaps generated successfully!"
