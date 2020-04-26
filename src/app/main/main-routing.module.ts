import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';
import { AccountGuard } from './account/account.gaurd';

const routes: Routes = [
  {
    path: 'tabs',
    component: MainPage,
    children: [
      {
        path: 'newmenu',
        loadChildren: () => import('./menu/menu.module').then( m => m.MenuPageModule),
        canLoad: [AccountGuard]
      },
      {
        path: 'account',
        loadChildren: () => import('./account/account.module').then( m => m.AccountPageModule),
      },
      {
        path: 'rewards',
        loadChildren: () => import('./rewards/rewards.module').then( m => m.RewardsPageModule),
        canLoad: [AccountGuard]
      },
      {
        path: 'location',
        loadChildren: () => import('./location/location.module').then( m => m.LocationPageModule),
        canLoad: [AccountGuard]
      },
      {
        path: 'cart',
        loadChildren: () => import('./cart/cart.module').then( m => m.CartPageModule),
        canLoad: [AccountGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
