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

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  quoteItems: QuoteItem[];
  quote: Quote[];
  private cartSub: Subscription;
  private taxSub: Subscription;
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
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.cartSub = this.quoteItemService.quoteItems.subscribe(quoteItems => {
      this.quoteItems = quoteItems;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.quoteItemService.fetchQuoteItems().subscribe(quoteItems => {
      this.quoteItems = quoteItems;
    });
    this.quoteService.fetchQuote().subscribe(quote => {
      this.quote = quote;
      this.quoteService.calculateTotals();
      this.quoteService.subtotal.subscribe(subtotal => {
        this.subTotal = subtotal;
      });
      this.quoteService.taxAmount.subscribe(taxAmount => {
        this.taxAmount = taxAmount;
      })
      this.quoteService.grandtotal.subscribe(grandtotal => {
        this.grandTotal = grandtotal;
      })
      this.quoteService.calculateTax()
      .subscribe(taxRate => {
        this.quoteService.taxAmount.subscribe(taxAmount => {
          this.taxAmount = taxAmount;          
          this.grandTotal = this.taxAmount + this.subTotal;
          this.quoteService.updateQuote(0, taxRate.rate.taxSales, this.taxAmount, '').subscribe();
        });
      });
      // this.taxAmount = 1;
      // this.subTotal = this.quote[0].subTotal;
      // this.grandTotal = this.taxAmount + this.subTotal;
    })
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
    console.log("Adding Item", quoteItem);
    this.productService.addItemToCart(
      quoteItem.itemId,
      quoteItem.itemName,
      quoteItem.itemPrice,
      quoteItem.totalItemPrice,
      1,
      quoteItem.itemOptions,
      quoteItem.imageUrl
    )
  }

  decrementQuantity(quoteItem: QuoteItem) {
    if (quoteItem.itemQuantity > 1){
      console.log("Removing Single Item", quoteItem);
      this.productService.decrementItemFromCart(quoteItem)
    }
  }

  onDeliveryButtonClick() {
    let deliveryMethod = document.querySelector('#delivery-method').nodeValue;
    console.log(deliveryMethod);
    // this.quoteService.updateQuote(this.quote[0].subTotal, this.quote[0].taxRate, this.quote[0].taxAmount, )
    this.router.navigateByUrl('/main/tabs/cart/payment');
  }

  ngOnDestroy() {
    if(this.cartSub){
      this.cartSub.unsubscribe();
    }
  }

  deleteCartItem(id: string) {
    this.isTaxLoading = true;
    this.quoteItemService.removeQuoteItem(id).subscribe(quoteItems => {
      this.quoteService.calculateTotals();
      this.quoteService.calculateTax()
      .subscribe(taxAmount => {
        this.quoteService.taxAmount.subscribe(taxAmount => {
          this.taxAmount = taxAmount;
          this.isTaxLoading = false;
        });
      });
    });
  }
}
