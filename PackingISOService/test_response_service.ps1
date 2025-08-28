# Script de test pour vérifier la connectivité avec ResponseISOService
Write-Host "🧪 Test de connectivité avec ResponseISOService" -ForegroundColor Cyan

# Test 1: Endpoint de santé
Write-Host "`n1️⃣ Test de l'endpoint de santé..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8089/response/health" -Method GET
    Write-Host "✅ Endpoint de santé accessible: $healthResponse" -ForegroundColor Green
} catch {
    Write-Host "❌ Endpoint de santé inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Endpoint de processus (sans authentification)
Write-Host "`n2️⃣ Test de l'endpoint de processus..." -ForegroundColor Yellow
$testPayload = @{
    isoMessage = "02007FFFFFFFFFFF8000164532123456789012"
    transactionId = "TEST123"
    format = "ASCII"
    meta = @{}
} | ConvertTo-Json

try {
    $processResponse = Invoke-RestMethod -Uri "http://localhost:8089/response/process" -Method POST -Body $testPayload -ContentType "application/json"
    Write-Host "✅ Endpoint de processus accessible: $($processResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Endpoint de processus inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Test terminé!" -ForegroundColor Cyan

