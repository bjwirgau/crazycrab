import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReviewyourseafoodPage } from './reviewyourseafood.page';

const routes: Routes = [
  {
    path: '',
    component: ReviewyourseafoodPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReviewyourseafoodPageRoutingModule {}
