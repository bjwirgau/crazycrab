import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Spicy } from './spicy.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PickyourSpicyservice {

  private _spicy = new BehaviorSubject<Spicy[]>([]);

  constructor(
    private httpClient: HttpClient
  ) { }

  get spicies() {
    return this._spicy.asObservable();
  }

  fetchSpicies() {
    return this.httpClient
      .get<{[key: string]: Spicy}>(environment.firebase.databaseURL+'spicy.json')
      .pipe(
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
