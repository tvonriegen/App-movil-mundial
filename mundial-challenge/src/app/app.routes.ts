import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'prediccion/:id',
    loadComponent: () =>
      import('./prediccion/prediccion.page').then((m) => m.PrediccionPage),
    canActivate: [authGuard],
  },
  {
    path: 'ranking/:id',
    loadComponent: () =>
      import('./ranking/ranking.page').then((m) => m.RankingPage),
    canActivate: [authGuard],
  },
];