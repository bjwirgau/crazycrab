import { Injectable } from '@angular/core';
import { Seafood, CustomizedSeafood } from './seafood.model';
import { map, tap, take, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import { AccountService } from '../../account/account.service';
import { Router } from '@angular/router';

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
  private _customizedSeafood = new BehaviorSubject<CustomizedSeafood[]>([])

  constructor(
    private httpClient: HttpClient,
    private accountService: AccountService,
    private router: Router
  ) { }

  get seafood() {
    return this._seafood.asObservable();
  }

  get customizedSeafood() {
    return this._customizedSeafood.asObservable();
  }

  fetchSeafood() {
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
        return this.httpClient.get<{[key: string]: SeafoodData }>(`${environment.firebase.databaseURL}chooseyourown.json?auth=${token}`)
      }),
      map(resData => {
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

  updateSeafood(
    id: string, 
    name: string, 
    weight: string, 
    price: string, 
    subtotal: string, 
    imageUrl: string
  ){
    const customizedSeafood = this._customizedSeafood.getValue();

    const newSeafood = new CustomizedSeafood(
      id,
      name,
      [],
      '',
      weight,
      price,
      subtotal,
      imageUrl
    );

    const seafoodIndex = customizedSeafood.findIndex(seafood => seafood.id === newSeafood.id);
    if (seafoodIndex === -1){
      customizedSeafood.push(newSeafood);
      this._customizedSeafood.next(customizedSeafood);
    } else if (parseFloat(weight) <= 0){
      this.removeSeafood(newSeafood)
    } else {
      customizedSeafood[seafoodIndex] = newSeafood;
      this._customizedSeafood.next(customizedSeafood);
    }
  }

  removeSeafood(customSeafood: Seafood){
    this._customizedSeafood.next(this._customizedSeafood.getValue().filter(seafood => seafood.id !== customSeafood.id));
  }

  chooseSpicyLevel(spicyLevel: string){
    this._customizedSeafood.subscribe(customizedSeafood => {
      customizedSeafood.forEach(seafood => {
        seafood.spicyLevel = spicyLevel;
      })
    });
  }

  chooseFlavor(flavor: any[]){
    this._customizedSeafood.subscribe(customizedSeafood => {
      customizedSeafood.forEach(seafood => {
        seafood.flavor = flavor;
      })
    });
  }

  clearSeafood() {
    this._customizedSeafood.next([]);
  }

}
