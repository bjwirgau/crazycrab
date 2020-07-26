import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { AccountdetailsService } from '../../account/accountdetails/accountdetails.service';
import { OrderService } from '../order.service';


@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  constructor(
    private httpClient: HttpClient,
    private accountDetails: AccountdetailsService,
    private orderService: OrderService,
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
          let params = new HttpParams()
            .set("firstname", accountDetails[0].firstname)
            .set("lastname", accountDetails[0].lastname)
            .set("recipientEmail", accountDetails[0].email)
            .set("orderDate", new Date(order[0].createdAt).toLocaleString('en-US', {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }))
            .set("subtotal", order[0].subTotal.toString())
            .set("tax", order[0].taxAmount.toString())
            .set("grandtotal", order[0].grandTotal.toString())
            .set("orderItems", JSON.stringify(orderItems))

            return this.httpClient.get(
              `${environment.firebase.localCloudFunctionsUrl}sendConfirmation`, {params}
            ).pipe(
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
