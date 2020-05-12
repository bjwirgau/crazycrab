import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Quote } from './quote.model'
import { QuoteItem } from './quoteitem.model';
import { AccountService } from '../account/account.service';
import { environment } from 'src/environments/environment';
import { Order } from './order.model';
import { take, switchMap, tap } from 'rxjs/operators';

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
}
