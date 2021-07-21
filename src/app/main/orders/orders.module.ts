import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { OrdersPageRoutingModule } from './orders-routing.module';
import { OrdersPage } from './orders.page';
import { BoardModule } from 'src/app/components/board/board.module';

@NgModule({
  imports: [
    FormsModule,
    IonicModule,
    OrdersPageRoutingModule,
    BoardModule
  ],
  declarations: [
    OrdersPage
  ]
})
export class OrdersPageModule {}
