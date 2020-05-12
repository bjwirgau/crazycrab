import { Injectable } from '@angular/core';
import { Seafood } from './seafood.model';
import { map, tap, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

interface SeafoodData {
  name: string,
  imageUrl: string,
  price: string
}

@Injectable({
  providedIn: 'root'
})
export class SeafoodService {
  private _seafood = new BehaviorSubject<Seafood[]>([])

  constructor(
    private httpClient: HttpClient
  ) { }

  get seafood() {
    return this._seafood.asObservable();
  }

  fetchSeafood() {
    return this.httpClient
      .get<{[key: string]: SeafoodData }>(environment.firebase.databaseURL+'chooseyourown.json')
      .pipe(map(resData => {
        const seafood = [];
        for (const key in resData){
          if (resData.hasOwnProperty(key)){
            seafood.push(new Seafood(
              key,
              resData[key].name,
              resData[key].imageUrl,
              resData[key].price
            ))
          }
        }

        return seafood;
      }),
      tap(seafood => {
        this._seafood.next(seafood);
      })
    );
  }

  getSeafood(id: string) {
    return this._seafood.pipe(
      take(1),
      map(appetizers => {
        return {...appetizers.find(app => app.id === id)};
      })
    );
  }

}
