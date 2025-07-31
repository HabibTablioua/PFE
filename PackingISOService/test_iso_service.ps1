# Script de test pour PackingISOService
# Test des endpoints de génération de messages ISO

$baseUrl = "http://localhost:8082"  # Port du service PackingISOService
$testData = Get-Content "test_iso_message.json" -Raw

Write-Host "🧪 Test du service PackingISOService" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test 1: Pack ASCII
Write-Host "`n📤 Test 1: Pack ASCII" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/packing/pack-ascii" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ Succès - Message ASCII généré:" -ForegroundColor Green
    Write-Host $response.message -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors du test ASCII:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test 2: Pack HEX
Write-Host "`n📤 Test 2: Pack HEX" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/packing/pack-hex" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ Succès - Message HEX généré:" -ForegroundColor Green
    Write-Host $response.message -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors du test HEX:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n🏁 Tests terminés!" -ForegroundColor Green 