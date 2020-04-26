import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap, take, map, switchMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AccountDetails } from './accountdetails.model';
import { AccountService } from '../account.service';

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

  private _accountdetails = new BehaviorSubject<AccountDetails[]>([])

  constructor(
    private httpClient: HttpClient,
    private accountService: AccountService
  ) { }

  get accountdetails() {
    return this._accountdetails.asObservable();
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
}
