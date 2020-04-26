import { Injectable } from '@angular/core';
import { AccountService } from '../account.service';
import { take, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AccountDetails } from '../accountdetails/accountdetails.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  private _account = new BehaviorSubject<AccountDetails>(null)

  constructor(
    private accountService: AccountService,
    private httpClient: HttpClient
  ) { }

    get account(){
      return this._account.asObservable();
    }

  createAccount(
    email: string,
    firstname: string,
    lastname: string
  ) {
    let generatedId: string;
    let account: AccountDetails;
    return this.accountService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('User id not found!');
        }
        account = new AccountDetails(
          userId,
          email,
          firstname,
          lastname
        )

        return this.httpClient.post<{key: string}>(
          `${environment.firebase.databaseURL}accounts.json`,
          {...account, id: null}
        );
      }),
      switchMap(resData => {
        generatedId = resData.key;
        return this.account
      }),
      take(1),
      tap(account => {
        if (account){
          account.userId = generatedId;
          this._account.next(account);
        }
      })
    )
  }
}
