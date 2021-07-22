import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular';
import { OrderItemOptionsComponent } from './order-items/order-item-options/order-item-options.component';
import { OrderItemsComponent } from './order-items/order-items.component';

import { OrdersPageRoutingModule } from './orders-routing.module';
import { OrdersPage } from './orders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersPageRoutingModule
  ],
  declarations: [
    OrdersPage,
    OrderItemsComponent,
    OrderItemOptionsComponent
  ]
})
export class OrdersPageModule {}
