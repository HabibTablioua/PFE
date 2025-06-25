import { NavItem } from './nav-item/nav-item';

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
    displayName: 'Message',
    iconName: 'message-circle',
    route: '/message-form',
  },
  {
    displayName: 'Depack Message',
    iconName: 'box',
    route: '/iso-depacker',
  },
  {
    displayName: 'Historique des Transactions',
    iconName: 'history',
    route: '/transaction-history',
  },
  {
    displayName: 'Logs',
    iconName: 'file-text',
    route: '/dashboard/logs-monitoring',
  },
  {
    displayName: 'Users',
    iconName: 'users',
    route: '/users',
  },
  {
    navCap: 'Auth',
  },
  {
    displayName: 'Login',
    iconName: 'login',
    route: '/authentication',
    children: [
      {
        displayName: 'Login',
        iconName: 'point',
        route: '/authentication/login',
      },
    ],
  },
  {
    displayName: 'Register',
    iconName: 'user-plus',
    route: '/authentication',
    children: [
      {
        displayName: 'Register',
        iconName: 'point',
        route: '/authentication/register',
      },
    ],
  },
];
