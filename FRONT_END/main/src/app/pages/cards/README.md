# Gestion des Cartes Bancaires

Ce module permet de gérer les cartes bancaires (crédit, débit, prépayées) dans l'application.

## Composants

### 1. CardListComponent
- **Fichier :** `card-list.component.ts`
- **Fonctionnalités :**
  - Affichage de la liste des cartes avec pagination
  - Statistiques (total, actives, bloquées, expirées)
  - Actions : créer, modifier, supprimer
  - Filtrage par statut et type
  - Gestion des alertes (volée, perdue, blacklistée, restreinte)

### 2. CardFormDialogComponent
- **Fichier :** `card-form-dialog.component.ts`
- **Fonctionnalités :**
  - Formulaire de création/modification de carte
  - Validation des champs obligatoires
  - Gestion des dates d'expiration
  - Configuration des alertes et restrictions

### 3. CardDetailComponent
- **Fichier :** `card-detail.component.ts`
- **Fonctionnalités :**
  - Affichage détaillé d'une carte
  - Informations complètes (PAN, titulaire, type, statut)
  - Gestion des alertes visuelles
  - Actions rapides (modifier, supprimer)

## Structure des données

### Entité Card
```typescript
{
  pan: string;                    // Primary Account Number (16 chiffres)
  cardNumber?: string;            // Numéro de carte optionnel
  holderName: string;             // Nom du titulaire
  type: 'DEBIT' | 'CREDIT' | 'PREPAID';
  status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED' | 'SUSPENDED';
  expiryDate: Date;              // Date d'expiration
  issuer?: string;               // Banque émettrice
  allowedOperations?: string;    // Codes d'opérations autorisées
  stolen: boolean;               // Carte volée
  lost: boolean;                 // Carte perdue
  blacklisted: boolean;          // Carte blacklistée
  restricted: boolean;           // Carte restreinte
  createdAt: Date;
  updatedAt: Date;
  account?: Account;             // Compte associé
}
```

## Routes

- **`/cards`** : Liste des cartes (CardListComponent)
- **Navigation depuis le dashboard** : Clic sur la métrique "Cartes Bancaires"

## API Backend

### Endpoints
- `GET /cards` - Liste toutes les cartes
- `GET /cards/{pan}` - Détails d'une carte
- `POST /cards` - Créer une nouvelle carte
- `PUT /cards/{pan}` - Modifier une carte
- `DELETE /cards/{pan}` - Supprimer une carte
- `GET /cards/count` - Nombre total de cartes
- `GET /cards/count/active` - Nombre de cartes actives
- `GET /cards/count/blocked` - Nombre de cartes bloquées
- `GET /cards/status/{status}` - Cartes par statut
- `GET /cards/type/{type}` - Cartes par type

### Authentification
- Tous les endpoints nécessitent un token JWT valide
- Header : `Authorization: Bearer {token}`

## Fonctionnalités

### Gestion des alertes
- **Carte volée** : Icône warning rouge
- **Carte perdue** : Icône GPS désactivé orange
- **Carte blacklistée** : Icône bloc violet
- **Carte restreinte** : Icône cadenas gris

### Validation
- PAN : 16 chiffres exactement
- Nom du titulaire : obligatoire
- Date d'expiration : obligatoire
- Statut et type : avec valeurs par défaut

### Interface utilisateur
- Design moderne avec Material Design
- Tableau responsive avec tri et filtrage
- Statistiques visuelles avec graphiques
- Formulaires intuitifs avec validation en temps réel

## Intégration

### Dashboard
- Métrique "Cartes Bancaires" avec navigation
- Statistiques en temps réel
- Alertes pour les cartes problématiques

### Navigation
- Accessible depuis le menu principal
- Intégrée dans le système de routing
- Protection par AuthGuard

## Dépendances

- Angular Material (UI components)
- Angular Reactive Forms
- Angular Router
- Angular HTTP Client
- Material Icons

## Utilisation

1. **Accéder à la liste** : Naviguer vers `/cards`
2. **Créer une carte** : Clic sur "Nouvelle Carte"
3. **Modifier** : Clic sur l'icône d'édition
4. **Supprimer** : Clic sur l'icône de suppression
5. **Voir les détails** : Clic sur une ligne de la table

## Sécurité

- Validation côté client et serveur
- Masquage des informations sensibles (PIN, CVV)
- Gestion des permissions par rôle
- Audit des actions (création, modification, suppression) 