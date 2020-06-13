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

  createQuote(totalProductPrice: number){
    let quote: Quote;
    let createdAt: Date; 
    let updatedAt: Date;

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

        quote.userId = userId;

        return this.httpClient.post<{ id: string }>(
          `${environment.firebase.databaseURL}quote.json`, 
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
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('Error looking up quote. User id not found.');
        }

        return this.httpClient
        .get<{[key: string]: QuoteData}>(`${environment.firebase.databaseURL}quote.json?orderBy="userId"&equalTo="${userId}"`)
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
                  resData[key].taxRate,
                  resData[key].taxAmount,
                  resData[key].subTotal,
                  resData[key].grandTotal,
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
    totalProductPrice: number, 
    taxRate: number, 
    taxAmount: number,
    deliveryMethod: string
  ){  
    let updatedQuote: Quote;
    return this.quote.pipe(
      take(1),
      switchMap(quote => {
        let subtotal = quote.subTotal + totalProductPrice;
        let grandtotal = subtotal + taxAmount;

        updatedQuote = new Quote(
          quote.id,
          quote.userId,
          quote.createdAt,
          new Date(),
          taxRate,
          taxAmount,
          subtotal,
          grandtotal,
          deliveryMethod,
          quote.zipCode
        );

        return this.httpClient.put(
          `${environment.firebase.databaseURL}quote/${quote.id}.json`,
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
      let amount = 0;
      quoteItems.forEach(quoteItem => {
        amount += quoteItem.totalItemPrice;
      });
      this._subtotal.next(amount);
      if (this._taxRate.getValue()){
        this._taxAmount.next(amount * this._taxRate.getValue()['rate']['stateUseTax']);
      }
      this._grandTotal.next(amount + this._taxAmount.getValue());

    })
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

      console.log("Deleting quote item");

      return this.httpClient
        .delete(`${environment.firebase.databaseURL}quote.json?customerId=${userId}`);
    })
  }
}
