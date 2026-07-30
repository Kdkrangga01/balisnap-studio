Add-Type -AssemblyName System.Drawing
$filePath = "c:\Testing Program\BaliSnap Studio\public\qris_pribadi.png"
$outputPath = "c:\Testing Program\BaliSnap Studio\public\qris_pribadi_portrait.png"

$img = [System.Drawing.Image]::FromFile($filePath)
$img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
$img.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()

Remove-Item $filePath -Force
Move-Item $outputPath $filePath -Force
Write-Host "QRIS image rotated to portrait successfully!"
