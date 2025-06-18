# Page de Gestion des Utilisateurs

## Vue d'ensemble

Cette page permet aux administrateurs de gérer les utilisateurs de l'application. Elle offre une interface moderne et intuitive pour créer, modifier, supprimer et rechercher des utilisateurs.

## Fonctionnalités

### 🔍 Recherche et Filtrage
- Recherche en temps réel par prénom, nom ou email
- Tri par colonnes (ID, prénom, nom, email)
- Pagination automatique

### 📋 Gestion des Utilisateurs
- **Ajouter un utilisateur** : Formulaire modal avec validation
- **Modifier un utilisateur** : Édition des informations existantes
- **Supprimer un utilisateur** : Suppression individuelle avec confirmation
- **Suppression multiple** : Sélection et suppression de plusieurs utilisateurs

### 🛡️ Sécurité
- Accès protégé par le rôle ADMIN
- Validation côté client et serveur
- Gestion des tokens JWT

### 🎨 Interface Utilisateur
- Design moderne avec palette HPS (rouge → orange → jaune)
- Responsive design pour mobile et desktop
- Animations et transitions fluides
- Notifications toast pour le feedback utilisateur

## Structure des Fichiers

```
users/
├── users.component.ts          # Logique du composant
├── users.component.html        # Template HTML
├── users.component.scss        # Styles SCSS
└── README.md                   # Documentation
```

## Services Utilisés

### UserService
Service dédié à la gestion des utilisateurs avec les méthodes suivantes :

- `getUsers()` : Récupérer tous les utilisateurs
- `createUser(userData)` : Créer un nouvel utilisateur
- `updateUser(id, userData)` : Modifier un utilisateur
- `deleteUser(id)` : Supprimer un utilisateur
- `deleteMultipleUsers(ids)` : Supprimer plusieurs utilisateurs
- `validateUser(userData)` : Validation côté client

### AuthService
Service d'authentification pour la gestion des tokens et rôles.

## API Endpoints

Les appels API sont dirigés vers le gateway service :

- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/{id}` - Détail d'un utilisateur
- `GET /api/users/email/{email}` - Recherche par email
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/{id}` - Modifier un utilisateur
- `DELETE /api/users/{id}` - Supprimer un utilisateur
- `POST /api/users/delete-multiple` - Supprimer plusieurs utilisateurs

## Rôles Disponibles

- **ADMIN** : Administrateur (accès complet)
- **MANAGER** : Manager (accès limité)
- **USER** : Utilisateur standard

## Validation des Données

### Côté Client
- Prénom et nom : minimum 2 caractères
- Email : format valide
- Mot de passe : minimum 6 caractères
- Rôles : au moins un rôle sélectionné

### Côté Serveur
- Validation des données reçues
- Vérification des permissions
- Gestion des erreurs

## Composants Réutilisables

### ConfirmationDialogComponent
Dialogue de confirmation pour les actions destructives avec :
- Titre et message personnalisables
- Types visuels (warning, danger, info)
- Boutons d'action configurables

## Styles et Thème

### Palette de Couleurs HPS
- Rouge principal : `#B71C1C`
- Orange : `#F57C00`
- Jaune : `#FBC02D`

### Classes CSS Utilitaires
- `.success-snackbar` : Notifications de succès
- `.error-snackbar` : Notifications d'erreur
- `.warning-snackbar` : Notifications d'avertissement

## Responsive Design

La page s'adapte automatiquement aux différentes tailles d'écran :

- **Desktop** : Affichage complet avec sidebar
- **Tablet** : Adaptation des colonnes
- **Mobile** : Mode compact avec navigation tactile

## Animations

- Fade-in au chargement de la page
- Hover effects sur les boutons et lignes
- Transitions fluides pour les dialogues
- Animations de scale pour les interactions

## Gestion des Erreurs

- Affichage des erreurs de validation
- Notifications d'erreur API
- Gestion des timeouts
- Fallback pour les données manquantes

## Performance

- Lazy loading des composants
- Pagination côté serveur
- Debouncing pour la recherche
- Optimisation des requêtes API

## Tests

### Tests Unitaires
- Validation des formulaires
- Gestion des états
- Appels API

### Tests d'Intégration
- Navigation et routage
- Interactions utilisateur
- Responsive design

## Déploiement

La page est prête pour la production avec :
- Code optimisé et minifié
- Gestion des environnements
- Configuration des variables d'environnement
- Monitoring et logging

## Maintenance

### Mises à Jour
- Vérification de la compatibilité des APIs
- Tests de régression
- Documentation des changements

### Support
- Gestion des bugs
- Améliorations continues
- Feedback utilisateur 