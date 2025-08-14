import { NavItem } from './nav-item/nav-item';

console.log('Chargement des navItems...');

export const navItems: NavItem[] = [
  {
    navCap: 'Dashboard',
    roles: ['ADMIN']
  },
  {
    displayName: 'Dashboard',
    iconName: 'layout-grid-add',
    route: '/dashboard',
    roles: ['ADMIN']
  },
  {
    navCap: 'Génération ISO'
  },
  {
    displayName: 'Génération de Messages',
    iconName: 'message-circle',
    route: '/message-form'
  },
  {
    displayName: 'Réponse ISO',
    iconName: 'send',
    route: '/iso-response'
  },
  {
    navCap: 'Gestion Financière'
  },
  {
    displayName: 'Historique des Transactions',
    iconName: 'history',
    route: '/transaction-history'
  },
  {
    displayName: 'Depack Message',
    iconName: 'box',
    route: '/iso-depacker'
  },
  {
    navCap: 'Monitoring & Incidents'
  },
  {
    displayName: 'Logs & Monitoring',
    iconName: 'file-text',
    route: '/logs'
  },
  {
    displayName: 'Gestion Incidents',
    iconName: 'tool',
    route: '/incidents'
  },
  {
    navCap: 'Administration',
    roles: ['ADMIN']
  },
  {
    displayName: 'Gestion Utilisateurs',
    iconName: 'users',
    route: '/users',
    roles: ['ADMIN']
  },
  {
    displayName: 'Gestion des Comptes',
    iconName: 'credit-card',
    route: '/accounts',
    roles: ['ADMIN']
  },
  {
    displayName: 'Gestion des Cartes',
    iconName: 'credit-card',
    route: '/cards',
    roles: ['ADMIN']
  },
  {
    navCap: 'Profil Utilisateur'
  },
  {
    displayName: 'Mon Profil',
    iconName: 'user',
    route: '/profile'
  },
  {
    displayName: 'Déconnexion',
    iconName: 'log-out',
    action: 'logout'
  }
];

