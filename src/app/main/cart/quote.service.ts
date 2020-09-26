import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { QuoteitemService } from './quoteitem.service';
import { AccountService } from '../account/account.service';
import { take, switchMap, tap, map } from 'rxjs/operators';
import { Quote } from './quote.model'
import { BehaviorSubject, Observable } from 'rxjs';
import { TaxRate } from './taxrate.model';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';


interface TaxData {
  version: string,
  rCode: number,
  results: object
}

interface QuoteData {
  id: string,
  userId: string,
  createdAt: Date,
  updatedAt: Date,
  taxRate: number,
  taxAmount: number,
  subTotal: number,
  grandTotal: number,
  deliveryMethod: string,
  zipCode: string
}

interface QuoteId extends QuoteData { id: string; }

@Injectable({
  providedIn: 'root'
})
export class QuoteService {

  private _taxRate = new BehaviorSubject<TaxRate>(null);
  private _quote = new BehaviorSubject<Quote>(null);
  private _taxAmount = new BehaviorSubject<number>(0);
  private _grandTotal = new BehaviorSubject<number>(0);
  private _subtotal = new BehaviorSubject<number>(0);
  private _zipcode = new BehaviorSubject<string>('');
  private _quoteCollection: AngularFirestoreCollection;
  quotes: Observable<QuoteId[]>;

  constructor(
    private httpClient: HttpClient,
    private quoteItemService: QuoteitemService,
    private accountService: AccountService,
    private db: AngularFirestore
  ) { }

  get quote() {
    return this._quote.asObservable();
  }

  get taxRate() {
    return this._taxRate.asObservable();
  }

  get taxAmount() {
    return this._taxAmount.asObservable();
  }
  
  get subtotal() {
    return this._subtotal.asObservable();
  }

  get grandtotal() {
    return this._grandTotal.asObservable();
  }

  get currentGrandtotal() {
    return this._grandTotal;
  }

  /**
   * 
   * @todo Quote is created twice if user session expires. Need to verify customer session and redirect to login page if session is invalid. Unsure of how to reproduce. Attempted to clear auth data in browser but behaved normally. May just leave page/session alone for extended time and retry.
   * 
   * 
   * @param totalProductPrice 
   */
  createQuote(totalProductPrice: number){

    return this.accountService.userId.pipe(
      take(1),
      map(userId => {
        if (!userId) {
          throw new Error('Error creating quote. User id not found');
        }

        let documentId: string;

        let quoteCollection = this.db.collection<QuoteData>('quote');
        
        quoteCollection.add({
          id: '',
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          taxRate: 0,
          taxAmount: 0,
          subTotal: totalProductPrice,
          grandTotal: totalProductPrice,
          deliveryMethod: '',
          zipCode: ''
        }).then(result => {
          console.log('')
        }).catch(err => {
          console.log("Error", err);
        })
      })
    )
  }

  fetchQuote(){
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('Error looking up quote. User id not found.');
        }

        this._quoteCollection = this.db.collection<QuoteData>('quote');
        return this._quoteCollection.snapshotChanges().pipe(
          map(actions => actions.map(a => {
            const quoteData = a.payload.doc.data();
            const quoteId = a.payload.doc.id;
            const quote = new Quote(
              quoteId,
              quoteData.userId,
              quoteData.createdAt,
              quoteData.updatedAt,
              Math.round((quoteData.taxRate+Number.EPSILON)*100)/100,
              Math.round((quoteData.taxAmount+Number.EPSILON)*100)/100,
              Math.round((quoteData.subTotal+Number.EPSILON)*100)/100,
              Math.round((quoteData.grandtotal+Number.EPSILON)*100)/100,
              quoteData.deliveryMethod,
              quoteData.zipCode
            )

            return quote;
          })),
          tap(quote => {
            this._quote.next(quote[0])
          })
        );
      })
    )
  }

  updateQuote(
    subtotal: number, 
    taxRate: number, 
    taxAmount: number,
    deliveryMethod: string
  ){  
    let updatedQuote: Quote;
    return this.quote.pipe(
      take(1),
      map(quote => {
        // let subtotal = quote.subTotal + totalProductPrice;
        let grandtotal = subtotal + taxAmount;

        updatedQuote = new Quote(
          quote.id,
          quote.userId,
          quote.createdAt,
          new Date(),
          Math.round((taxRate+Number.EPSILON)*100)/100,
          Math.round((taxAmount+Number.EPSILON)*100)/100,
          Math.round((subtotal+Number.EPSILON)*100)/100,
          Math.round((grandtotal+Number.EPSILON)*100)/100,
          deliveryMethod,
          quote.zipCode
        );

        // return this.httpClient.put(
        //   `${environment.firebase.databaseURL}quote/${quote.id}.json`,
        //   {...updatedQuote, id:null}
        // );
        let quoteItemDoc = this.db.doc<Quote>(`quote/${quote.id}`);

        quoteItemDoc.update({
          'id': quote.id,
          'userId': quote.userId,
          'createdAt': quote.createdAt,
          'updatedAt': new Date(),
          'taxRate': Math.round((taxRate+Number.EPSILON)*100)/100,
          'taxAmount': Math.round((taxAmount+Number.EPSILON)*100)/100,
          'subTotal': Math.round((subtotal+Number.EPSILON)*100)/100,
          'grandTotal': Math.round((grandtotal+Number.EPSILON)*100)/100,
          'deliveryMethod': deliveryMethod,
          'zipCode': quote.zipCode
        })
      })
    )
  }

  calculateTotals(){
    this.quoteItemService.quoteItems.subscribe(quoteItems => {
      let subtotal = 0;
      quoteItems.forEach(quoteItem => {
        subtotal += quoteItem.totalItemPrice;
      });

      this._subtotal.next(subtotal);
      if (this._taxRate.getValue()){
        this._taxAmount.next(subtotal * this._taxRate.getValue()['rate']['stateUseTax']);
      }
      this._grandTotal.next(subtotal + this._taxAmount.getValue());

    })
  }

  updateTotals(subtotal: number){
    this._subtotal.next(subtotal);
    if (this._taxRate.getValue()){
      this._taxAmount.next(subtotal * this._taxRate.getValue()['rate']['stateUseTax']);
      this._grandTotal.next(subtotal + this._taxAmount.getValue());
      // this.updateQuote(subtotal, this._taxRate.getValue().rate.stateUseTax, this._taxAmount.getValue(), this._quote.getValue().deliveryMethod).subscribe()  ;
    }
  }

  calculateTax(zip: string = '48033'){
    let taxRate: TaxRate;
    
    if (this._zipcode.getValue() === zip){
      return this.taxRate;
    }

    let params = new HttpParams().set("zipCode",zip);

    return this.httpClient
      .get<TaxData>(
        `${environment.firebase.cloudFunctionsUrl}getTaxRate`, {params}
        ).pipe(
        map(result => {
          taxRate = new TaxRate(
            Math.random().toString(),
            result.results[0],
            zip
          )

          return taxRate;
        }),
        tap(taxRate => {
          this._taxRate.next(taxRate);
          this._zipcode.next(taxRate.rate['geoPostalCode']);
          this._taxAmount.next(taxRate.rate.taxSales*this._subtotal.getValue());
        })
      );

  }

  deleteQuote(){
    return this.accountService.userId.pipe(userId => {
      if (!userId) {
        throw new Error('Could not find user when clearing quote.');
      }

      return this.httpClient
        .delete(`${environment.firebase.databaseURL}quote.json?customerId=${userId}`);
    })
  }
}
