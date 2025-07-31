# 🔐 Debug de l'Authentification Dashboard

## 🚨 Problème : Erreur 401 (Unauthorized)

Le dashboard affiche des erreurs 401 car les endpoints nécessitent une authentification JWT.

## 🔍 Diagnostic

### **1. Vérifier si l'utilisateur est connecté**

Ouvrez la console du navigateur (F12) et tapez :

```javascript
// Vérifier si un token existe
console.log('Token:', localStorage.getItem('token'));

// Vérifier si l'utilisateur est connecté
console.log('User:', localStorage.getItem('user'));
```

### **2. Vérifier la validité du token**

```javascript
// Décoder le token JWT (si présent)
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Token exp:', new Date(payload.exp * 1000));
  console.log('Token valide:', payload.exp * 1000 > Date.now());
}
```

## 🛠️ Solutions

### **Solution 1 : Utilisateur non connecté**

**Symptômes :** `localStorage.getItem('token')` retourne `null`

**Actions :**
1. Aller sur la page de connexion : `http://localhost:4200/login`
2. Se connecter avec des identifiants valides
3. Vérifier que le token est stocké dans localStorage
4. Retourner sur le dashboard

### **Solution 2 : Token expiré**

**Symptômes :** Token présent mais expiré

**Actions :**
1. Se déconnecter
2. Se reconnecter
3. Vérifier la nouvelle date d'expiration

### **Solution 3 : Token invalide**

**Symptômes :** Token présent mais erreur 401 persistante

**Actions :**
1. Vérifier la configuration JWT côté serveur
2. Vérifier que le token est bien envoyé dans les headers
3. Vérifier les logs du serveur

## 🔧 Test Manuel

### **Test avec curl :**

```bash
# Récupérer le token depuis localStorage
TOKEN="votre_token_ici"

# Tester un endpoint avec authentification
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8088/api/history/count
```

### **Test dans la console :**

```javascript
// Tester une requête avec fetch
const token = localStorage.getItem('token');
fetch('http://localhost:8088/api/history/count', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log('Résultat:', data))
.catch(error => console.error('Erreur:', error));
```

## 📊 Logs de Debug

Le service `dashboard-stats.service.ts` affiche maintenant :

```
🔄 Début de récupération des statistiques dashboard...
📡 URLs des transactions: {...}
✅ Total transactions: 42  // Si authentification OK
❌ Erreur total transactions: HttpErrorResponse  // Si 401
```

## 🎯 Vérifications

### **1. Vérifier la connexion :**
- [ ] Utilisateur connecté
- [ ] Token présent dans localStorage
- [ ] Token non expiré

### **2. Vérifier les requêtes :**
- [ ] Headers Authorization inclus
- [ ] Token valide
- [ ] Endpoints accessibles

### **3. Vérifier le serveur :**
- [ ] Services démarrés
- [ ] JWT configuré
- [ ] CORS configuré

## 🚀 Ordre de Résolution

1. **Se connecter** à l'application
2. **Vérifier le token** dans localStorage
3. **Actualiser le dashboard**
4. **Vérifier les logs** dans la console
5. **Tester manuellement** avec curl si nécessaire

## ✅ Résultat Attendu

Après authentification correcte :
- ✅ Dashboard affiche des statistiques réelles
- ✅ Pas d'erreurs 401 dans la console
- ✅ Logs de succès dans le service
- ✅ Couleurs distinctes pour chaque bloc 