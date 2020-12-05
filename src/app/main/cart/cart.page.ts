import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { LoadingController, IonItemSliding, AlertController } from '@ionic/angular';

import { QuoteitemService } from './quoteitem.service';
import { QuoteItem } from './quoteitem.model';
import { QuoteService } from './quote.service';
import { Quote } from './quote.model';
import { ProductService } from '../menu/product/product.service';
import { LocationService } from '../location/location.service';
import { StoreLocation } from '../location/location.model';
import { AccountdetailsService } from '../account/accountdetails/accountdetails.service';
import { AccountDetails } from '../account/accountdetails/accountdetails.model';
import { AvailabilityConfiguration } from '../configuration/availability.model';
import { OrderService } from './order.service';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  quoteItems: QuoteItem[];
  quote: Quote[];
  loadedLocations: StoreLocation[];
  loadedAccountDetails: AccountDetails[];
  availabilityConfiguration: AvailabilityConfiguration[];
  availableTimes: Date[] = [];
  selectedCheckbox;
  private cartSub: Subscription;
  private quoteSub: Subscription;
  private quoteitemSub: Subscription;
  private taxSub: Subscription;
  private taxUpdateSub: Subscription;
  private updateQuoteSub: Subscription;
  private subtotalSub: Subscription;
  private grandtotalSub: Subscription;
  private deleteQuoteSubscription: Subscription;
  private deleteQuoteItemSubscription: Subscription;
  private quoteItemSubscription: Subscription;
  private pickupTimesSub: Subscription;
  isLoading = false;
  isAccountLoading = false;
  taxRate: number;
  salesTax: number;
  taxAmount: number;
  subtotal: number;
  grandTotal: number = 0;
  isTaxLoading: boolean;

  constructor(
    private quoteItemService: QuoteitemService,
    private quoteService: QuoteService,
    private orderService: OrderService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private productService: ProductService,
    private locationService: LocationService,
    private accountDetailService: AccountdetailsService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.pickupTimesSub = this.calculateAvailablePickupTimes().subscribe();
    this.cartSub = this.quoteItemService.quoteItems.subscribe(quoteItems => {
      this.quoteItems = quoteItems;
    });
    this.locationService.fetchLocations().subscribe(locations => {
      this.loadedLocations = locations;
    });
    this.isAccountLoading = true;
    this.accountDetailService.fetchAccountDetails().subscribe(accountDetails => {
      this.loadedAccountDetails = accountDetails;
      this.isAccountLoading = false;
    });
  }

  ngOnDestroy() {
    if(this.cartSub){
      this.cartSub.unsubscribe();
    }
    if(this.pickupTimesSub) {
      this.pickupTimesSub.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.selectedCheckbox = null;
    this.calculateAvailablePickupTimes();
    this.quoteitemSub = this.quoteItemService.fetchQuoteItems().subscribe(quoteItems => {
      this.quoteItems = quoteItems;
    });
    this.cartSub = this.quoteItemService.quoteItems.subscribe(quoteItems => {
      this.quoteItems = quoteItems;
    });
    this.quoteSub = this.quoteService.fetchQuote().subscribe(quote => {
      if(quote.length <= 0){
        return;
      }
      
      this.quote = quote;
      
      let amount = 0;
      this.quoteItems.forEach(item => {
          amount += item.totalItemPrice;
      });
      this.quoteService.updateTotals(amount);

      this.subtotalSub = this.quoteService.subtotal.subscribe(subtotal => {
        this.subtotal = subtotal;
        this.updateQuoteSub = this.quoteService.updateQuote(subtotal, this.taxRate, this.taxAmount, '', '').subscribe();
      });
      this.taxSub = this.quoteService.taxAmount.subscribe(taxAmount => {
        this.taxAmount = taxAmount;
        this.updateQuoteSub = this.quoteService.updateQuote(this.subtotal, this.taxRate, taxAmount, '', '').subscribe();
      });
      this.grandtotalSub = this.quoteService.grandtotal.subscribe(grandtotal => {
        this.grandTotal = grandtotal;
      });
      this.quoteService.calculateTax().subscribe(taxRate => {
        this.taxUpdateSub = this.quoteService.taxAmount.subscribe(taxAmount => {
          this.taxAmount = taxAmount;
          this.salesTax = taxRate.rate.taxSales;
          this.grandTotal = this.taxAmount + this.subtotal;
          this.updateQuoteSub = this.quoteService.updateQuote(this.subtotal, this.salesTax, this.taxAmount, '', '').subscribe();
        });
      });
    })
  }

  ionViewDidLeave() {
    if (this.quoteSub){
      this.quoteSub.unsubscribe();
    }
    if (this.taxSub){
      this.taxSub.unsubscribe();
    }
    if (this.updateQuoteSub) {
      this.quoteSub.unsubscribe();
    }
    if (this.grandtotalSub) {
      this.grandtotalSub.unsubscribe();
    }
    if (this.taxUpdateSub){
      this.taxUpdateSub.unsubscribe();
    }
    if (this.subtotalSub){
      this.subtotalSub.unsubscribe();
    }
    if (this.quoteitemSub){
      this.quoteitemSub.unsubscribe();
    }
    if (this.deleteQuoteSubscription){
      this.deleteQuoteSubscription.unsubscribe();
    }
    if (this.deleteQuoteItemSubscription){
      this.deleteQuoteItemSubscription.unsubscribe();
    }
    if (this.quoteItemSubscription) {
      this.quoteItemSubscription.unsubscribe();
    }
  }

  onRemoveQuoteItem(quoteItemId: string, removeBookingEl: IonItemSliding){
    this.loadingCtrl.create({ message: 'Removing item...'}).then(loadingEl => {
      loadingEl.present();
      this.quoteItemService.removeQuoteItem(quoteItemId).subscribe(() => {
        loadingEl.dismiss();
      });
    })
  }

  addQuantity(quoteItem: QuoteItem) {
    this.productService.addItemToCart(
      quoteItem.itemId,
      quoteItem.itemName,
      quoteItem.itemPrice,
      quoteItem.totalItemPrice,
      1,
      quoteItem.itemOptions,
      quoteItem.imageUrl
    );

    let amount = 0;
    this.quoteItems.forEach(item => {
        amount += item.itemPrice*(item.itemQuantity+1);
    });
    this.quoteService.updateTotals(amount);
  }

  decrementQuantity(quoteItem: QuoteItem) {
    if (quoteItem.itemQuantity > 1){
      this.productService.decrementItemFromCart(quoteItem)

      let amount = 0;
      this.quoteItems.forEach(item => {
          amount += item.itemPrice*(item.itemQuantity-1);
      });
      this.quoteService.updateTotals(amount);
    }
  }

  onDeliveryButtonClick() {
    if (!this.selectedCheckbox || this.selectedCheckbox.length == 0){
      this.alertCtrl.create({
        header: 'Invalid Pickup Time',
        message: 'Please select a time to pick up your order.',
        buttons: ['Okay']
      }).then(
        alertEl => alertEl.present()
      );
    } else {
      this.router.navigateByUrl('/main/tabs/cart/payment');
    }
  }

  deleteCartItem(id: string) {
    this.isTaxLoading = true;
    this.deleteQuoteItemSubscription = this.quoteItemService.removeQuoteItem(id).subscribe(() => {
      let amount = 0;
      this.quoteItemSubscription = this.quoteItemService.quoteItems.subscribe(quoteItems => {
        if (quoteItems.length <= 0){
          this.deleteQuoteSubscription = this.quoteService.deleteQuote().subscribe();
        } else {
          quoteItems.forEach(item => {
            amount += item.totalItemPrice;
          });
  
          this.quoteService.updateTotals(amount);
  
          this.quoteService.calculateTax()
          .subscribe(taxAmount => {
            this.quoteService.taxAmount.subscribe(taxAmount => {
              this.taxAmount = taxAmount;
              this.isTaxLoading = false;
            });
          });
        }
      })
    });
  }

  isObject(option): boolean {
    return typeof option === 'object'
  }

  getValues(values) {
    return Object.values(values);
  }

  selectTime(event: any) {
    const selectedOption = event.srcElement.closest('ion-item');
    const allOptions = event.srcElement.closest('ion-row').getElementsByTagName('ion-item');
    const selectedCheckbox = selectedOption.getElementsByTagName('ion-checkbox')[0];
    this.selectedCheckbox = selectedCheckbox;

    for (let option of allOptions) {
      option.classList.remove('selected');
      option.removeAttribute('checked');
    }

    selectedOption.toggleAttribute('checked');
    selectedOption.classList.toggle('selected');

    // @ts-ignore
    const prepTime = document.querySelectorAll('ion-item[checked]')[0].children[1].value;
    this.quoteSub = this.quoteService.updateQuote(this.subtotal, this.salesTax, this.taxAmount, '', prepTime).subscribe();

  }

  /**
   * Required Variables
   * 1. Current Time
   * 2. Number of orders placed within configured time
   * 3. Configured Lead time for orders
   */
  calculateAvailablePickupTimes() {
    const maxAvailableTimes = 6;
    const intervalAvailability = 15; // In minutes
    let overflowOrderTimeMultiple: number = 0;
    let overFlowOrderTime = new Date();
    let orderCount: number = 0;

    return this.locationService.fetchAvailabilityConfiguration().pipe(
      switchMap(availabilityConfiguration => {
        this.availabilityConfiguration = availabilityConfiguration;

        return this.orderService.fetchRecentOrders(overFlowOrderTime.toISOString());
      }),
      map(orders => {
        orderCount = orders.length;

         // Index 0 is the Southfield location. Future iterations may include a way to set a user's default store and currently selected store
         const currentLocation: StoreLocation = this.loadedLocations[0];
         this.availableTimes = [];
 
         this.setOverFlowOrderTime(overFlowOrderTime);
         overflowOrderTimeMultiple = this.getOverFlowOrderTimeMultiple(orderCount);
 
         for (var availableTimeIndex = 1; availableTimeIndex <= maxAvailableTimes; availableTimeIndex++) {
           // get current day and hour availability for that day and make sure the option is within the bounds of the store being open.
           const currentDay = new Date().getDay()
           const openTime = new Date(new Date().setHours(currentLocation.hours[currentDay]['from']/100, 0, 0, 0));
           let closeTime = new Date(new Date().setHours(currentLocation.hours[currentDay]['to']/100, 0, 0, 0));
 
           if (currentLocation['cutoffTime']) {
             closeTime.setMinutes(closeTime.getMinutes() - currentLocation['cutoffTime']);
           }
 
 
           const timeOption = new Date(new Date().getTime() + (overflowOrderTimeMultiple*this.availabilityConfiguration[0].overflowLeadTime + availableTimeIndex*intervalAvailability)*60000)
 
           if (timeOption < openTime ){
             availableTimeIndex--;
           }
           if (timeOption >= openTime && timeOption <= closeTime) {
             this.availableTimes.push(timeOption);
           }
         }
        }
      )
    )
  }

  setOverFlowOrderTime(overFlowOrderTime: Date) {
    overFlowOrderTime.setMinutes(overFlowOrderTime.getMinutes() - this.availabilityConfiguration[0].overflowInterval);
  }

  getOverFlowOrderTimeMultiple(orderCount: number) {
    return Math.floor(orderCount / this.availabilityConfiguration[0].overflowThreshold);
  }
}
