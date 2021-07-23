import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { NEVER } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AccountService } from '../account/account.service';

export interface OrderConfiguration {
  archiveOrderPeriod: number,
  availability: {},
  lunch: {
    availability: {
      end: number;
      start: number;
    }
  },
  storeAddresses: {}
}

export interface yesNo {

}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  private _configuration = new BehaviorSubject<OrderConfiguration>(null);

  constructor(
    private accountService: AccountService,
    private router: Router,
    private httpClient: HttpClient
  ) { }

  get configuration() {
    return this._configuration.asObservable();
  }

  getConfiguration() {
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
        return this.httpClient.get<OrderConfiguration>(`${environment.firebase.databaseURL}store-configuration.json?auth=${token}`)
        .pipe(
          take(1),
          tap(configData => {
            this._configuration.next(configData);
          })
        )
      }),
    )
  }

  saveConfiguration(data) {
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
        return this.httpClient.put<{key: string}>(
          `${environment.firebase.databaseURL}store-configuration.json?auth=${token}`,
          {...data, id: null}
        );
      })
    )
  }
}
