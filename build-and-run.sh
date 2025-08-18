#!/bin/bash

echo "🚀 Démarrage de la construction et du lancement des services PFE..."

# Construire tous les services
echo "📦 Construction des services..."

echo "🔨 Construction d'Eureka Server..."
cd eureka-server && mvn clean package -DskipTests && cd ..

echo "🔨 Construction de Gateway Service..."
cd GatewayService && mvn clean package -DskipTests && cd ..

echo "🔨 Construction d'Auth Service..."
cd auth-service2 && mvn clean package -DskipTests && cd ..

echo "🔨 Construction de Packing ISO Service..."
cd PackingISOService && mvn clean package -DskipTests && cd ..

echo "🔨 Construction de Response ISO Service..."
cd ResponseISOService && mvn clean package -DskipTests && cd ..

echo "🔨 Construction de Depacking ISO Service..."
cd DepackingISOService && mvn clean package -DskipTests && cd ..

echo "🔨 Construction d'Incident Report Service..."
cd IncidentReportService && mvn clean package -DskipTests && cd ..

echo "🔨 Construction de Monitoring Service..."
cd MonitoringService && mvn clean package -DskipTests && cd ..

echo "🔨 Construction de Notification Service..."
cd NotificationService && mvn clean package -DskipTests && cd ..

echo "🔨 Construction de Transaction History Service..."
cd TransactionHistoryService && mvn clean package -DskipTests && cd ..

echo "🔨 Construction du Frontend..."
cd FRONT_END/main && npm install && npm run build && cd ../..

# Lancer avec Docker Compose
echo "🐳 Lancement des services avec Docker Compose..."
docker-compose up -d

echo "✅ Tous les services ont été lancés !"
echo ""
echo "📋 URLs des services :"
echo "  🌐 Frontend: http://localhost"
echo "  🔍 Eureka: http://localhost:8761"
echo "  🚪 Gateway: http://localhost:8080"
echo "  🔐 Auth: http://localhost:8085"
echo "  📦 Packing: http://localhost:8082"
echo "  📤 Response: http://localhost:8083"
echo "  📥 Depacking: http://localhost:8086"
echo "  🚨 Incident: http://localhost:8087"
echo "  📊 Monitoring: http://localhost:8088"
echo "  🔔 Notification: http://localhost:8089"
echo "  💰 Transaction: http://localhost:8091"
echo "  🗄️  MySQL: localhost:3306"
echo ""
echo "📊 Vérifier les logs : docker-compose logs -f"
echo "🛑 Arrêter : docker-compose down" 