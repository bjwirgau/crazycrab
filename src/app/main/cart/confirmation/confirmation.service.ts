import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { AccountdetailsService } from '../../account/accountdetails/accountdetails.service';
import { OrderService } from '../order.service';
import { AccountService } from '../../account/account.service';


@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  constructor(
    private httpClient: HttpClient,
    private accountDetails: AccountdetailsService,
    private orderService: OrderService,
    private accountService: AccountService
  ) { }

  sendOrderConfirmationEmail(){
    this.accountDetails.fetchAccountDetails().subscribe(accountDetails => {
      this.orderService.fetchLatestOrder().subscribe(order => {
        /** 
         * @todo Need to figure out how to send order items to email template. 
         * There is documentation using handlebars to iterate through json objects here: 
         * https://sendgrid.com/docs/for-developers/sending-email/using-handlebars/#iterations 
         */
        this.orderService.fetchOrderItems(order[0].orderId).subscribe(orderItems => {
          return this.accountService.token.pipe(
            switchMap(token => {
              return this.httpClient.post(
                `${environment.firebase.cloudFunctionsUrl}sendConfirmation`, 
                {
                  firstname: accountDetails[0].firstname,
                  lastname: accountDetails[0].lastname,
                  orderId: order[0].orderId,
                  recipientEmail: accountDetails[0].email,
                  orderDate: new Date(order[0].createdAt).toLocaleString('en-US', {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
                  subtotal: order[0].subTotal.toString(),
                  tax: order[0].taxAmount.toString(),
                  grandtotal: order[0].grandTotal.toString(),
                  orderItems: JSON.stringify(orderItems),
                  pickupTime: new Date(order[0].prepTime).toLocaleString('en-US', {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
                },
                {headers: { Authorization: 'Bearer ' + token}}
              )
            }),
            map(result => {
              console.log(result);
            })
          ).subscribe();
        })
      })
      }
    )
  }
}
