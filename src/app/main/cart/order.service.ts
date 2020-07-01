import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Quote } from './quote.model'
import { QuoteItem } from './quoteitem.model';
import { AccountService } from '../account/account.service';
import { environment } from 'src/environments/environment';
import { Order } from './order.model';
import { take, switchMap, tap, map } from 'rxjs/operators';
import { OrderItem } from './orderitem.model';
import { BehaviorSubject } from 'rxjs';

interface OrderItemData {
  createdAt: Date,
  orderId: number,
  id: string,
  imageUrl: string,
  itemId: string,
  itemName: string,
  itemPrice: number,
  itemQuantity: number,
  itemOptions: object,
  totalItemPrice: number,
  updatedAt: Date,
  userId: string,
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private _orderItems = new BehaviorSubject<OrderItem[]>([]);

  constructor(
    private httpClient: HttpClient,
    private accountService: AccountService
  ) { }

  get orderItems() {
    return this._orderItems.asObservable();
  }

  createOrder(quote: Quote, orderId: number){

    let order = new Order(
      Math.random().toString(),
      orderId,
      '',
      new Date(),
      new Date(),
      quote.taxRate,
      quote.taxRate,
      quote.subTotal,
      quote.grandTotal,
      quote.deliveryMethod
    );

    return this.accountService.userId.pipe(
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

  saveOrderItem(quoteItem: QuoteItem, orderId: number){
    let orderItem: OrderItem;

    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('User id not found when creating order items.')
        }

        let orderItem = new OrderItem(
          Math.random().toString(),
          orderId,
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

        return this.httpClient.post<{ id: string }>(
          `${environment.firebase.databaseURL}order-item.json`, 
          {...orderItem, id: null}
        );
      }),

    )
    
  }

  createOrderItems(quoteItems: QuoteItem[], orderId: number){
    quoteItems.forEach(quoteItem => {
      this.saveOrderItem(quoteItem, orderId).subscribe();
    })
  }

  fetchOrderItems(orderId: number){
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('Error fetching order items. User ID not found!');
        }

        if (!orderId){
          throw new Error('Order ID not found.');
        }

        return this.httpClient
          .get<{[key: string]: OrderItemData}>(
            `${environment.firebase.databaseURL}order-item.json?orderBy="orderId"&equalTo=${orderId}`
          ).pipe(
            map(resData => {
              const orderItems = [];

              for (const key in resData){
                if (resData.hasOwnProperty(key)){
                  orderItems.push(new OrderItem(
                    key,
                    resData[key].orderId,
                    resData[key].itemId,
                    resData[key].createdAt,
                    resData[key].updatedAt,
                    resData[key].itemName,
                    resData[key].itemPrice,
                    resData[key].totalItemPrice,
                    resData[key].itemQuantity,
                    resData[key].itemOptions,
                    resData[key].userId,
                    resData[key].imageUrl
                  ))
                }
              }

              return orderItems;
            }),
            tap(orderItems => {
              this._orderItems.next(orderItems);
            })
          )
      })
    )
  }
  
  fetchLatestOrder(){
    return this.httpClient
    .get<{[key: string]: Order}>(
      `${environment.firebase.databaseURL}order.json?orderBy="createdAt"&limitToLast=1`
    ).pipe(
      map(resData => {
        const order = [];

        for (const key in resData){
          if (resData.hasOwnProperty(key)){
            order.push(new Order(
              key,
              resData[key].orderId,
              resData[key].userId,
              resData[key].createdAt,
              resData[key].updatedAt,
              resData[key].taxRate,
              resData[key].taxAmount,
              resData[key].subTotal,
              resData[key].grandTotal,
              resData[key].deliveryMethod
            ))
          }
        }

        return order;
      })
    )
  }
}
