# Dashboard avec GatewayService - Guide Complet

## 🚀 Vue d'ensemble

Le dashboard utilise maintenant le **GatewayService** (port 8088) pour accéder à tous les services backend avec des **couleurs distinctes** pour chaque bloc de statistiques.

## 🎨 Couleurs des Blocs

### **1. Transactions (Bleu)**
- **Couleur** : Dégradé bleu (`#3b82f6` → `#1d4ed8`)
- **Icône** : `trending-up`
- **Données** : Total des transactions, transactions du jour
- **Route Gateway** : `/api/history/*`

### **2. Incidents (Rouge)**
- **Couleur** : Dégradé rouge (`#ef4444` → `#dc2626`)
- **Icône** : `alert-triangle`
- **Données** : Total des incidents, incidents non traités
- **Route Gateway** : `/api/incidents/*`

### **3. Réponses ISO (Vert)**
- **Couleur** : Dégradé vert (`#10b981` → `#059669`)
- **Icône** : `send`
- **Données** : Réponses succès/échec
- **Route Gateway** : `/api/response/*`

### **4. Comptes (Orange)**
- **Couleur** : Dégradé orange (`#f59e0b` → `#d97706`)
- **Icône** : `credit-card`
- **Données** : Total des comptes, utilisateurs actifs
- **Route Gateway** : `/api/accounts/*`, `/api/users/*`

## 🔧 Configuration GatewayService

### **Port Principal**
```yaml
server:
  port: 8088
```

### **Routes Configurées**
```yaml
routes:
  - id: TransactionHistoryService
    uri: lb://TransactionHistoryService
    predicates:
      - Path=/api/history/**
    
  - id: IncidentReportService
    uri: lb://IncidentReportService
    predicates:
      - Path=/api/incidents/**
    
  - id: Response-Service
    uri: lb://Response-Service
    predicates:
      - Path=/api/response/**
    
  - id: ResponseISOService-accounts
    uri: lb://Response-Service
    predicates:
      - Path=/api/accounts/**
    
  - id: auth-service-users
    uri: lb://auth-service2
    predicates:
      - Path=/api/users/**
```

## 📊 Endpoints Utilisés

### **TransactionHistoryService**
- `GET /api/history/count` - Total des transactions
- `GET /api/history/per-status` - Répartition par statut
- `GET /api/history/per-source` - Répartition par source
- `GET /api/history/per-day` - Transactions par jour

### **IncidentReportService**
- `GET /api/incidents/count` - Total des incidents
- `GET /api/incidents/count-non-traite` - Incidents non traités
- `GET /api/incidents/count-resolu` - Incidents résolus

### **ResponseISOService**
- `GET /api/response/history/count-success` - Réponses réussies
- `GET /api/response/history/count-failed` - Réponses échouées
- `GET /api/response/history` - Historique des réponses

### **AccountService**
- `GET /api/accounts/count` - Total des comptes

### **AuthService**
- `GET /api/users/count` - Total des utilisateurs

## 🎯 Fonctionnalités

### **Statistiques Réelles**
- ✅ **Données en temps réel** depuis vos services
- ✅ **Actualisation automatique** au chargement
- ✅ **Gestion d'erreurs** avec messages explicites
- ✅ **Indicateur de chargement** pendant les requêtes

### **Interface Utilisateur**
- ✅ **Couleurs distinctes** pour chaque type de données
- ✅ **Icônes spécifiques** pour chaque métrique
- ✅ **Descriptions détaillées** sous chaque statistique
- ✅ **Bouton de réessai** en cas d'erreur

### **Responsive Design**
- ✅ **Grille adaptative** (mobile, tablette, desktop)
- ✅ **Animations fluides** au survol
- ✅ **Transitions CSS** pour une meilleure UX

## 🚀 Démarrage

### **1. Services Backend**
```bash
# Démarrer Eureka Server (port 8761)
# Démarrer GatewayService (port 8088)
# Démarrer TransactionHistoryService
# Démarrer IncidentReportService
# Démarrer ResponseISOService
# Démarrer AuthService
```

### **2. Frontend Angular**
```bash
cd FRONT_END/main
npm start
```

### **3. Accéder au Dashboard**
```
http://localhost:4200/dashboard
```

## 🔍 Debugging

### **Vérifier la Connectivité**
```bash
# GatewayService
curl http://localhost:8088/api/history/count

# Services individuels
curl http://localhost:8081/history/count
curl http://localhost:8082/incidents/count
curl http://localhost:8088/response/history/count-success
```

### **Logs Angular**
Ouvrir la console du navigateur (F12) pour voir :
- Les requêtes HTTP
- Les erreurs de connexion
- Les données reçues

## 📈 Prochaines Étapes

- [ ] Ajouter des graphiques interactifs
- [ ] Implémenter des alertes en temps réel
- [ ] Ajouter des filtres par période
- [ ] Créer des exports PDF/Excel
- [ ] Ajouter des notifications push 