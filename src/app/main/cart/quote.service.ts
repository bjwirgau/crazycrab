import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';

import { environment } from 'src/environments/environment';
import { QuoteitemService } from './quoteitem.service';
import { AccountService } from '../account/account.service';
import { take, switchMap, tap, map } from 'rxjs/operators';
import { Quote } from './quote.model'
import { BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { TaxRate } from './taxrate.model';


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

  constructor(
    private httpClient: HttpClient,
    private corsHttpClient: HTTP,
    private quoteItemService: QuoteitemService,
    private accountService: AccountService
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
    let quote: Quote;
    let createdAt: Date; 
    let updatedAt: Date;
    let fetchedUserId: string;

    createdAt = updatedAt = new Date();
    quote = new Quote(
      Math.random().toString(),
      '',
      createdAt,
      updatedAt,
      0,
      0,
      totalProductPrice,
      totalProductPrice,
      '',
      ''
    );

    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('Error creating quote. User id not found');
        }

        fetchedUserId = userId;
        return this.accountService.token;
      }),
      take(1),
      switchMap(token => {

        quote.userId = fetchedUserId;

        return this.httpClient.post<{ id: string }>(
          `${environment.firebase.databaseURL}quote.json?auth=${token}`, 
          {...quote, id: null}
        );
      }),
      tap(resData => {
        quote.id = resData.id;
        this._quote.next(quote);
      })
    )
  }

  fetchQuote(){
    let fetchedUserId: string;

    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('Error looking up quote. User id not found.');
        }

        fetchedUserId = userId;
        return this.accountService.token;
      }),
      take(1),
      switchMap(token => {
        return this.httpClient.get<{[key: string]: QuoteData}>(`${environment.firebase.databaseURL}quote.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`)
        .pipe(
          map(resData => {
            const quote: Quote[] = [];

            for(const key in resData){
              if(resData.hasOwnProperty(key)){
                quote.push(new Quote(
                  key,
                  resData[key].userId,
                  resData[key].createdAt,
                  resData[key].updatedAt,
                  Math.round((resData[key].taxRate+Number.EPSILON)*100)/100,
                  Math.round((resData[key].taxAmount+Number.EPSILON)*100)/100,
                  Math.round((resData[key].subTotal+Number.EPSILON)*100)/100,
                  Math.round((resData[key].grandTotal+Number.EPSILON)*100)/100,
                  resData[key].deliveryMethod,
                  resData[key].zipCode
                ))
              }
            }

            return quote;
          }),
          tap(quote => {
            this._quote.next(quote[0])
          })
        )}
      )
    )
  }

  updateQuote(
    subtotal: number, 
    taxRate: number, 
    taxAmount: number,
    deliveryMethod: string
  ){  
    let updatedQuote: Quote;
    let fetchedQuote: Quote;
    return this.quote.pipe(
      take(1),
      switchMap(quote => {
        fetchedQuote = quote;
        return this.accountService.token;
      }),
      switchMap(token => {

        // let subtotal = quote.subTotal + totalProductPrice;
        let grandtotal = subtotal + taxAmount;

        updatedQuote = new Quote(
          fetchedQuote.id,
          fetchedQuote.userId,
          fetchedQuote.createdAt,
          new Date(),
          Math.round((taxRate+Number.EPSILON)*100)/100,
          Math.round((taxAmount+Number.EPSILON)*100)/100,
          Math.round((subtotal+Number.EPSILON)*100)/100,
          Math.round((grandtotal+Number.EPSILON)*100)/100,
          deliveryMethod,
          fetchedQuote.zipCode
        );

        return this.httpClient.put(
          `${environment.firebase.databaseURL}quote/${fetchedQuote.id}.json?auth=${token}`,
          {...updatedQuote, id:null}
        );
      }),
      tap(() => {
        this._quote.next(updatedQuote);
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
    let fetchedUserId: string;
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('Could not find user when clearing quote.');
        }

        fetchedUserId = userId;
        return this.accountService.token;
      }),
      switchMap(token => {
        return this.httpClient
          .delete(`${environment.firebase.databaseURL}quote.json?customerId=${fetchedUserId}&auth=${token}`);
      })
    )
  }
}
