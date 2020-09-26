import { Injectable } from '@angular/core';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { QuoteItem } from './quoteitem.model';
import { AccountService } from '../account/account.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, of } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';


interface QuoteItemData {
  id: string,
  itemId: string,
  createdAt: Date,
  updatedAt: Date,
  itemName: string,
  itemPrice: number,
  totalItemPrice: number,
  itemQuantity: number,
  itemOptions: object,
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
    private httpClient: HttpClient,
    private db: AngularFirestore
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
      map(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }

        let quoteItemCollection = this.db.collection<QuoteItemData>('quote-item');
        quoteItemCollection.add({
          'id': Math.random().toString(),
          'itemId': itemId,
          'createdAt': new Date(),
          'updatedAt': new Date(),
          'itemName': itemName,
          'itemPrice': itemPrice,
          'totalItemPrice': totalItemPrice,
          'itemQuantity': itemQuantity,
          'itemOptions': itemOptions,
          'userId': userId,
          'imageUrl': imageUrl
        }).then(resData => {
          console.log("Quote Item", resData);
        })
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

        return this.db.collection<QuoteItemData>('quote-item').snapshotChanges().pipe(
          map(actions => actions.map(a => {
            const quoteItemData = a.payload.doc.data();
            const quoteItemId = a.payload.doc.id;
            const quoteItem = new QuoteItem(
              quoteItemId,
              quoteItemData.itemId,
              quoteItemData.createdAt,
              quoteItemData.updatedAt,
              quoteItemData.itemName,
              quoteItemData.itemPrice,
              quoteItemData.totalItemPrice,
              quoteItemData.itemQuantity,
              quoteItemData.itemOptions,
              quoteItemData.userId,
              quoteItemData.imageUrl
            )

            return quoteItem;
          })),
          tap(quoteItems => {
            this._quoteItems.next(quoteItems);
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
