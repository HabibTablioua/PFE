import { Routes } from '@angular/router';
// import { AppFormsComponent } from './forms/forms.component';
// import { IsoMessageFormComponent } from './forms/iso-message-form.component';

// ui
import { AppBadgeComponent } from './badge/badge.component';
import { AppChipsComponent } from './chips/chips.component';
import { AppListsComponent } from './lists/lists.component';
import { AppMenuComponent } from './menu/menu.component';
import { AppTooltipsComponent } from './tooltips/tooltips.component';
import { AppTablesComponent } from './tables/tables.component';

export const UiComponentsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'badge',
        component: AppBadgeComponent,
      },
      {
        path: 'chips',
        component: AppChipsComponent,
      },
      {
        path: 'lists',
        component: AppListsComponent,
      },
      {
        path: 'menu',
        component: AppMenuComponent,
      },
      {
        path: 'tooltips',
        component: AppTooltipsComponent,
      },
      
      {
        path: 'tables',
        component: AppTablesComponent,
      },
      // { path: 'forms', component: AppFormsComponent },
      // { path: 'forms/message', component: IsoMessageFormComponent },
    ],
  },
];
