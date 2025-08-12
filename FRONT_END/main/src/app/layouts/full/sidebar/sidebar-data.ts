import { NavItem } from './nav-item/nav-item';

console.log('Chargement des navItems...');

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'layout-grid-add',
    route: '/dashboard',
  },
  {
    navCap: 'Gestion Transactions',
  },
  {
    displayName: 'Historique des Transactions',
    iconName: 'history',
    route: '/transaction-history',
  },
  {
    displayName: 'Depack Message',
    iconName: 'box',
    route: '/iso-depacker',
  },
  {
    displayName: 'Message',
    iconName: 'message-circle',
    route: '/message-form',
  },
  {
    displayName: 'Logs',
    iconName: 'file-text',
    route: '/dashboard/logs-monitoring',
  },
  {
    navCap: 'Gestion Utilisateurs',
  },
  {
    displayName: 'Users',
    iconName: 'users',
    route: '/users',
  },
  {
    navCap: 'Gestion des Comptes',
  },
  {
    displayName: 'Gestion des Comptes',
    iconName: 'credit-card',
    route: '/accounts',
  },
  {
    displayName: 'Gestion des Cartes',
    iconName: 'credit-card',
    route: '/cards',
  },

  {
    navCap: 'Gestion Incidents',
  },
  {
    displayName: 'Gestion Incidents',
    iconName: 'tool',
    route: '/dashboard/incidents',
  },
  {
    navCap: 'ISO',
  },
  {
    displayName: 'Réponse',
    iconName: 'send',
    route: '/dashboard/iso-response',
  },
  {
    navCap: 'Auth',
  },
  {
    displayName: 'Login',
    iconName: 'login',
    route: '/authentication/login',
  },
  {
    displayName: 'Register',
    iconName: 'user-plus',
    route: '/authentication/register',
  },
];
