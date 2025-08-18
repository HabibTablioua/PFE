Write-Host "🚀 Démarrage de la construction et du lancement des services PFE..." -ForegroundColor Green

# Construire tous les services
Write-Host "📦 Construction des services..." -ForegroundColor Yellow

Write-Host "🔨 Construction d'Eureka Server..." -ForegroundColor Cyan
Set-Location eureka-server
mvn clean package -DskipTests
Set-Location ..

Write-Host "🔨 Construction de Gateway Service..." -ForegroundColor Cyan
Set-Location GatewayService
mvn clean package -DskipTests
Set-Location ..

Write-Host "🔨 Construction d'Auth Service..." -ForegroundColor Cyan
Set-Location auth-service2
mvn clean package -DskipTests
Set-Location ..

Write-Host "🔨 Construction de Packing ISO Service..." -ForegroundColor Cyan
Set-Location PackingISOService
mvn clean package -DskipTests
Set-Location ..

Write-Host "🔨 Construction de Response ISO Service..." -ForegroundColor Cyan
Set-Location ResponseISOService
mvn clean package -DskipTests
Set-Location ..

Write-Host "🔨 Construction de Depacking ISO Service..." -ForegroundColor Cyan
Set-Location DepackingISOService
mvn clean package -DskipTests
Set-Location ..

Write-Host "🔨 Construction d'Incident Report Service..." -ForegroundColor Cyan
Set-Location IncidentReportService
mvn clean package -DskipTests
Set-Location ..

Write-Host "🔨 Construction de Monitoring Service..." -ForegroundColor Cyan
Set-Location MonitoringService
mvn clean package -DskipTests
Set-Location ..

Write-Host "🔨 Construction de Notification Service..." -ForegroundColor Cyan
Set-Location NotificationService
mvn clean package -DskipTests
Set-Location ..

Write-Host "🔨 Construction de Transaction History Service..." -ForegroundColor Cyan
Set-Location TransactionHistoryService
mvn clean package -DskipTests
Set-Location ..

Write-Host "🔨 Construction du Frontend..." -ForegroundColor Cyan
Set-Location FRONT_END/main
npm install
npm run build
Set-Location ../..

# Lancer avec Docker Compose
Write-Host "🐳 Lancement des services avec Docker Compose..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "✅ Tous les services ont été lancés !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 URLs des services :" -ForegroundColor White
Write-Host "  🌐 Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "  🔍 Eureka: http://localhost:8761" -ForegroundColor Cyan
Write-Host "  🚪 Gateway: http://localhost:8080" -ForegroundColor Cyan
Write-Host "  🔐 Auth: http://localhost:8085" -ForegroundColor Cyan
Write-Host "  📦 Packing: http://localhost:8082" -ForegroundColor Cyan
Write-Host "  📤 Response: http://localhost:8083" -ForegroundColor Cyan
Write-Host "  📥 Depacking: http://localhost:8086" -ForegroundColor Cyan
Write-Host "  🚨 Incident: http://localhost:8087" -ForegroundColor Cyan
Write-Host "  📊 Monitoring: http://localhost:8088" -ForegroundColor Cyan
Write-Host "  🔔 Notification: http://localhost:8089" -ForegroundColor Cyan
Write-Host "  💰 Transaction: http://localhost:8091" -ForegroundColor Cyan
Write-Host "  🗄️  MySQL: localhost:3306" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Vérifier les logs : docker-compose logs -f" -ForegroundColor Yellow
Write-Host "🛑 Arrêter : docker-compose down" -ForegroundColor Yellow 