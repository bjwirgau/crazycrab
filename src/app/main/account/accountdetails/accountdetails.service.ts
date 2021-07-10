import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap, take, map, switchMap, defaultIfEmpty } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AccountDetails } from './accountdetails.model';
import { AccountService } from '../account.service';
import { Order } from '../../cart/order.model';

export interface AccountDetailData {
  userId: string,
  email: string,
  firstname: string,
  lastname: string,
  defaultStore: string,
  isAdmin: boolean
}

@Injectable({
  providedIn: 'root'
})
export class AccountdetailsService {

  private _accountdetails = new BehaviorSubject<AccountDetails>(null);
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
    let fetchedUserId: string;
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }

        fetchedUserId = userId;
        return this.accountService.token;
      }),
      switchMap(token => {
        return this.httpClient
          .get<{ [key: string]: AccountDetailData }>(
            `${environment.firebase.databaseURL}accounts.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`
          )
          .pipe(
            map(accountDetailData => {
              const accountData = accountDetailData[Object.keys(accountDetailData)[0]];
              const accountId = Object.keys(accountDetailData)[0];

              return new AccountDetails(
                accountId,
                accountData.email,
                accountData.firstname,
                accountData.lastname,
                accountData.defaultStore,
                accountData.isAdmin
              )
              // const accountDetails:AccountDetails[] = [];

              // for (const key in accountDetailData) {
              //   if (accountDetailData.hasOwnProperty(key)) {
                  
              //     accountDetails.push(
              //       new AccountDetails(
              //         key,
              //         accountDetailData[key].email,
              //         accountDetailData[key].firstname,
              //         accountDetailData[key].lastname,
              //         accountDetailData[key].defaultStore,
              //         accountDetailData[key].isAdmin
              //       )
              //     );
              //   }
              // }
              return accountData;
            }),
            tap(accountDetails => {
              this._accountdetails.next(accountDetails);
            })
          )
      })
    )
  }

  fetchOrderHistory(){
    let fetchedUserId: string;
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('User ID not found when retrieving order history!');
        }

        fetchedUserId = userId;
        return this.accountService.token;
      }),
      switchMap(token => {
        return this.httpClient
        .get<{[key: string]: Order}>(
          `${environment.firebase.databaseURL}order.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`
        ).pipe(
          map(resData => {
            const orders: Order[] = [];

            for(const key in resData){
              if(resData.hasOwnProperty(key)){
                orders.push(new Order(
                  key,
                  resData[key].orderId,
                  resData[key].userId,
                  resData[key].createdAt,
                  resData[key].updatedAt,
                  resData[key].taxRate,
                  resData[key].taxAmount,
                  resData[key].subTotal,
                  resData[key].grandTotal,
                  resData[key].deliveryMethod,
                  resData[key].prepTime
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

  saveAccountDetails(
    accountDetails: AccountDetails,
    defaultStore: string
  ) {
    let account: AccountDetails;
    let fetchedUserId: string;
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('Error saving account details. Failed to retrieve user ID.');
        }

        fetchedUserId = userId;
        return this.accountService.token;
      }),
      switchMap(token => {

        account = new AccountDetails(
          fetchedUserId,
          accountDetails.email,
          accountDetails.firstname,
          accountDetails.lastname,
          defaultStore,
          accountDetails.isAdmin
        )

        return this.httpClient.put<{key: string}>(
          `${environment.firebase.databaseURL}accounts/${fetchedUserId}.json?auth=${token}`,
          {...account, id: null}
        );
      })
    )
  }
}
