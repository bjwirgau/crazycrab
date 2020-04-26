import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickyoursaucePageRoutingModule } from './pickyoursauce-routing.module';

import { PickyoursaucePage } from './pickyoursauce.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickyoursaucePageRoutingModule
  ],
  declarations: [PickyoursaucePage]
})
export class PickyoursaucePageModule {}
