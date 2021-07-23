import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import { take, switchMap, tap, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AccountService } from '../account/account.service';
import { AccountDetails } from '../account/accountdetails/accountdetails.model';
import { AccountDetailData } from '../account/accountdetails/accountdetails.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private _accounts = new BehaviorSubject<AccountDetailData[]>([]);

  constructor(
    private httpClient: HttpClient,
    private accountService: AccountService,
    private router: Router
  ) { }

  get accounts() {
    return this._accounts.asObservable();
  }

  getUsers() {
    return this.accountService.token.pipe(
      take(1),
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
        return this.httpClient.get<{[key: string]: AccountDetailData }>(`${environment.firebase.databaseURL}accounts.json?auth=${token}`)
      }),
      map(accountData => {
        const userAccounts: AccountDetails[] = []
        
        for (const key in accountData){
          if (accountData.hasOwnProperty(key)){
            userAccounts.push(new AccountDetails(
              key,
              accountData[key].email,
              accountData[key].firstname,
              accountData[key].lastname,
              accountData[key].defaultStore,
              accountData[key].isAdmin
            ))
          }
        }

        return userAccounts;
      }),
      tap(accounts => {
        this._accounts.next(accounts);
      })

    )
  }
}
