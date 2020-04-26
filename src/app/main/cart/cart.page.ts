import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { LoadingController } from '@ionic/angular';

import { QuoteitemService } from './quoteitem.service';
import { QuoteItem } from './quoteitem.model';
import { QuoteService } from './quote.service';
import { Quote } from './quote.model';
import { flatMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  quoteItems: QuoteItem[];
  quote: Quote;
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
    private router: Router
  ) { }

  ngOnInit() {
    this.cartSub = this.quoteItemService.quoteItems.subscribe(quoteItems => {
      this.quoteItems = quoteItems;
      this.subTotal = 0;
      this.grandTotal = 0;
      this.quoteItems.forEach(quoteItem => {
        this.subTotal += quoteItem.totalItemPrice;
      })
      this.grandTotal = this.taxAmount + this.subTotal;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.quoteItemService.fetchQuoteItems().subscribe(quoteItems => {
      this.quoteItems = quoteItems;
      this.quoteService.calculateSubtotal();
      this.quoteService.calculateTax().subscribe(taxAmount => {
      console.log('Tax Amount',taxAmount);
      this.quoteService.taxAmount.subscribe(taxAmount => {
        this.taxAmount = taxAmount;
        this.grandTotal = this.taxAmount + this.subTotal;
      });
    });
    });
    
  }

  onRemoveQuoteItem(quoteItem: string){
    this.loadingCtrl.create({ message: 'Removing item...'}).then(loadingEl => {
      loadingEl.present();
      this.quoteItemService.removeQuoteItem(quoteItem).subscribe(() => {
        loadingEl.dismiss();
      });
    })
  }

  onDeliveryButtonClick() {
    this.router.navigateByUrl('/main/tabs/cart/delivery');
  }

  ngOnDestroy() {
    if(this.cartSub){
      this.cartSub.unsubscribe();
    }
  }

  deleteCartItem(id: string) {
    this.isTaxLoading = true;
    this.quoteItemService.deleteQuoteItem(id).subscribe(() => {
      this.quoteService.calculateTax().subscribe(taxAmount => {
        console.log('Tax Amount',taxAmount);
        this.quoteService.taxAmount.subscribe(taxAmount => {
          this.taxAmount = taxAmount;
          this.isTaxLoading = false;
        });
      });
    });
  }
}
