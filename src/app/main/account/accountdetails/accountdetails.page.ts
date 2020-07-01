import { Component, OnInit } from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';
import { AccountService } from '../account.service';
import { AccountDetails } from './accountdetails.model';
import { AccountdetailsService } from './accountdetails.service';
import { Order } from '../../cart/order.model';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { OrderdetailsComponent } from './orderdetails/orderdetails.component'
import { OrderService } from '../../cart/order.service';

@Component({
  selector: 'app-accountdetails',
  templateUrl: './accountdetails.page.html',
  styleUrls: ['./accountdetails.page.scss'],
})
export class AccountdetailsPage implements OnInit {
  loadedAccountDetails: AccountDetails[];
  loadedOrders: Order[];
  isLoading = false;
  accountView:string = 'general';

  constructor(
    private accountService: AccountService,
    private accountDetailService: AccountdetailsService,
    private orderService: OrderService, 
    private router: Router,
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.isLoading = true;
    this.accountDetailService.fetchAccountDetails().subscribe(accountDetails => {
      this.loadedAccountDetails = accountDetails;
      this.isLoading = false;
    });
    this.accountDetailService.fetchOrderHistory().subscribe(orders => {
      this.loadedOrders = orders;
    })
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/main/tabs/account');
  }

  onSegmentChange(event: CustomEvent<SegmentChangeEventDetail>){
    switch (event.detail.value){
      case 'general': 
        this.accountView = event.detail.value;
        break;
      case 'order-history':
        this.accountView = event.detail.value;
        break;
      default:
        this.accountView = 'general';
    }
  }

  convertOrderId(id: string) {
    let convertedId = '';
    for (var i = 15; i < id.length; i++){
      convertedId += id.charCodeAt(i).toString();
    }

    return convertedId;
  }

  onOrderDetailsView(order: Order){
    console.log(`Viewing order details for ${order.orderId}`);
    // let orderItems = this.orderService.
    this.modalController
      .create({
        component: OrderdetailsComponent,
        componentProps: { selectedOrder: order }
      })
      .then(modalEl => {
        modalEl.present();
      })
  }

}
