import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoresPageRoutingModule } from './stores-routing.module';

import { StoresPage } from './stores.page';
import { StoreComponent } from './store/store.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoresPageRoutingModule
  ],
  declarations: [
    StoresPage,
    StoreComponent
  ]
})
export class StoresPageModule {}
