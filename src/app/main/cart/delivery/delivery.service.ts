import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuoteService } from '../quote.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  constructor(
    private httpClient: HttpClient,
    private quoteService: QuoteService
  ) { }

  saveDeliveryMethod(deliveryMethod: string) {
    this.quoteService.fetchQuote().subscribe(quote => {
      this.quoteService.updateQuote(
        0, 
        quote[0].taxRate, 
        quote[0].taxAmount, 
        deliveryMethod
      )
      .subscribe();
    })
  }
}
