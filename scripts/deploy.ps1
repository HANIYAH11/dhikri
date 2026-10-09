# ============================================================================
# ذِكري — سكربت نشر محلي: يبني الموقع ويرفعه إلى فرع gh-pages
# الاستخدام (من جذر المشروع):
#   $env:GH_TOKEN = "ghp_..."   # رمز بصلاحية repo
#   powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1
# ملاحظة: هذا البديل لتفعيل GitHub Actions لاحقًا (انظر README).
# ============================================================================
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "1/4 بناء الموقع..." -ForegroundColor Cyan
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw "فشل البناء" }

$tmp = Join-Path $env:TEMP "dhikri-pages"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null
Copy-Item "dist\*" $tmp -Recurse -Force
Copy-Item ".nojekyll" $tmp -Force

Write-Host "2/4 تجهيز فرع gh-pages..." -ForegroundColor Cyan
Push-Location $tmp
git init -b gh-pages 2>&1 | Out-Null
git config user.name  "Noor Al Dhikr"
git config user.email "218851620+HANIYAH11@users.noreply.github.com"
git add -A

$stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -q -m "نشر الموقع — $stamp"

Write-Host "3/4 الرفع إلى GitHub..." -ForegroundColor Cyan
if ($env:GH_TOKEN) {
  $url = "https://x-access-token:$($env:GH_TOKEN)@github.com/HANIYAH11/dhikri-app.git"
} else {
  $url = "https://github.com/HANIYAH11/dhikri-app.git"   # يتطلب بيانات دخول محفوظة
}
git remote add origin $url
git push -f origin gh-pages
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "فشل الرفع" }

Pop-Location
Remove-Item $tmp -Recurse -Force

Write-Host "4/4 تم النشر. يُحدَّث الموقع خلال دقيقة تقريبًا." -ForegroundColor Green
Write-Host "https://haniyah11.github.io/dhikri-app/" -ForegroundColor Yellow
