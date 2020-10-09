import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Spicy } from './spicy.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { AccountService } from 'src/app/main/account/account.service';

@Injectable({
  providedIn: 'root'
})
export class PickyourSpicyservice {

  private _spicy = new BehaviorSubject<Spicy[]>([]);

  constructor(
    private httpClient: HttpClient,
    private accountService: AccountService
  ) { }

  get spicies() {
    return this._spicy.asObservable();
  }

  fetchSpicies() {
    return this.accountService.token.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.get<{[key: string]: Spicy}>(`${environment.firebase.databaseURL}spicy.json?auth=${token}`);
      }),
      map(resData => {
        const spicies: Spicy[] = [];

        for (const key in resData){
          if (resData.hasOwnProperty(key)){
            spicies.push(new Spicy(
              resData[key].id,
              resData[key].label
            ))
          }
        }

        return spicies;
      }),
      tap(spicies => {
        this._spicy.next(spicies);
      })
    )
  }
}
