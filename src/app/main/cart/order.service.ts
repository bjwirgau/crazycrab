import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Quote } from './quote.model'
import { QuoteItem } from './quoteitem.model';
import { AccountService } from '../account/account.service';
import { environment } from 'src/environments/environment';
import { Order } from './order.model';
import { take, switchMap, tap } from 'rxjs/operators';
import { OrderItem } from './orderitem.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private httpClient: HttpClient,
    private accountService: AccountService
  ) { }

  createOrder(quote: Quote){

    let order = new Order(
      Math.random().toString(),
      Math.random(),
      '',
      new Date(),
      new Date(),
      quote.taxRate,
      quote.taxRate,
      quote.subTotal,
      quote.grandTotal,
      quote.deliveryMethod
    )



    return this.accountService.userId.pipe(
      tap(latestOrder => {
        this.fetchLatestOrder().subscribe(latestOrder => {
          let orderId = 1;
          if (Object.values(latestOrder)[0] !== null && Object.values(latestOrder)[0].orderId != null) {
            let orderId = Object.values(latestOrder)[0].orderId;
          }

          order.orderId = orderId;
        })
      }),
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('Error creating order. User ID not found.');
        }

        order.userId = userId;
  
        return this.httpClient.post<{ id: string }>(
          `${environment.firebase.databaseURL}order.json`,
          {...order, id: null}
        );
      })
    )
  }

  createOrderItems(quoteItems: QuoteItem[]){
    let orderItems: OrderItem[] = [];

    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('User id not found when creating order items.')
        }

        quoteItems.forEach(quoteItem => {
          let orderItem = new OrderItem(
            Math.random().toString(),
            '',
            new Date(),
            new Date(),
            quoteItem.itemName,
            quoteItem.itemPrice,
            quoteItem.totalItemPrice,
            quoteItem.itemQuantity,
            quoteItem.itemOptions,
            userId,
            quoteItem.imageUrl
          )

          orderItems.push(orderItem);
        });

        return this.httpClient.post<{ id: string }>(
          `${environment.firebase.databaseURL}order-item.json`, 
          {...quoteItems, id: null}
        );
      }),

    )
    
  }
  
  fetchLatestOrder(){
    return this.httpClient
    .get<{[key: string]: Order}>(
      `${environment.firebase.databaseURL}order.json?orderBy="createdAt"&limitToLast=1`
    );
  }
}
