import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap, take, map, switchMap, defaultIfEmpty } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AccountDetails } from './accountdetails.model';
import { AccountService } from '../account.service';
import { Order } from '../../cart/order.model';
import { AngularFirestore } from 'angularfire2/firestore';

export interface AccountDetailData {
  userId: string,
  email: string,
  firstname: string,
  lastname: string,
  defaultStore: string
}

@Injectable({
  providedIn: 'root'
})
export class AccountdetailsService {

  private _accountdetails = new BehaviorSubject<AccountDetails[]>([]);
  private _orders = new BehaviorSubject<Order[]>([]);

  constructor(
    private httpClient: HttpClient,
    private accountService: AccountService,
    private db: AngularFirestore
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

        return this.db.collection<AccountDetailData>('accounts', ref =>
          ref.where('userId', '==', userId)
        ).valueChanges().pipe(
          map(resData => {
            const accountDetails = [];
            for (const key in resData){
              if (resData.hasOwnProperty(key)){
                accountDetails.push(new AccountDetails(
                  resData[key].userId,
                  resData[key].email,
                  resData[key].firstname,
                  resData[key].lastname,
                  resData[key].defaultStore
                ))
              }
            }

            return accountDetails;
          }),
          tap(accountDetails => {
            this._accountdetails.next(accountDetails);
          })
        );
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
                  resData[key].orderId,
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

  saveAccountDetails(
    accountDetails: AccountDetails,
    defaultStore: string
  ) {
    let account: AccountDetails;
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('Error saving account details. Failed to retrieve user ID.');
        }

        account = new AccountDetails(
          userId,
          accountDetails.email,
          accountDetails.firstname,
          accountDetails.lastname,
          defaultStore
        )

        return this.httpClient.put<{key: string}>(
          `${environment.firebase.databaseURL}accounts/${accountDetails.userId}.json`,
          {...account, id: null}
        );
      })
    )
  }
}
