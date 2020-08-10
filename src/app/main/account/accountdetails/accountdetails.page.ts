import { Component, OnInit, OnDestroy } from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';
import { AccountService } from '../account.service';
import { AccountDetails } from './accountdetails.model';
import { AccountdetailsService } from './accountdetails.service';
import { Order } from '../../cart/order.model';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { OrderdetailsComponent } from './orderdetails/orderdetails.component';
import { LocationService } from '../../location/location.service';
import { NgForm } from '@angular/forms';
import { StoreLocation } from '../../location/location.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accountdetails',
  templateUrl: './accountdetails.page.html',
  styleUrls: ['./accountdetails.page.scss'],
})
export class AccountdetailsPage implements OnInit, OnDestroy {
  loadedAccountDetails: AccountDetails[];
  loadedOrders: Order[];
  loadedLocations: StoreLocation[];
  isLoading = false;
  updating = false;
  updated = false;
  accountView:string = 'general';
  compareWith: any;
  defaultLocation:string;

  accountDetailsSubscription: Subscription;
  fetchAccountSubscription: Subscription;
  fetchOrderHistorySubscription: Subscription;
  locationSubscription: Subscription;
  saveAccountSubscription: Subscription;


  constructor(
    private accountService: AccountService,
    private accountDetailService: AccountdetailsService,
    private locationService: LocationService, 
    private router: Router,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.compareWith = this.compareWithFn;
  }

  ngOnDestroy(){}

  ionViewWillEnter() {
    this.isLoading = true;
    this.fetchAccountSubscription = this.accountDetailService.fetchAccountDetails().subscribe(accountDetails => {
      this.loadedAccountDetails = accountDetails;
      this.defaultLocation = accountDetails[0].defaultStore;
      this.isLoading = false;
    });
    this.fetchOrderHistorySubscription = this.accountDetailService.fetchOrderHistory().subscribe(orders => {
      this.loadedOrders = orders.sort((a,b) => (a.orderId < b.orderId) ? 1 : -1);
    });
    this.locationSubscription = this.locationService.fetchLocations().subscribe(locations => {
      this.loadedLocations = locations;
    });
  }

  ionViewWillLeave() {
    this.clearSubscripitions();
  }

  logout() {
    this.clearSubscripitions();
    this.accountService.logout();
    this.router.navigateByUrl('/main/tabs/account').then(() =>
      window.location.reload()
    );
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
    this.modalController
      .create({
        component: OrderdetailsComponent,
        componentProps: { selectedOrder: order }
      })
      .then(modalEl => {
        modalEl.present();
      })
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    
    const defaultStore = form.value.store;
    
    this.updating = true;
    this.accountDetailsSubscription = this.accountDetailService.accountdetails.subscribe(accountDetails => {
      if (accountDetails){
        this.saveAccountSubscription = this.accountDetailService.saveAccountDetails(accountDetails[0], defaultStore).subscribe(() => {
          this.updating = false;
          this.updated = true;
          this.delay(2000).then(() => {
            this.updated = false;
          })
        });
      }
    });
    
  }

  clearSubscripitions(){
    if (this.accountDetailsSubscription){
      this.accountDetailsSubscription.unsubscribe();
    }
    if (this.saveAccountSubscription){
      this.saveAccountSubscription.unsubscribe();
    }
    if (this.fetchAccountSubscription){
      this.fetchAccountSubscription.unsubscribe();
    }
    if (this.fetchOrderHistorySubscription){
      this.fetchOrderHistorySubscription.unsubscribe();
    }
    if (this.locationSubscription){
      this.locationSubscription.unsubscribe();
    }
  }

  compareWithFn(l1, l2) {
    // return l1 && l2 ? l1.storeId == l2.storeId : l1 == l2;
    return l1 == l2;
  };

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms));
  }

}
