import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuoteService } from '../quote.service';
import { AlertController } from '@ionic/angular';
import { Quote } from '../quote.model';
import { QuoteItem } from '../quoteitem.model';
import { QuoteitemService } from '../quoteitem.service';
import { OrderService } from '../order.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AccountService } from '../../account/account.service';
import { map, switchMap } from 'rxjs/operators';
declare var Stripe;

const STRIPE_CARD_ERROR = "StripeCardError";
const STRIPE_INVALID_REQUEST = "StripeInvalidRequestError";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit, OnDestroy {
  stripePublishableKey = 'pk_test_LSkBfYHvD6QFYTzCdiMbYCLI006yDnd6jL';
  stripe = Stripe(this.stripePublishableKey);
  isProcessing = false;
  paymentComplete = false;
  cardNumberElement: any;
  cardExpiryElement: any;
  cardCvcElement: any;
  loadedQuote: Quote;
  loadedQuoteItems: QuoteItem[];
  
  private quoteSubscription: Subscription;
  private quoteItemSubscription: Subscription;
  private paymentSubscription: Subscription;
  private removeQuoteItemSubscription: Subscription;
  private removeQuoteSubscription: Subscription;
  private orderCreateSubscription: Subscription;
  private fetchOrderSubscription: Subscription;

  cardBrandToPfClass = {
    'visa': 'pf-visa',
    'mastercard': 'pf-mastercard',
    'amex': 'pf-american-express',
    'discover': 'pf-discover',
    'diners': 'pf-diners',
    'jcb': 'pf-jcb',
    'unknown': 'pf-credit-card',
  }
  

  constructor(
    private httpClient: HttpClient,
    private quoteService: QuoteService,
    private alertController: AlertController,
    private quoteItemService: QuoteitemService,
    private orderService: OrderService,
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    this.setupStripe();

    this.quoteSubscription = this.quoteService.quote.subscribe(quote => {
      this.loadedQuote = quote;
    });
    this.quoteItemSubscription = this.quoteItemService.quoteItems.subscribe(quoteItems => {
      this.loadedQuoteItems = quoteItems;
    })
  }

  ngOnDestroy() {
    if (this.quoteItemSubscription) {
      this.quoteItemSubscription.unsubscribe();
    }
    if (this.removeQuoteItemSubscription) {
      this.removeQuoteItemSubscription.unsubscribe();
    }
    if (this.removeQuoteSubscription) {
      this.removeQuoteSubscription.unsubscribe();
    }
  }

  setupStripe(){
    let self = this;
    let elements = this.stripe.elements();
    var style = {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        lineHeight: '40px',
        fontWeight: 300,
        fontFamily: 'Helvetica Neue',
        fontSize: '15px',
    
        '::placeholder': {
          color: '#CFD7E0',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    this.cardNumberElement = elements.create('cardNumber', { style: style });
    this.cardNumberElement.mount('#card-number-element');

    this.cardExpiryElement = elements.create('cardExpiry', { style: style });
    this.cardExpiryElement.mount('#card-expiry-element');

    this.cardCvcElement = elements.create('cardCvc', { style: style });
    this.cardCvcElement.mount('#card-cvc-element');

    this.cardNumberElement.addEventListener('change', event => {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    this.cardNumberElement.on('change', function(event) {
      // Switch brand logo
      if (event.brand) {
        self.setBrandIcon(event.brand);
      }
    
      self.setOutcome(event);
    });

    var form = document.getElementById('payment-form');
    form.addEventListener('submit', event => {
      event.preventDefault();

      this.stripe.createSource(this.cardNumberElement).then(result => {
        var successElement = document.querySelector('.success');
        var errorElement = document.querySelector('.error');
        successElement.classList.remove('visible');
        errorElement.classList.remove('visible');

        if (result.error) {
          errorElement.textContent = result.error.message;
          errorElement.classList.add('visible');
        } else {
          this.makePayment(result.source).subscribe();
        }
      });
    });
  }

  makePayment(token) {
    this.isProcessing = true;
    let self = this;

    let grandTotal = this.loadedQuote.grandTotal;

    if (grandTotal == 0){
      throw new Error('Cannot charge card with 0 dollar amount!');
    }

    if (grandTotal === null){
      throw new Error('Could not retrieve order total amount!');
    }

    // Multiplying by 100 since Stripe requires integer values for charge amount
    let stripeAdjustedGrandTotal = grandTotal * 100;

    return this.accountService.token.pipe(
      switchMap( accountToken => {
        return this.httpClient
        .post(
          `${environment.firebase.cloudFunctionsUrl}payWithStripe`, 
          {
            amount: Math.floor(stripeAdjustedGrandTotal),
            currency: "usd",
            source: token.id
          },
          { headers: { Authorization: 'Bearer ' + accountToken }}
        )
      }),
      map(data => {
          this.isProcessing = false;
          if (this.paymentSubscription){
            this.paymentSubscription.unsubscribe;
          }

          if(data.hasOwnProperty('id')) {
            this.paymentComplete = true;
            let orderId: number;
            
            this.fetchOrderSubscription = this.orderService.fetchLatestOrder().subscribe(order => {
              orderId = order.length === 0 ? 1 : order[0].orderId+1;
              this.orderCreateSubscription = this.orderService.createOrder(this.loadedQuote, orderId).subscribe(() => {
                this.orderService.createOrderItems(self.loadedQuoteItems, orderId);
                this.orderService.fetchOrderItems(orderId).subscribe(() => {
                  //clear cart items

                  this.quoteItemSubscription = this.quoteItemService.quoteItems.subscribe(quoteItems => {
                    quoteItems.forEach(quoteItem => {
                      this.removeQuoteItemSubscription = this.quoteItemService.removeQuoteItem(quoteItem.id).subscribe();
                    });
                  });

                  this.removeQuoteSubscription = this.quoteService.deleteQuote().subscribe();

                  this.orderService.orderComplete.next(true);

                  this.quoteItemSubscription.unsubscribe();
                  this.quoteSubscription.unsubscribe();

                  this.router.navigateByUrl('/main/tabs/cart/confirmation');
                });
                this.orderCreateSubscription.unsubscribe();
              });
              this.fetchOrderSubscription.unsubscribe();
            });
          } else if(data.hasOwnProperty('type') && (data['type'] === STRIPE_CARD_ERROR ) || data['statusCode'] === 400) {
            console.log(data['raw']['message']);
            const errorAlert = this.alertController.create({
              header: 'Payment Error',
              message: data['raw']['message'],
              buttons: [{
                text: 'Okay'
              }]
            }).then(alertEl => alertEl.present());
          }
        })
      )
  }

  setOutcome(result) {
    var successElement = document.querySelector('.success');
    var errorElement = document.querySelector('.error');
    successElement.classList.remove('visible');
    errorElement.classList.remove('visible');
  
    if (result.token) {
      // In this example, we're simply displaying the token
      successElement.querySelector('.token').textContent = result.token.id;
      successElement.classList.add('visible');
  
      // In a real integration, you'd submit the form with the token to your backend server
      //var form = document.querySelector('form');
      //form.querySelector('input[name="token"]').setAttribute('value', result.token.id);
      //form.submit();
    } else if (result.error) {
      errorElement.textContent = result.error.message;
      errorElement.classList.add('visible');
    }
  }

  setBrandIcon(brand) {
    var brandIconElement = document.getElementById('brand-icon');
    var pfClass = 'pf-credit-card';
    if (brand in this.cardBrandToPfClass) {
      pfClass = this.cardBrandToPfClass[brand];
    }
    for (var i = brandIconElement.classList.length - 1; i >= 0; i--) {
      brandIconElement.classList.remove(brandIconElement.classList[i]);
    }
    brandIconElement.classList.add('pf');
    brandIconElement.classList.add(pfClass);
  }

}
