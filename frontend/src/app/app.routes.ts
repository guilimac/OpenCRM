import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./core/auth/features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./core/auth/features/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'register',
    redirectTo: 'signup',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'pipeline',
        pathMatch: 'full',
      },
      {
        path: 'pipeline',
        loadComponent: () =>
          import('./domains/opportunity/features/pipeline-kanban/pipeline-kanban.component').then(
            (m) => m.PipelineKanbanComponent,
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./domains/customer/features/customer-list/customer-list.component').then(
            (m) => m.CustomerListComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
