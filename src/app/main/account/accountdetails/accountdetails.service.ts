import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap, take, map, switchMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AccountDetails } from './accountdetails.model';
import { AccountService } from '../account.service';
import { Order } from '../../cart/order.model';

export interface AccountDetailData {
  userId: string,
  email: string,
  firstname: string,
  lastname: string,
}

@Injectable({
  providedIn: 'root'
})
export class AccountdetailsService {

  private _accountdetails = new BehaviorSubject<AccountDetails[]>([]);
  private _orders = new BehaviorSubject<Order[]>([]);

  constructor(
    private httpClient: HttpClient,
    private accountService: AccountService
  ) { }

  get accountdetails() {
    return this._accountdetails.asObservable();
  }

  get orders() {
    return this._orders.asObservable();
  }

  fetchAccountDetails(){
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }

        return this.httpClient
          .get<{ [key: string]: AccountDetailData }>(
            `${environment.firebase.databaseURL}accounts.json?orderBy="userId"&equalTo="${userId}"`
          )
          .pipe(
            map(accountDetailData => {
              const accountDetails = [];

              for (const key in accountDetailData) {
                if (accountDetailData.hasOwnProperty(key)) {
                  accountDetails.push(
                    new AccountDetails(
                      key,
                      accountDetailData[key].email,
                      accountDetailData[key].firstname,
                      accountDetailData[key].lastname
                    )
                  );
                }
              }
              return accountDetails;
            }),
            tap(accountDetails => {
              this._accountdetails.next(accountDetails);
            })
          )
      })
    )
  }

  fetchOrderHistory(){
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('User ID not found when retrieving order history!');
        }

        return this.httpClient
        .get<{[key: string]: Order}>(
          `${environment.firebase.databaseURL}order.json?orderBy="userId"&equalTo="${userId}"`
        ).pipe(
          map(resData => {
            const orders: Order[] = [];

            for(const key in resData){
              if(resData.hasOwnProperty(key)){
                orders.push(new Order(
                  key,
                  resData[key].userId,
                  resData[key].createdAt,
                  resData[key].updatedAt,
                  resData[key].taxRate,
                  resData[key].taxAmount,
                  resData[key].subTotal,
                  resData[key].grandTotal,
                  resData[key].deliveryMethod
                ))
              }
            }

            return orders;
          }),
          tap(orders => {
            this._orders.next(orders)
          })
        )
      })
    )
  }

  
}
