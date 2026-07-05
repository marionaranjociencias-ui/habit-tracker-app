# Subir habit-tracker-app a GitHub
# Uso: clic derecho -> "Ejecutar con PowerShell" o: powershell -ExecutionPolicy Bypass -File subir-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== habit-tracker-app -> GitHub ===" -ForegroundColor Cyan

$remote = "https://github.com/marionaranjociencias-ui/habit-tracker-app.git"
git remote set-url origin $remote
git branch -M main

Write-Host "Remoto:" -ForegroundColor Yellow
git remote -v

# Crear repo en GitHub si gh esta autenticado
$ghOk = $false
try {
  gh auth status 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { $ghOk = $true }
} catch {}

if ($ghOk) {
  Write-Host "Creando repositorio en GitHub (si no existe)..." -ForegroundColor Yellow
  gh repo create marionaranjociencias-ui/habit-tracker-app --public --source=. --remote=origin --push 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "El repo ya existe o no se pudo crear. Intentando push..." -ForegroundColor Yellow
    git push -u origin main
  }
} else {
  Write-Host ""
  Write-Host "IMPORTANTE: Crea el repo vacio en GitHub primero:" -ForegroundColor Magenta
  Write-Host "  https://github.com/new" -ForegroundColor White
  Write-Host "  Nombre: habit-tracker-app" -ForegroundColor White
  Write-Host "  Sin README ni .gitignore" -ForegroundColor White
  Write-Host ""
  Read-Host "Cuando lo hayas creado, pulsa Enter para subir el codigo"
  git push -u origin main
}

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "Listo! Repo: https://github.com/marionaranjociencias-ui/habit-tracker-app" -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "Error al subir. Copia el mensaje de arriba y pidenos ayuda." -ForegroundColor Red
  exit 1
}
