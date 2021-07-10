import { Injectable } from '@angular/core';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { NEVER, Subscription } from 'rxjs';

import { QuoteItem } from './quoteitem.model';
import { AccountService } from '../account/account.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, of } from 'rxjs';


interface QuoteItemData {
  id: string,
  itemId: string,
  createdAt: Date,
  updatedAt: Date,
  itemName: string,
  itemPrice: number,
  totalItemPrice: number,
  itemQuantity: number,
  itemOptions: string[],
  userId: string,
  imageUrl: string
}

@Injectable({
  providedIn: 'root'
})
export class QuoteitemService {

  private _quoteItems = new BehaviorSubject<QuoteItem[]>([]);

  private quoteItemsSubscription = Subscription
  router: any;

  constructor(
    private accountService: AccountService,
    private httpClient: HttpClient
  ) { }

  get quoteItems() {
    return this._quoteItems.asObservable();
  }

  removeQuoteItem(quoteItemId: string){
    return this.accountService.token.pipe(
    switchMap(token => {
      return this.httpClient.delete(`${environment.firebase.databaseURL}quote-item/${quoteItemId}.json?auth=${token}`)
    }),
    switchMap(() => {
      return this.quoteItems;
    }),
    take(1),
    tap(quoteItems => {
      this._quoteItems.next(quoteItems.filter(item => item.id !== quoteItemId))
    })
  );
  }

  saveQuoteItem(
    itemId: string,
    itemName: string,
    itemPrice: number,
    totalItemPrice: number,
    itemQuantity: number,
    itemOptions: object,
    imageUrl: string
  ) {
    let generatedId: string;
    let quoteItem: QuoteItem;
    let fetchedUserId: string;
    return this.accountService.userId.pipe(
      take(1),
      switchMap(token => {
        if (!token) {
          this.accountService.logout();
          this.router.navigateByUrl('/main/tabs/account');
          return NEVER;
        } else {
          return of(token);
        }
      }), 
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }

        fetchedUserId = userId;
        return this.accountService.token;
      }),
      take(1),
      switchMap(token => {
        quoteItem = new QuoteItem(
          Math.random().toString(),
          itemId,
          new Date(),
          new Date(),
          itemName,
          itemPrice,
          totalItemPrice,
          itemQuantity,
          itemOptions,
          fetchedUserId,
          imageUrl
        ); 

        return this.httpClient.post<{ id: string }>(
          `${environment.firebase.databaseURL}quote-item.json?auth=${token}`, 
          {...quoteItem, id: null}
        );
      }),
      take(1),
      switchMap(resData => {
        generatedId = resData.id;
        return this.quoteItems
      }),
      take(1),
      tap(quoteItems => {
        quoteItem.id = generatedId;
        this._quoteItems.next(quoteItems.concat(quoteItem));
      })
    );
  }

  fetchQuoteItems() {
    let fetchedUserId: string;
    return this.accountService.userId.pipe(
      take(1),
      switchMap(token => {
        if (!token) {
          this.accountService.logout();
          this.router.navigateByUrl('/main/tabs/account');
          return NEVER;
        } else {
          return of(token);
        }
      }),
      switchMap(userId => {
        if(!userId){
          throw new Error('User id not found.');
        }

        fetchedUserId = userId;
        return this.accountService.token;
      }),
      take(1),
      switchMap(token => {
        return this.httpClient
          .get<{[key: string]: QuoteItemData }>(
            `${environment.firebase.databaseURL}quote-item.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`
          )
          .pipe(
            map(resData => {
              const quoteItems = [];

              for (const key in resData){
                if (resData.hasOwnProperty(key)){
                  quoteItems.push(new QuoteItem(
                    key,
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

              return quoteItems;
          }),
          tap(quoteItem => {
            this._quoteItems.next(quoteItem);
          })
        )
      })
    )
  }

  updateQuoteItem(
    oldQuoteItem: QuoteItem,
    totalItemPrice: number,
    itemQuantity: number,
    itemOptions: {}
  ){
    let updatedQuoteItems: QuoteItem[]; 
    let fetchedQuoteItems: QuoteItem[];
    return this.quoteItems.pipe(
      take(1),
      switchMap(quoteItems => {
        fetchedQuoteItems = quoteItems;
        // if (!fetchedQuoteItems || fetchedQuoteItems.length <= 0) {
        //   return this.fetchQuoteItems();
        // } else {
        //   return of(fetchedQuoteItems);
        // }
        return this.accountService.token;
      }),
      take(1),
      switchMap(token => {
        if (!token) {
          this.accountService.logout();
          this.router.navigateByUrl('/main/tabs/account');
          return NEVER;
        } else {
          return of(token);
        }
      }),
      switchMap(token => {
        const updatedQuoteItemIndex = fetchedQuoteItems.findIndex(item => item.id === oldQuoteItem.id);
        updatedQuoteItems = [...fetchedQuoteItems];
        const updatedQuantity = oldQuoteItem.itemQuantity+itemQuantity;
        const updatedItemPrice = oldQuoteItem.itemPrice*updatedQuantity;
        updatedQuoteItems[updatedQuoteItemIndex] = new QuoteItem(
          oldQuoteItem.id,
          oldQuoteItem.itemId,
          oldQuoteItem.createdAt,
          new Date(),
          oldQuoteItem.itemName,
          oldQuoteItem.itemPrice,
          updatedItemPrice,
          updatedQuantity,
          itemOptions,
          oldQuoteItem.userId,
          oldQuoteItem.imageUrl
        );

        return this.httpClient.put(
          `${environment.firebase.databaseURL}quote-item/${oldQuoteItem.id}.json?auth=${token}`,
          { ...updatedQuoteItems[updatedQuoteItemIndex], id: null}
        );
      }),
      tap(() => {
        this._quoteItems.next(updatedQuoteItems)
      })
    )
  }
}
