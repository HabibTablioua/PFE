# Script de test complet pour ResponseISOService
Write-Host "🧪 Test complet de ResponseISOService" -ForegroundColor Cyan

# Test 1: Endpoint de santé
Write-Host "`n1️⃣ Test de l'endpoint de santé..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8089/response/health" -Method GET
    Write-Host "✅ Endpoint de santé accessible: $healthResponse" -ForegroundColor Green
} catch {
    Write-Host "❌ Endpoint de santé inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Endpoint de test simple
Write-Host "`n2️⃣ Test de l'endpoint de test..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-RestMethod -Uri "http://localhost:8089/response/test" -Method POST -Body "Test simple" -ContentType "text/plain"
    Write-Host "✅ Endpoint de test accessible: $testResponse" -ForegroundColor Green
} catch {
    Write-Host "❌ Endpoint de test inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Endpoint de processus (sans authentification)
Write-Host "`n3️⃣ Test de l'endpoint de processus..." -ForegroundColor Yellow
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
    if ($_.Exception.Message -contains "403") {
        Write-Host "🔐 Erreur 403 - Problème d'authentification/autorisation" -ForegroundColor Red
        Write-Host "💡 Solution : Redémarrer ResponseISOService avec la nouvelle configuration de sécurité" -ForegroundColor Yellow
    }
}

# Test 4: Vérification du port
Write-Host "`n4️⃣ Vérification du port 8089..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect("localhost", 8089)
    if ($tcpClient.Connected) {
        Write-Host "✅ Port 8089 accessible" -ForegroundColor Green
        $tcpClient.Close()
    }
} catch {
    Write-Host "❌ Port 8089 inaccessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Solution : Vérifier que ResponseISOService est démarré" -ForegroundColor Yellow
}

Write-Host "`n🏁 Test terminé!" -ForegroundColor Cyan
Write-Host "`n📋 Résumé des actions à effectuer :" -ForegroundColor Yellow
Write-Host "1. Redémarrer ResponseISOService dans IntelliJ IDEA" -ForegroundColor White
Write-Host "2. Vérifier que le service tourne sur le port 8089" -ForegroundColor White
Write-Host "3. Relancer ce script de test" -ForegroundColor White


