import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountPage } from './account.page';
import { AccountGuard } from './account.gaurd';

const routes: Routes = [
  {
    path: '',
    component: AccountPage
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'accountdetails',
    loadChildren: () => import('./accountdetails/accountdetails.module').then( m => m.AccountdetailsPageModule),
    canLoad: [AccountGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountPageRoutingModule {}
