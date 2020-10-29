import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChooseyourownPage } from './chooseyourown.page';

const routes: Routes = [
  {
    path: '',
    component: ChooseyourownPage
  },
  {
    path: 'pickyoursauce',
    loadChildren: () => import('./pickyoursauce/pickyoursauce.module').then( m => m.PickyoursaucePageModule)
  },
  {
    path: 'reviewyourseafood',
    loadChildren: () => import('./reviewyourseafood/reviewyourseafood.module').then( m => m.ReviewyourseafoodPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChooseyourownPageRoutingModule {}
