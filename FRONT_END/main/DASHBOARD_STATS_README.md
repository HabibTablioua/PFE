# Dashboard Statistiques - Guide d'Utilisation

## 📊 Vue d'ensemble

Le dashboard affiche maintenant des statistiques **réelles** basées sur vos services backend existants :

### 🔗 Services Connectés

1. **TransactionHistoryService** (Port 8081)
   - Total des transactions
   - Transactions par jour
   - Répartition par statut
   - Répartition par source

2. **IncidentReportService** (Port 8082)
   - Total des incidents
   - Incidents non traités
   - Incidents résolus

3. **ResponseISOService** (Port 8088)
   - Total des réponses ISO
   - Réponses réussies
   - Réponses échouées

4. **AccountService** (Port 8088)
   - Total des comptes

5. **AuthService** (Port 8080)
   - Total des utilisateurs

## 📈 Statistiques Affichées

### **Transactions**
- **Total Transactions** : Nombre total de transactions enregistrées
- **Transactions Aujourd'hui** : Transactions du jour actuel
- **Répartition par Statut** : Succès, Échec, En cours
- **Répartition par Source** : ATM, POS, Web, etc.

### **Incidents**
- **Total Incidents** : Nombre total d'incidents signalés
- **Incidents Non Traités** : Incidents en attente de traitement
- **Incidents Résolus** : Incidents traités avec succès

### **Réponses ISO**
- **Total Réponses** : Nombre total de réponses ISO générées
- **Réponses Succès** : Réponses avec statut "SUCCESS"
- **Réponses Échouées** : Réponses avec statut "ERROR"

### **Utilisateurs & Comptes**
- **Total Utilisateurs** : Nombre d'utilisateurs actifs
- **Total Comptes** : Nombre de comptes ouverts

## 🔧 Configuration

### **Ports des Services**
```typescript
// config/services.config.ts
TRANSACTION_SERVICE: 'http://localhost:8081'
INCIDENT_SERVICE: 'http://localhost:8082'
RESPONSE_SERVICE: 'http://localhost:8088'
ACCOUNT_SERVICE: 'http://localhost:8088'
AUTH_SERVICE: 'http://localhost:8080'
```

### **Endpoints Utilisés**

#### TransactionHistoryService
- `GET /history/count` - Total des transactions
- `GET /history/per-status` - Répartition par statut
- `GET /history/per-source` - Répartition par source
- `GET /history/per-day` - Transactions par jour

#### IncidentReportService
- `GET /incidents/count` - Total des incidents
- `GET /incidents/count-non-traite` - Incidents non traités
- `GET /incidents/count-resolu` - Incidents résolus

#### ResponseISOService
- `GET /response/history/count-success` - Réponses réussies
- `GET /response/history/count-failed` - Réponses échouées
- `GET /response/history` - Historique des réponses

## 🚀 Utilisation

1. **Démarrer tous les services backend**
2. **Accéder au dashboard** : `http://localhost:4200/dashboard`
3. **Actualiser les données** : Cliquer sur le bouton "Actualiser"

## ⚠️ Gestion d'Erreurs

- **Service indisponible** : Affichage de "Erreur de connexion"
- **Données manquantes** : Valeurs par défaut (0)
- **Logs détaillés** : Vérifier la console du navigateur

## 📝 Personnalisation

### **Ajouter une nouvelle statistique**
1. Ajouter l'endpoint dans `services.config.ts`
2. Créer la méthode dans `dashboard-stats.service.ts`
3. Ajouter la statistique dans `dashboard.component.ts`

### **Modifier les ports**
Éditer `config/services.config.ts` et changer les `BASE_URL`

## 🔍 Debugging

### **Vérifier la connectivité**
```bash
# TransactionHistoryService
curl http://localhost:8081/history/count

# IncidentReportService  
curl http://localhost:8082/incidents/count

# ResponseISOService
curl http://localhost:8088/response/history/count-success
```

### **Logs Angular**
Ouvrir la console du navigateur (F12) pour voir les erreurs de connexion.

## 📊 Prochaines Étapes

- [ ] Ajouter des graphiques avec Chart.js
- [ ] Implémenter des alertes en temps réel
- [ ] Ajouter des filtres par période
- [ ] Créer des exports PDF/Excel des statistiques 