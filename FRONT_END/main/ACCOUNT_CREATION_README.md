# Fonctionnalité "Nouveau Compte" - Documentation

## Vue d'ensemble

La fonctionnalité "Nouveau Compte" permet de créer des comptes bancaires avec validation complète des données et intégration avec le système ISO 8583.

## Fonctionnalités

### ✅ Validation Avancée
- **Validation Luhn** : Vérification automatique de la validité du PAN selon l'algorithme de Luhn
- **Vérification d'unicité** : Contrôle en temps réel si le PAN existe déjà
- **Validation en temps réel** : Feedback immédiat sur la validité des données

### ✅ Interface Utilisateur
- **Formulaire intuitif** : Interface moderne avec Material Design
- **Génération automatique** : Bouton pour générer un PAN valide
- **Indicateurs visuels** : Statut en temps réel du PAN (valide, invalide, en cours de vérification)
- **Messages d'erreur** : Feedback précis sur les erreurs de validation

### ✅ Sécurité
- **Validation côté client et serveur** : Double validation pour la sécurité
- **Authentification JWT** : Toutes les requêtes sont authentifiées
- **Validation des données** : Contrôle strict des entrées utilisateur

## Utilisation

### 1. Accès au formulaire
- Naviguez vers la page "Gestion des Comptes"
- Cliquez sur le bouton "Nouveau Compte"

### 2. Remplissage du formulaire

#### Informations de base
- **PAN** : 16 chiffres requis, doit respecter l'algorithme de Luhn
- **Numéro de compte** : Identifiant unique du compte
- **Nom du titulaire** : Nom complet du propriétaire
- **Email** : Adresse email valide

#### Informations financières
- **Solde initial** : Montant positif en devise
- **Devise** : MAD (par défaut), USD, EUR

#### Statut et type
- **Statut** : OPEN (par défaut), CLOSED, SUSPENDED
- **Type** : CURRENT (par défaut), SAVINGS, BUSINESS

#### Restrictions (optionnelles)
- **Carte volée** : Marquer comme volée
- **Carte perdue** : Marquer comme perdue
- **Blacklisté** : Compte en liste noire
- **Restreint** : Compte avec restrictions

#### Opérations autorisées
- **Codes d'opérations** : Liste séparée par des virgules
- Exemple : `200000,310000,400000`

### 3. Validation et soumission
- Le formulaire se valide automatiquement
- Les erreurs sont affichées en temps réel
- Le bouton de soumission est désactivé si le formulaire est invalide
- Confirmation visuelle lors de la création réussie

## Architecture Technique

### Frontend (Angular)
```
src/app/pages/accounts/
├── account-form.component.ts    # Logique du formulaire
├── account-form.component.html  # Template du formulaire
└── account-form.component.spec.ts # Tests unitaires

src/app/services/
└── account.service.ts          # Service pour les API
```

### Backend (Spring Boot)
```
ResponseISOService/src/main/java/org/example/responseisoservice/
├── Controller/
│   └── AccountController.java   # Endpoints REST
├── Entity/
│   └── Account.java            # Modèle de données
└── repository/
    └── AccountRepository.java   # Accès aux données
```

## API Endpoints

### Création de compte
```http
POST /api/accounts
Content-Type: application/json
Authorization: Bearer <token>

{
  "pan": "4532015112830366",
  "accountNumber": "ACC001",
  "holderName": "John Doe",
  "balance": 1000.00,
  "currency": "MAD",
  "status": "OPEN",
  "type": "CURRENT",
  "email": "john@example.com",
  "stolen": false,
  "lost": false,
  "blacklisted": false,
  "restricted": false,
  "allowedOperations": "200000,310000,400000"
}
```

### Vérification d'existence
```http
GET /api/accounts/{pan}
Authorization: Bearer <token>
```

## Validation Luhn

L'algorithme de Luhn est utilisé pour valider les numéros de cartes bancaires :

1. Parcourir le PAN de droite à gauche
2. Pour chaque chiffre en position paire (en partant de la droite) :
   - Multiplier par 2
   - Si le résultat > 9, soustraire 9
3. Additionner tous les chiffres
4. Si la somme est divisible par 10, le PAN est valide

### Exemple
PAN : `4532015112830366`
- Calcul : 6×2=12→3 + 3 + 0×2=0 + 8 + 3×2=6 + 1 + 2×2=4 + 1 + 1×2=2 + 5 + 0×2=0 + 2 + 3×2=6 + 2 + 5×2=10→1 + 4
- Somme : 3+3+0+8+6+1+4+1+2+5+0+2+6+2+1+4 = 48
- 48 % 10 = 8 ≠ 0 → PAN invalide

## Gestion des Erreurs

### Erreurs côté client
- **PAN invalide** : Format incorrect ou ne respecte pas Luhn
- **PAN existant** : Le numéro existe déjà en base
- **Champs requis** : Validation des champs obligatoires
- **Format email** : Validation du format d'email

### Erreurs côté serveur
- **400 Bad Request** : Données invalides
- **401 Unauthorized** : Token JWT invalide
- **403 Forbidden** : Permissions insuffisantes
- **500 Internal Server Error** : Erreur serveur

## Tests

### Tests unitaires
```bash
# Frontend
ng test --include="**/account-form.component.spec.ts"

# Backend
mvn test -Dtest=AccountControllerTest
```

### Tests d'intégration
```bash
# Démarrer les services
docker-compose up -d

# Tester l'API
curl -X POST http://localhost:8088/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "pan": "4532015112830366",
    "accountNumber": "TEST001",
    "holderName": "Test User",
    "balance": 1000.00,
    "currency": "MAD",
    "status": "OPEN",
    "type": "CURRENT",
    "email": "test@example.com"
  }'
```

## Déploiement

### Frontend
```bash
cd FRONT_END/main
npm install
ng build --prod
```

### Backend
```bash
cd ResponseISOService
mvn clean package
java -jar target/ResponseISOService-0.0.1-SNAPSHOT.jar
```

## Sécurité

### Recommandations
1. **Chiffrement** : Chiffrer les données sensibles en production
2. **Rate Limiting** : Limiter le nombre de tentatives de création
3. **Audit Trail** : Logger toutes les créations de comptes
4. **Validation stricte** : Valider toutes les entrées utilisateur

### Configuration
```yaml
# application.properties
jwt.secret=your-secret-key
spring.jpa.hibernate.ddl-auto=update
spring.datasource.url=jdbc:mysql://localhost:3306/responseiso_db
```

## Support

Pour toute question ou problème :
1. Vérifiez les logs de l'application
2. Consultez la documentation API
3. Contactez l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024  
**Auteur** : Équipe PFE 