import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from './product.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { MenuService } from '../menu.service';
import { Product } from './product.model';
import { NgForm } from '@angular/forms';
import { ProductOptionsService } from './product-options.service';
import { QuoteService } from '../../cart/quote.service';
import { QuoteitemService } from '../../cart/quoteitem.service';


@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit, OnDestroy {

  productDetailSub: Subscription;

  product: Product;
  productOptions: {};
  productQuantity = 1;

  private currentPrice: string;
  prices: [];
  priceIndex = 0;

  loadedProductOptions = [];

  isLoading = false;
  productAdded = false;

  constructor(
    private productService: ProductService,
    private productOptionsService: ProductOptionsService,
    private quoteService: QuoteService,
    private quoteItemService: QuoteitemService,
    private activatedRoute: ActivatedRoute,
    private menuService: MenuService,
    private router: Router
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('productId')) {
        this.router.navigate(['/main/tabs/menu/']);
        return;
      }

      this.isLoading = true;
      const productId = paramMap.get('productId');

      let menuHistory = this.menuService.menuHistory.slice();
      menuHistory.splice(0, menuHistory.length - 1);
      let category = menuHistory.join('/');

      this.productService.fetchProduct(category, productId).subscribe(
        product => {
          this.product = product;
          this.productOptionsService.initProductOptions(product.options);
          this.productOptions = this.productOptionsService.options;
          this.currentPrice = this.product.price.toFixed(2);

          this.isLoading = false;
        }
        );
    });
  }

  ngOnDestroy(){
    if(this.productDetailSub){
      this.productDetailSub.unsubscribe();
    }
    this.productOptionsService.clearOptions();
    this.productAdded = false;
  }

  get price() {
    return this.currentPrice;
  }
  
  incrementQty () {
    this.productQuantity++;
    this.calculatePrice();
  }

  decrementQty () {
    if (this.productQuantity > 1) {
      this.productQuantity--;
      this.calculatePrice();
    }
  }

  /**
   * 
   * @param $event 
   */
  addProductOption($event: CustomEvent) {
    let option = this.productOptionsService.getOption($event.target["id"]);
    this.productOptionsService.addActiveOption(option, $event.detail.value);
    this.calculatePrice()
  }

  calculatePrice(){
    let optionsPrice = this.productOptionsService.collectOptionPrices();
    this.currentPrice = ((this.product.price + optionsPrice)*this.productQuantity).toFixed(2);
  }

  /**
   * Form Submit
   * @param form
   */
  addItemToCart(form: NgForm) {
    let errors = false;
    this.isLoading = true;
    console.log(form);

    if (!form.value['quantity']){
      errors = true;
      console.log('Error getting product quantity.');
    }

    if (!form.value['currentPrice']){
      errors = true;
      console.log('Error getting current price');
    }

    const quantity = form.value['quantity'];
    const price = parseFloat(form.value['product']['price']);
    const totalPrice = parseFloat(form.value['currentPrice']);
    const imageUrl = form.value['product']['imageUrl'];

    let quoteItemOptions: {} = {};
    this.productOptionsService.options.forEach(option => {
      quoteItemOptions[option.id] = option.values[form.value[option.id]]['value'];
    })

    this.productService.addItemToCart(
      form.value['product']['id'],
      form.value['product']['name'],
      price,
      totalPrice,
      quantity,
      quoteItemOptions,
      imageUrl
    );
    this.isLoading = false;
    this.productAdded = true;
  }

}
