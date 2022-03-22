import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '@app/login/login.component';
import { AdminComponent } from '@app/admin/admin.component';
import { AuthGuardService } from '@core/services';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [AuthGuardService],
    children: [
      {
        path: '',
        // loadChildren: '@app/admin/admin.module#AdminModule'
        loadChildren: () => import('@app/admin/admin.module').then(m => m.AdminModule)
      }
    ]
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy'})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
