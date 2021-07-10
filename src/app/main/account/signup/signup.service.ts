import { Injectable } from '@angular/core';
import { AccountService } from '../account.service';
import { take, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AccountDetails } from '../accountdetails/accountdetails.model';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  private _account = new BehaviorSubject<AccountDetails>(null)

  constructor(
    private accountService: AccountService,
    private httpClient: HttpClient,
    private router: Router
  ) { }

    get account(){
      return this._account.asObservable();
    }

  createAccount(
    email: string,
    firstname: string,
    lastname: string,
    isAdmin: boolean = false
  ) {
    let generatedId: string;
    let account: AccountDetails;
    let userId: string;
    return this.accountService.userId.pipe(
      take(1),
      switchMap(id => {
        userId = id;
        return this.accountService.token;
      }),
      switchMap(token => {
        if (!token) {
          this.accountService.logout();
          this.router.navigateByUrl('/main/tabs/account');
          return NEVER;
        } else {
          return of(token);
        }
      }),
      switchMap(token => {
        if (!userId){
          throw new Error('User id not found!');
        }
        account = new AccountDetails(
          userId,
          email,
          firstname,
          lastname,
          '',
          isAdmin
        )

        return this.httpClient.post<{key: string}>(
          `${environment.firebase.databaseURL}accounts.json?auth=${token}`,
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
