# 🔧 Dépannage du Problème des Comptes

## 🚨 Problème : Dashboard affiche "0" pour les comptes

Le dashboard affiche "0" pour "Total Comptes" alors qu'il y a des utilisateurs dans la base de données.

## 🔍 Diagnostic

### **1. Vérifier l'Endpoint Correct**

Le dashboard appelle maintenant `/api/users/count` au lieu de `/api/accounts/count`.

### **2. Vérifier les Services**

```bash
# Vérifier que auth-service2 est démarré
curl http://localhost:8088/api/users/count

# Vérifier que le gateway fonctionne
curl http://localhost:8088/actuator/health
```

### **3. Vérifier l'Authentification**

Le dashboard nécessite un token JWT valide pour accéder aux endpoints.

## 🛠️ Solutions

### **Solution 1 : Auth-Service2 Non Démarré**

**Symptômes :** Erreur de connexion ou timeout

**Actions :**
1. Démarrer auth-service2
2. Vérifier qu'il s'enregistre dans Eureka
3. Vérifier les logs du service

### **Solution 2 : Problème d'Authentification**

**Symptômes :** Erreur 401 Unauthorized

**Actions :**
1. Se connecter à l'application
2. Vérifier que le token est valide
3. Vérifier les logs du gateway

### **Solution 3 : Problème de Routing**

**Symptômes :** Erreur 404 Not Found

**Actions :**
1. Vérifier la configuration du GatewayService
2. Vérifier que la route `/api/users/**` pointe vers auth-service2
3. Redémarrer le GatewayService

## 📊 Test Manuel

### **Test avec curl :**

```bash
# Test sans authentification
curl http://localhost:8088/api/users/count

# Test avec token (remplacez YOUR_TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8088/api/users/count
```

### **Test dans la console du navigateur :**

```javascript
// Vérifier le token
console.log('Token:', localStorage.getItem('token'));

// Tester l'endpoint
fetch('http://localhost:8088/api/users/count', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => response.json())
.then(data => console.log('Utilisateurs:', data))
.catch(error => console.error('Erreur:', error));
```

## 🎯 Endpoints Attendus

### **Auth-Service2**
- `GET /api/users/count` → `number` (nombre d'utilisateurs)

### **GatewayService**
- Route `/api/users/**` → `auth-service2`
- Authentification JWT requise

## 🚀 Ordre de Démarrage

1. **Eureka Server** (port 8761)
2. **GatewayService** (port 8088)
3. **Auth-Service2** (vérifier le port)
4. **Frontend Angular** (port 4200)

## 📝 Logs Utiles

### **Auth-Service2 Logs**
```bash
# Vérifier que le service démarre
tail -f auth-service2.log

# Vérifier l'endpoint
curl http://localhost:8088/api/users/count
```

### **GatewayService Logs**
```bash
# Vérifier les routes
curl http://localhost:8088/actuator/gateway/routes
```

## ✅ Vérification Finale

Après correction :

1. **Se connecter** à l'application
2. **Actualiser le dashboard**
3. **Vérifier** que "Total Comptes" affiche le bon nombre
4. **Vérifier** que "26 utilisateurs actifs" s'affiche

## 🆘 Support

Si le problème persiste :
1. Vérifier les logs de tous les services
2. Tester l'endpoint directement
3. Vérifier la configuration réseau
4. Redémarrer tous les services dans l'ordre 