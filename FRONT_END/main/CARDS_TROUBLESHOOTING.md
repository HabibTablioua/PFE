# 🔧 Guide de Dépannage - Cartes Bancaires

## ❌ Problème Identifié

Le bloc "Cartes Bancaires" affiche "0" alors qu'il y a des cartes dans la base de données.

## 🔍 Diagnostic

### 1. Vérification des Services

```bash
# Vérifier que ResponseISOService est démarré
cd ResponseISOService
mvn spring-boot:run

# Vérifier que GatewayService est démarré
cd GatewayService
mvn spring-boot:run
```

### 2. Vérification des Logs

Regardez les logs de ResponseISOService pour voir :
- Si CardController est détecté au démarrage
- S'il y a des erreurs de base de données
- Si les endpoints sont bien enregistrés

### 3. Test des Endpoints

Utilisez le script `debug-cards-endpoint.js` dans la console du navigateur pour tester :
- Connectivité du service
- Endpoints avec/sans authentification
- Comparaison avec d'autres endpoints

## 🛠️ Solutions Possibles

### Solution 1: Redémarrage du Service

```bash
# Arrêter ResponseISOService (Ctrl+C)
# Puis redémarrer
cd ResponseISOService
mvn spring-boot:run
```

### Solution 2: Vérification de la Base de Données

```sql
-- Vérifier que la table card existe
SHOW TABLES;

-- Vérifier le contenu de la table card
SELECT COUNT(*) FROM card;
SELECT * FROM card LIMIT 5;
```

### Solution 3: Vérification du Package Scanning

Le CardController doit être dans le bon package :
```
org.example.responseisoservice.Controller.CardController
```

### Solution 4: Test Direct de l'Endpoint

```bash
# Test direct sur ResponseISOService
curl -X GET http://localhost:8080/cards/count

# Test via Gateway
curl -X GET http://localhost:8088/api/cards/count
```

## 📊 Tests de Diagnostic

### Test 1: Vérification de la Connectivité

```javascript
// Dans la console du navigateur
fetch('http://localhost:8088/api/cards/count')
  .then(response => response.json())
  .then(data => console.log('Cartes:', data))
  .catch(error => console.error('Erreur:', error));
```

### Test 2: Comparaison avec d'autres Endpoints

```javascript
// Tester les endpoints qui fonctionnent
fetch('http://localhost:8088/api/accounts/count')
  .then(response => response.json())
  .then(data => console.log('Comptes:', data));

fetch('http://localhost:8088/api/cards/count')
  .then(response => response.json())
  .then(data => console.log('Cartes:', data));
```

### Test 3: Test avec Authentification

```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:8088/api/cards/count', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(response => response.json())
.then(data => console.log('Cartes avec auth:', data));
```

## 🔧 Corrections Appliquées

### 1. Ajout de @CrossOrigin

```java
@RestController
@RequestMapping("/cards")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CardController {
```

### 2. Ajout de @ComponentScan

```java
@SpringBootApplication
@ComponentScan(basePackages = {"org.example.responseisoservice"})
public class ResponseIsoServiceApplication {
```

## 📋 Checklist de Vérification

- [ ] ResponseISOService est démarré sur le port 8080
- [ ] GatewayService est démarré sur le port 8088
- [ ] La base de données contient des cartes
- [ ] CardController est détecté au démarrage
- [ ] L'endpoint `/api/cards/count` répond
- [ ] L'authentification fonctionne
- [ ] Le frontend peut accéder à l'endpoint

## 🚨 Erreurs Communes

### Erreur 1: "404 Not Found"
- **Cause** : CardController non détecté
- **Solution** : Vérifier le package et redémarrer

### Erreur 2: "401 Unauthorized"
- **Cause** : Problème d'authentification
- **Solution** : Vérifier le token JWT

### Erreur 3: "500 Internal Server Error"
- **Cause** : Problème de base de données
- **Solution** : Vérifier la connexion DB

### Erreur 4: "0 cartes" affiché
- **Cause** : Base de données vide ou problème de requête
- **Solution** : Vérifier le contenu de la table card

## 📝 Logs Utiles

```bash
# Dans ResponseISOService
[CardController] GET /cards/count appelé
[CardRepository] count() appelé
[CardRepository] countByStatus() appelé
```

## 🎯 Résultat Attendu

Après correction, le dashboard devrait afficher :
- Le nombre réel de cartes dans la base de données
- Le bloc teal "Cartes Bancaires" avec la bonne valeur
- Pas d'erreurs dans la console du navigateur

Utilisez les scripts de test pour diagnostiquer et corriger le problème ! 🔧 