# Script de empaquetado para la entrega final de Programación IV
# Excluye node_modules, .venv, bases de datos locales, archivos .env con secretos y carpetas temporales.

$zipName = "TPI-Food_Store-Brian_Emanuel_Rios.zip"
$outputPath = Join-Path -Path (Get-Location) -ChildPath $zipName

Write-Host "Iniciando empaquetado limpio de la solución: $zipName..." -ForegroundColor Cyan

if (Test-Path $outputPath) {
    Remove-Item -Force $outputPath
    Write-Host "Archivo ZIP anterior eliminado." -ForegroundColor Yellow
}

$excludeDirNames = @(".git", ".venv", "venv", "node_modules", "dist", "dist-ssr", "__pycache__", ".pytest_cache")
$excludeExts = @(".db", ".sqlite", ".sqlite3", ".tsbuildinfo")

function Get-EligibleFiles($dir) {
    $results = @()
    foreach ($item in Get-ChildItem -Path $dir -Force) {
        if ($item.PSIsContainer) {
            if ($excludeDirNames -notcontains $item.Name) {
                $results += Get-EligibleFiles $item.FullName
            }
        } else {
            if ($item.Name -eq ".env" -or $item.Name -eq $zipName) {
                continue
            }
            if ($excludeExts -contains $item.Extension) {
                continue
            }
            $results += $item
        }
    }
    return $results
}

$filesToZip = Get-EligibleFiles (Get-Location).Path
Write-Host "Total de archivos a incluir: $($filesToZip.Count)" -ForegroundColor Green

$tempDir = Join-Path -Path $env:TEMP -ChildPath "FoodStore_Entrega_$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
    $currentDir = (Get-Location).Path
    foreach ($file in $filesToZip) {
        $relativePath = $file.FullName.Substring($currentDir.Length + 1)
        $destinationPath = Join-Path -Path $tempDir -ChildPath $relativePath
        $parentDir = Split-Path -Path $destinationPath -Parent
        if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        }
        Copy-Item -Path $file.FullName -Destination $destinationPath -Force
    }

    Compress-Archive -Path "$tempDir\*" -DestinationPath $outputPath -CompressionLevel Optimal
    Write-Host "¡Entrega generada con éxito en: $outputPath!" -ForegroundColor Green
    $sizeMB = (Get-Item $outputPath).Length / 1MB
    Write-Host ("Tamaño del paquete ZIP: {0:N2} MB" -f $sizeMB) -ForegroundColor Green
} finally {
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}
