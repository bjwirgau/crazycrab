import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, tap, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Product } from './product.model';
import { QuoteService } from '../../cart/quote.service';
import { QuoteitemService } from '../../cart/quoteitem.service';
import * as _ from 'lodash';
import { QuoteItem } from '../../cart/quoteitem.model';

interface ProductData {
  id: string,
  title: string,
  imageUrl: string,
  price: number,
  options: {}
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private _product = new BehaviorSubject<Product[]>([]);

  constructor(
    private httpClient: HttpClient,
    private quoteService: QuoteService,
    private quoteItemService: QuoteitemService,
    private router: Router
  ) { }

  get product() {
    return this._product.asObservable()
  }

  fetchProduct(category: string, id: string) {
    return this.httpClient
      .get<ProductData>(`${environment.firebase.databaseURL}${category}/${id}.json`)
      .pipe(map(resData => {
        return new Product(
          id,
          resData.title,
          resData.imageUrl,
          resData.price,
          !!resData.options ? resData.options : {}
        )
        })
    )
  }
  
  addItemToCart(
    productId: string,
    productName: string,
    productPrice: number,
    totalProductPrice: number,
    productQuantity: number,
    productOptions: {},
    imageUrl: string
  ){
    // this.quoteService.fetchQuote().pipe(
    //   take(1),
    //   switchMap(quote => {
    //     if (quote.length > 0) {

    //     }

    //     return this.quoteService.quote;
    //   })
    // )

    this.quoteService.fetchQuote().subscribe(
      quote => {
        if (quote.length === 0){
          this.quoteService.createQuote(totalProductPrice).subscribe(quote => {
              this.quoteItemService.saveQuoteItem(
                productId,
                productName,
                productPrice,
                totalProductPrice,
                productQuantity,
                productOptions,
                imageUrl
              ).subscribe()
            }
          )
        } else {
          this.quoteService.updateQuote(
            quote[0].subTotal+totalProductPrice,
            quote[0].taxRate,
            quote[0].taxAmount,
            quote[0].deliveryMethod
          ).subscribe(
            quote => {
              this.quoteItemService.fetchQuoteItems().subscribe(quoteItems => {
                let productFound = false;
                quoteItems.forEach(quoteItem => {
                  if (quoteItem['itemId'] === productId){
                    if (!quoteItem['itemOptions'] || _.isEqual(productOptions, quoteItem['itemOptions'])){
                      productFound = true;
                      this.quoteItemService.updateQuoteItem(quoteItem, totalProductPrice, productQuantity, productOptions).subscribe();
                    }
                  }
                })
                if (!productFound){
                  this.quoteItemService.saveQuoteItem(
                    productId,
                    productName,
                    productPrice,
                    totalProductPrice,
                    productQuantity,
                    productOptions,
                    imageUrl
                  ).subscribe()
                }
              })
            }
          )
        }
      }
    )
  }

  decrementItemFromCart(quoteItem: QuoteItem){
    this.quoteService.fetchQuote().subscribe(
      quote => {
        if (quote.length >= 0){
          this.quoteService.updateQuote(
            quoteItem.itemPrice*-1,
            quote[0].taxRate,
            quote[0].taxAmount,
            quote[0].deliveryMethod
          ).subscribe(
            quote => {
              this.quoteItemService.updateQuoteItem(
                quoteItem,
                quoteItem.totalItemPrice,
                -1,
                quoteItem.itemOptions
              ).subscribe()
            }
          )
        } 
      }
    )
  }
}


