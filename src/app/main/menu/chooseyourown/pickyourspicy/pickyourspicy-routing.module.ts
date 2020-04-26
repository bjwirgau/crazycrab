import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickyourspicyPage } from './pickyourspicy.page';

const routes: Routes = [
  {
    path: '',
    component: PickyourspicyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickyourspicyPageRoutingModule {}
