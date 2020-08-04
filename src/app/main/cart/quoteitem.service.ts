import { Injectable } from '@angular/core';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

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

  constructor(
    private accountService: AccountService,
    private httpClient: HttpClient
  ) { }

  get quoteItems() {
    return this._quoteItems.asObservable();
  }

  removeQuoteItem(quoteItemId: string){
    return this.httpClient
      .delete(
        `${environment.firebase.databaseURL}quote-item/${quoteItemId}.json`
      )
      .pipe(
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
    return this.accountService.userId.pipe(
      take(1), 
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }
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
          userId,
          imageUrl
        ); 

        return this.httpClient.post<{ id: string }>(
          `${environment.firebase.databaseURL}quote-item.json`, 
          {...quoteItem, id: null}
        );
      }), 
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
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if(!userId){
          throw new Error('User id not found.');
        }

        return this.httpClient
          .get<{[key: string]: QuoteItemData }>(
            `${environment.firebase.databaseURL}quote-item.json?orderBy="userId"&equalTo="${userId}"`
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
    return this.quoteItems.pipe(
      take(1),
      switchMap(quoteItems => {
        if (!quoteItems || quoteItems.length <= 0) {
          return this.fetchQuoteItems();
        } else {
          return of(quoteItems);
        }
      }),
      switchMap(quoteItems => {
        const updatedQuoteItemIndex = quoteItems.findIndex(item => item.id === oldQuoteItem.id);
        updatedQuoteItems = [...quoteItems];
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
          `${environment.firebase.databaseURL}quote-item/${oldQuoteItem.id}.json`,
          { ...updatedQuoteItems[updatedQuoteItemIndex], id: null}
        );
      }),
      tap(() => {
        this._quoteItems.next(updatedQuoteItems)
      })
    )
  }
}
