import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { LoadingController, IonItemSliding } from '@ionic/angular';

import { QuoteitemService } from './quoteitem.service';
import { QuoteItem } from './quoteitem.model';
import { QuoteService } from './quote.service';
import { Quote } from './quote.model';
import { flatMap, tap, take, map } from 'rxjs/operators';
import { ProductService } from '../menu/product/product.service';
import { LocationService } from '../location/location.service';
import { StoreLocation } from '../location/location.model';
import { AccountdetailsService } from '../account/accountdetails/accountdetails.service';
import { AccountDetails } from '../account/accountdetails/accountdetails.model';

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
  isLoading = false;
  taxRate: number;
  taxAmount: number;
  subTotal: number;
  grandTotal: number = 0;
  isTaxLoading: boolean;

  constructor(
    private quoteItemService: QuoteitemService,
    private quoteService: QuoteService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private productService: ProductService,
    private locationService: LocationService,
    private accountDetailService: AccountdetailsService
  ) { }

  ngOnInit() {
    this.cartSub = this.quoteItemService.quoteItems.subscribe(quoteItems => {
      this.quoteItems = quoteItems;
    });
    this.locationService.fetchLocations().subscribe(locations => {
      this.loadedLocations = locations;
    });
    this.accountDetailService.fetchAccountDetails().subscribe(accountDetails => {
      this.loadedAccountDetails = accountDetails;
    });
  }

  ngOnDestroy() {
    if(this.cartSub){
      this.cartSub.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
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
        this.subTotal = subtotal;
      });
      this.taxSub = this.quoteService.taxAmount.subscribe(taxAmount => {
        this.taxAmount = taxAmount;
      });
      this.grandtotalSub = this.quoteService.grandtotal.subscribe(grandtotal => {
        this.grandTotal = grandtotal;
      });
      this.quoteService.calculateTax().subscribe(taxRate => {
        this.taxUpdateSub = this.quoteService.taxAmount.subscribe(taxAmount => {
          this.taxAmount = taxAmount;          
          this.grandTotal = this.taxAmount + this.subTotal;
          this.updateQuoteSub = this.quoteService.updateQuote(0, taxRate.rate.taxSales, this.taxAmount, '').subscribe();
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
    this.router.navigateByUrl('/main/tabs/cart/payment');
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
}
