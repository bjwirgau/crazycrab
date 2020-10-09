import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { Sauce } from './sauce.model'
import { BehaviorSubject } from 'rxjs';
import { AccountService } from 'src/app/main/account/account.service';

@Injectable({
  providedIn: 'root'
})
export class PickyoursauceService {

  private _sauces = new BehaviorSubject<Sauce[]>([]);

  constructor(
    private httpClient: HttpClient,
    private accountService: AccountService
  ) { }

  get sauces() {
    return this._sauces.asObservable();
  }

  fetchFlavors() {
    return this.accountService.token.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.get<{[key: string]: Sauce}>(`${environment.firebase.databaseURL}flavor.json?auth=${token}`)
      }),
      map(resData => {
        const sauces: Sauce[] = [];

        for (const key in resData){
          if (resData.hasOwnProperty(key)){
            sauces.push(new Sauce(
              resData[key].id,
              resData[key].label
            ))
          }
        }

        return sauces;
      }),
      tap(sauces => {
        this._sauces.next(sauces);
      })
    )
  }
}
