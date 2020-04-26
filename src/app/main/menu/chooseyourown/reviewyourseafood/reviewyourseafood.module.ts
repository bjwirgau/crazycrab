import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReviewyourseafoodPageRoutingModule } from './reviewyourseafood-routing.module';

import { ReviewyourseafoodPage } from './reviewyourseafood.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReviewyourseafoodPageRoutingModule
  ],
  declarations: [ReviewyourseafoodPage]
})
export class ReviewyourseafoodPageModule {}
