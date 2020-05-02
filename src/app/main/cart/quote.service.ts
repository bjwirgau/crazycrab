import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';

import { environment } from 'src/environments/environment';
import { QuoteitemService } from './quoteitem.service';
import { AccountService } from '../account/account.service';
import { take, switchMap, tap, map } from 'rxjs/operators';
import { QuoteItem } from './quoteitem.model';
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
}

@Injectable({
  providedIn: 'root'
})
export class QuoteService {

  private _taxRate = new BehaviorSubject<TaxRate>(null);
  private _subtotal: number = 0;
  private _quote = new BehaviorSubject<Quote>(null);
  private _taxAmount = new BehaviorSubject<number>(0);
  private _grandTotal: number = 0;

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
      this._grandTotal
      // quoteItemIds,
      // 'takeout',
    );

    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('Error creating quote. User id not found');
        }

        // if (!this._taxAmount){
        //   throw new Error('Could not calculate tax amount!');
        // }

        // if (!this._subtotal){
        //   throw new Error('Could not calculate subtotal!');
        // }

        // if (!this._grandTotal){
        //   throw new Error('Could not calculate grand total');
        // }

        quote.userId = userId;
        
        console.log("Saving quote to database.");
        console.log(quote);

        return this.httpClient.post<{ id: string }>(
          `${environment.firebase.databaseURL}quote.json`, 
          {...quote, id: null}
        );
      }),
      tap(resData => {
        console.log(resData);
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
            console.log("Result", resData);
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
                  resData[key].grandTotal
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
    taxAmount: number
  ){  
    let updatedQuote: Quote;
    return this.quote.pipe(
      take(1),
      switchMap(quote => {
        let subtotal = quote.subTotal + totalProductPrice;
        let grandtotal = quote.subTotal + taxAmount;

        updatedQuote = new Quote(
          quote.id,
          quote.userId,
          quote.createdAt,
          new Date(),
          taxRate,
          taxAmount,
          subtotal,
          grandtotal
        );
       
        console.log("Updating quote", `${environment.firebase.databaseURL}quote/${quote.id}.json`);
        console.log("Updated Quote", updatedQuote);
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

  calculateSubtotal(){
    this.quoteItemService.quoteItems.subscribe(quoteItems => {
      this._subtotal = 0;
      for (let item of quoteItems){ 
        this._subtotal += item.totalItemPrice;
      }
    })
  }

  calculateGrandTotal(){
    this._grandTotal
  }

  calculateTax(zip: string = '48033'){
    let taxRate: TaxRate;
    console.log("Getting tax rate from zip tax...");
    
    return this.httpClient
      .get<TaxData>(`http://api.zip-tax.com/request/v40?key=${environment.ziptax.key}&postalcode=${zip}`).pipe(
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
          this._taxAmount.next(taxRate.rate.taxSales*this._subtotal);
        })
      );

  }
}
