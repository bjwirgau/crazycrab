import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickyourspicyPageRoutingModule } from './pickyourspicy-routing.module';

import { PickyourspicyPage } from './pickyourspicy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickyourspicyPageRoutingModule
  ],
  declarations: [PickyourspicyPage]
})
export class PickyourspicyPageModule {}
