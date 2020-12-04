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
  orderComplete = new BehaviorSubject<boolean>(false);

  constructor(
    private httpClient: HttpClient,
    private accountService: AccountService
  ) { }

  get orderItems() {
    return this._orderItems.asObservable();
  }

  createOrder(quote: Quote, orderId: number){
    let fetchedUserId: string;
    let order = new Order(
      Math.random().toString(),
      orderId,
      '',
      new Date(),
      new Date(),
      Math.round((quote.taxRate+Number.EPSILON)*100)/100,
      Math.round((quote.taxAmount+Number.EPSILON)*100)/100,
      Math.round((quote.subTotal+Number.EPSILON)*100)/100,
      Math.round((quote.grandTotal+Number.EPSILON)*100)/100,
      quote.deliveryMethod,
      quote.prepTime
    );

    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('Error creating order. User ID not found.');
        }

        order.userId = userId;
        fetchedUserId = userId;

        return this.accountService.token;
      }),
      switchMap(token => {
        return this.httpClient.post<{ id: string }>(
          `${environment.firebase.databaseURL}order.json?auth=${token}`,
          {...order, id: null}
        );
      })
    )
  }

  saveOrderItem(quoteItem: QuoteItem, orderId: number){
    let orderItem: OrderItem;
    let fetchedUserId: string;

    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('User id not found when creating order items.')
        }

        fetchedUserId = userId;
        return this.accountService.token;
      }),
      switchMap(token => {
        let orderItem = new OrderItem(
          Math.random().toString(),
          orderId,
          '',
          new Date(),
          new Date(),
          quoteItem.itemName,
          Math.round((quoteItem.itemPrice+Number.EPSILON)*100)/100,
          Math.round((quoteItem.totalItemPrice+Number.EPSILON)*100)/100,
          quoteItem.itemQuantity,
          quoteItem.itemOptions,
          fetchedUserId,
          quoteItem.imageUrl
        )

        return this.httpClient.post<{ id: string }>(
          `${environment.firebase.databaseURL}order-item.json?auth=${token}`, 
          {...orderItem, id: null}
        );
      })
    )
    
  }

  createOrderItems(quoteItems: QuoteItem[], orderId: number){
    quoteItems.forEach(quoteItem => {
      this.saveOrderItem(quoteItem, orderId).subscribe();
    })
  }

  fetchOrderItems(orderId: number){
    let fetchedUserId: string;
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('Error fetching order items. User ID not found!');
        }

        if (!orderId){
          throw new Error('Order ID not found.');
        }

        fetchedUserId = userId;
        return this.accountService.token;
      }),
      switchMap(token => {
        return this.httpClient
          .get<{[key: string]: OrderItemData}>(
            `${environment.firebase.databaseURL}order-item.json?orderBy="orderId"&equalTo=${orderId}&auth=${token}`
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
    return this.accountService.token.pipe(
      switchMap(token =>{
        return this.httpClient.get<{[key: string]: Order}>(`${environment.firebase.databaseURL}order.json?orderBy="createdAt"&limitToLast=1&auth=${token}`)
      }),
      map(resData => {
        const order:Order[] = [];

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
              resData[key].deliveryMethod,
              resData[key].prepTime
            ))
          }
        }

        return order;
      })
    )
  }

  fetchRecentOrderCount(overFlowTime: string) {
    return this.accountService.token.pipe(
      switchMap(token => {
        return this.httpClient.get<{[key: string]: Order}>(`${environment.firebase.databaseURL}order.json?orderBy="createdAt"&startAt="${overFlowTime}"&auth=${token}`)
      }),
      map(resData => {
        const order:Order[] = [];

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
              resData[key].deliveryMethod,
              resData[key].prepTime
            ))
          }
        }

        return order;
      })
    )
  }
}
