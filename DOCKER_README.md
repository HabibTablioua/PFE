# 🐳 Guide Docker pour le Projet PFE

Ce guide explique comment déployer et exécuter tous les microservices du projet PFE avec Docker.

## 📋 Prérequis

- Docker Desktop installé et en cours d'exécution
- Docker Compose installé
- Maven installé
- Node.js installé (pour le frontend)

## 🚀 Démarrage rapide

### Option 1 : Script automatique (Recommandé)

**Windows (PowerShell) :**
```powershell
.\build-and-run.ps1
```

**Linux/Mac :**
```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

### Option 2 : Manuel

1. **Construire tous les services :**
```bash
# Eureka Server
cd eureka-server && mvn clean package -DskipTests && cd ..

# Gateway Service
cd GatewayService && mvn clean package -DskipTests && cd ..

# Auth Service
cd auth-service2 && mvn clean package -DskipTests && cd ..

# Packing ISO Service
cd PackingISOService && mvn clean package -DskipTests && cd ..

# Response ISO Service
cd ResponseISOService && mvn clean package -DskipTests && cd ..

# Depacking ISO Service
cd DepackingISOService && mvn clean package -DskipTests && cd ..

# Incident Report Service
cd IncidentReportService && mvn clean package -DskipTests && cd ..

# Monitoring Service
cd MonitoringService && mvn clean package -DskipTests && cd ..

# Notification Service
cd NotificationService && mvn clean package -DskipTests && cd ..

# Transaction History Service
cd TransactionHistoryService && mvn clean package -DskipTests && cd ..

# Frontend
cd FRONT_END/main && npm install && npm run build && cd ../..
```

2. **Lancer avec Docker Compose :**
```bash
docker-compose up -d
```

## 🌐 URLs des services

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| Frontend | http://localhost | 80 | Interface utilisateur Angular |
| Eureka | http://localhost:8761 | 8761 | Registre des services |
| Gateway | http://localhost:8080 | 8080 | API Gateway |
| Auth | http://localhost:8085 | 8085 | Service d'authentification |
| Packing | http://localhost:8082 | 8082 | Service de packaging ISO |
| Response | http://localhost:8083 | 8083 | Service de réponse ISO |
| Depacking | http://localhost:8086 | 8086 | Service de dépackaging ISO |
| Incident | http://localhost:8087 | 8087 | Service de gestion des incidents |
| Monitoring | http://localhost:8088 | 8088 | Service de monitoring |
| Notification | http://localhost:8089 | 8089 | Service de notifications |
| Transaction | http://localhost:8091 | 8091 | Service d'historique des transactions |
| MySQL | localhost:3306 | 3306 | Base de données |

## 🛠️ Commandes utiles

### Vérifier l'état des services
```bash
docker-compose ps
```

### Voir les logs
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f eureka-server
```

### Arrêter les services
```bash
docker-compose down
```

### Redémarrer un service
```bash
docker-compose restart eureka-server
```

### Reconstruire et redémarrer
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 Configuration

### Variables d'environnement
Tous les services utilisent le profil `docker` avec les variables suivantes :
- `SPRING_PROFILES_ACTIVE=docker`
- `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/`
- `SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/pfe_db`

### Base de données
- **Host :** mysql
- **Port :** 3306
- **Database :** pfe_db
- **Username :** pfe_user
- **Password :** pfe_password

## 🐛 Dépannage

### Service ne démarre pas
1. Vérifier les logs : `docker-compose logs [service-name]`
2. Vérifier que MySQL est démarré
3. Vérifier que Eureka est accessible

### Port déjà utilisé
1. Arrêter le service qui utilise le port
2. Ou modifier le port dans `docker-compose.yml`

### Problème de mémoire
1. Augmenter la mémoire Docker dans Docker Desktop
2. Ou ajouter des limites de mémoire dans `docker-compose.yml`

## 📁 Structure des fichiers

```
PFE/
├── docker-compose.yml          # Orchestration des services
├── .dockerignore              # Fichiers à ignorer lors du build
├── build-and-run.sh           # Script de build pour Linux/Mac
├── build-and-run.ps1          # Script de build pour Windows
├── DOCKER_README.md           # Ce fichier
├── eureka-server/
│   └── Dockerfile
├── GatewayService/
│   └── Dockerfile
├── auth-service2/
│   └── Dockerfile
├── PackingISOService/
│   └── Dockerfile
├── ResponseISOService/
│   └── Dockerfile
├── DepackingISOService/
│   └── Dockerfile
├── IncidentReportService/
│   └── Dockerfile
├── MonitoringService/
│   └── Dockerfile
├── NotificationService/
│   └── Dockerfile
├── TransactionHistoryService/
│   └── Dockerfile
└── FRONT_END/
    ├── Dockerfile
    └── nginx.conf
```

## 🎯 Prochaines étapes

1. **Tests :** Vérifier que tous les services répondent
2. **Monitoring :** Configurer des alertes et métriques
3. **Sécurité :** Ajouter des secrets et variables d'environnement
4. **Production :** Configurer des volumes persistants et backups 