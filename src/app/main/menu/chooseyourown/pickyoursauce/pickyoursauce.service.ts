import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { map, tap } from 'rxjs/operators';

import { Sauce } from './sauce.model'
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PickyoursauceService {

  private _sauces = new BehaviorSubject<Sauce[]>([]);

  constructor(
    private httpClient: HttpClient,
  ) { }

  get sauces() {
    return this._sauces.asObservable();
  }

  fetchFlavors() {
    return this.httpClient
      .get<{[key: string]: Sauce}>(environment.firebase.databaseURL+'flavor.json')
      .pipe(
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
