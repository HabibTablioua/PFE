# 🔧 Dépannage des Statistiques Dashboard

## 🚨 Problème : Statistiques affichent "0"

Si votre dashboard affiche des "0" partout, voici comment diagnostiquer et résoudre le problème :

## 🔍 Diagnostic Étape par Étape

### **1. Vérifier les Services Backend**

```bash
# Vérifier que tous les services sont démarrés
curl http://localhost:8088/api/history/count
curl http://localhost:8088/api/incidents/count
curl http://localhost:8088/api/response/history/count-success
curl http://localhost:8088/api/accounts/count
curl http://localhost:8088/api/users/count
```

### **2. Vérifier le GatewayService**

```bash
# Tester le gateway directement
curl http://localhost:8088/actuator/health
```

### **3. Vérifier Eureka Server**

```bash
# Vérifier que les services sont enregistrés
curl http://localhost:8761/eureka/apps
```

## 🛠️ Solutions

### **Solution 1 : Services Non Démarrés**

**Symptômes :** Erreurs de connexion dans la console Angular

**Actions :**
1. Démarrer Eureka Server (port 8761)
2. Démarrer GatewayService (port 8088)
3. Démarrer tous les services :
   - TransactionHistoryService
   - IncidentReportService
   - ResponseISOService
   - AuthService

### **Solution 2 : Problème de Configuration Gateway**

**Symptômes :** Erreur 404 sur les endpoints

**Actions :**
1. Vérifier `application.yml` du GatewayService
2. S'assurer que les routes sont correctement configurées
3. Redémarrer le GatewayService

### **Solution 3 : Problème CORS**

**Symptômes :** Erreurs CORS dans la console

**Actions :**
1. Vérifier la configuration CORS dans le GatewayService
2. Ajouter les headers appropriés

### **Solution 4 : Base de Données Vide**

**Symptômes :** Services accessibles mais retournent 0

**Actions :**
1. Vérifier que les bases de données contiennent des données
2. Insérer des données de test

## 📊 Test Automatique

Exécutez le script de test :

```bash
cd FRONT_END/main
node test-services.js
```

## 🔧 Debugging Angular

### **1. Ouvrir la Console du Navigateur**
- Appuyer sur F12
- Aller dans l'onglet "Console"
- Vérifier les erreurs HTTP

### **2. Vérifier les Requêtes Network**
- Onglet "Network" dans les outils de développement
- Vérifier les requêtes vers `localhost:8088`
- Voir les codes de statut HTTP

### **3. Logs Détaillés**
Le service `dashboard-stats.service.ts` affiche des logs détaillés :
- ✅ Requêtes réussies
- ❌ Erreurs de connexion
- 🔄 Tentatives de reconnexion

## 🎯 Endpoints Attendus

### **TransactionHistoryService**
- `GET /api/history/count` → `number`
- `GET /api/history/per-day` → `List<Map>`
- `GET /api/history/per-status` → `List<Map>`
- `GET /api/history/per-source` → `List<Map>`

### **IncidentReportService**
- `GET /api/incidents/count` → `number`
- `GET /api/incidents/count-non-traite` → `number`
- `GET /api/incidents/count-resolu` → `number`

### **ResponseISOService**
- `GET /api/response/history/count-success` → `number`
- `GET /api/response/history/count-failed` → `number`

### **AccountService**
- `GET /api/accounts/count` → `number`

### **AuthService**
- `GET /api/users/count` → `number`

## 🚀 Ordre de Démarrage Recommandé

1. **Eureka Server** (port 8761)
2. **GatewayService** (port 8088)
3. **TransactionHistoryService**
4. **IncidentReportService**
5. **ResponseISOService**
6. **AuthService**
7. **Frontend Angular** (port 4200)

## 📝 Logs Utiles

### **GatewayService Logs**
```bash
# Vérifier les routes
curl http://localhost:8088/actuator/gateway/routes
```

### **Eureka Logs**
```bash
# Vérifier les services enregistrés
curl http://localhost:8761/eureka/apps
```

### **Service Logs**
Vérifier les logs de chaque service pour voir s'ils démarrent correctement.

## ✅ Vérification Finale

Après avoir résolu le problème :

1. **Actualiser le dashboard** : `http://localhost:4200/dashboard`
2. **Vérifier les statistiques** : Doivent afficher des nombres > 0
3. **Tester le bouton "Actualiser"** : Doit recharger les données
4. **Vérifier les couleurs** : Chaque bloc doit avoir sa couleur distincte

## 🆘 Support

Si le problème persiste :
1. Vérifier les logs de tous les services
2. Tester chaque endpoint individuellement
3. Vérifier la configuration réseau
4. Redémarrer tous les services dans l'ordre 