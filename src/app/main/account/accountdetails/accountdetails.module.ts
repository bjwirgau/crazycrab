import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountdetailsPageRoutingModule } from './accountdetails-routing.module';

import { AccountdetailsPage } from './accountdetails.page';
import { OrderdetailsComponent } from './orderdetails/orderdetails.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AccountdetailsPageRoutingModule
    ],
    declarations: [AccountdetailsPage, OrderdetailsComponent]
})
export class AccountdetailsPageModule {}
