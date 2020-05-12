import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuoteService } from '../quote.service';
import { AlertController } from '@ionic/angular';
import { Quote } from '../quote.model';
import { QuoteItem } from '../quoteitem.model';
import { QuoteitemService } from '../quoteitem.service';
import { OrderService } from '../order.service';
declare var Stripe;
// import { Stripe } from '@ionic-native/stripe/ngx'

const localFirebaseFunctionUrl:string = 'http://localhost:5000/crazycrab-4ec7b/us-central1/payWithStripe';
const prodFirebaseFunctionUrl:string = 'https://us-central1-crazycrab-4ec7b.cloudfunctions.net/payWithStripe';
const STRIPE_CARD_ERROR = "StripeCardError";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  stripePublishableKey = 'pk_test_LSkBfYHvD6QFYTzCdiMbYCLI006yDnd6jL';
  stripe = Stripe(this.stripePublishableKey);
  isProcessing = false;
  paymentComplete = false;
  cardNumberElement: any;
  cardExpiryElement: any;
  cardCvcElement: any;
  loadedQuote: Quote;
  loadedQuoteItems: QuoteItem[];

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
    private orderService: OrderService
  ) { }

  ngOnInit() {
    this.setupStripe();

    this.quoteService.quote.subscribe(quote => {
      this.loadedQuote = quote;
    });
    this.quoteItemService.quoteItems.subscribe(quoteItems => {
      this.loadedQuoteItems = quoteItems;
    })
  }

  ionViewWillEnter() {
    
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
          this.makePayment(result.source);
        }
      });
    });
  }

  makePayment(token) {
    let grandTotal: number;

    this.quoteService.quote.subscribe(quote => {
      this.isProcessing = true;
      if (!quote || !quote.grandTotal){
        throw new Error('Could not retrieve order total amount!');
      }

      grandTotal = parseFloat(quote.grandTotal.toFixed(2));

      this.httpClient
        .post(
          prodFirebaseFunctionUrl, 
          {
            amount: grandTotal,
            currency: "usd",
            source: token.id
          }
        )
        .subscribe(data => {
          this.isProcessing = false;

          if(data.hasOwnProperty('id')) {
            this.paymentComplete = true;

            //create order
            this.orderService.createOrder(this.loadedQuote).subscribe();

            //clear cart items
            this.quoteItemService.clearQuoteItems().subscribe();
            this.quoteService.deleteQuote().subscribe();
          } else if(data.hasOwnProperty('type') && data['type'] === STRIPE_CARD_ERROR ) {
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
    });
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
