# 🚀 Test Rapide des Services

## 🔍 Diagnostic Immédiat

### **1. Vérifier si les services sont démarrés**

```bash
# Test rapide avec curl
curl -s http://localhost:8088/api/history/count
curl -s http://localhost:8088/api/incidents/count
curl -s http://localhost:8088/api/response/history/count-success
```

### **2. Vérifier le GatewayService**

```bash
# Test du gateway
curl -s http://localhost:8088/actuator/health
```

### **3. Vérifier Eureka**

```bash
# Test d'Eureka
curl -s http://localhost:8761/eureka/apps
```

## 🛠️ Solutions Rapides

### **Si tous les services retournent 0 :**

1. **Démarrer les services dans l'ordre :**
   ```bash
   # 1. Eureka Server
   cd eureka-server && mvn spring-boot:run
   
   # 2. GatewayService
   cd GatewayService && mvn spring-boot:run
   
   # 3. Services
   cd TransactionHistoryService && mvn spring-boot:run
   cd IncidentReportService && mvn spring-boot:run
   cd ResponseISOService && mvn spring-boot:run
   ```

2. **Attendre 30 secondes** que les services s'enregistrent

3. **Tester à nouveau :**
   ```bash
   curl http://localhost:8088/api/history/count
   ```

### **Si erreur de connexion :**

1. **Vérifier les ports :**
   - Eureka: 8761
   - Gateway: 8088
   - Services: ports différents

2. **Vérifier les logs** de chaque service

3. **Redémarrer le GatewayService**

## 📊 Test du Dashboard

1. **Ouvrir la console du navigateur** (F12)
2. **Aller sur** `http://localhost:4200/dashboard`
3. **Vérifier les logs** dans la console
4. **Actualiser la page** si nécessaire

## 🎯 Résultats Attendus

- ✅ **Services démarrés** : Nombres > 0
- ❌ **Services non démarrés** : Erreurs de connexion
- ⚠️ **Services démarrés mais vides** : Nombres = 0

## 🔧 Debugging

### **Logs Angular (Console navigateur) :**
```
🔄 Début de récupération des statistiques dashboard...
📡 URLs des transactions: {...}
✅ Total transactions: 42
✅ Transactions aujourd'hui: 5
📊 Résultats reçus: {...}
✅ Statistiques finales: {...}
```

### **Logs Services (Terminal) :**
```
INFO  - Service démarré sur le port XXXX
INFO  - Enregistré dans Eureka
INFO  - Endpoint /count accessible
```

## 🚨 Problèmes Courants

1. **"Connection refused"** → Services non démarrés
2. **"404 Not Found"** → Routes mal configurées
3. **"CORS error"** → Configuration CORS manquante
4. **"0" partout** → Bases de données vides

## ✅ Vérification Finale

Après correction :
- Dashboard affiche des nombres > 0
- Chaque bloc a sa couleur distincte
- Bouton "Actualiser" fonctionne
- Pas d'erreurs dans la console 