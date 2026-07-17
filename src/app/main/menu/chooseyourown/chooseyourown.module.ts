import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChooseyourownPageRoutingModule } from './chooseyourown-routing.module';

import { ChooseyourownPage } from './chooseyourown.page';
import { ValidationComponent } from './validation/validation.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ChooseyourownPageRoutingModule
    ],
    declarations: [ChooseyourownPage, ValidationComponent]
})
export class ChooseyourownPageModule {}
