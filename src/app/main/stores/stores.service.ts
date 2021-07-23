import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import { take, switchMap, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AccountService } from '../account/account.service';
import { Store } from './store.model';

export interface StoreData {
  id: number,
  storeId: number;
  open: boolean;
  title: string;
  street: string;
  city: string;
  state: string;
  zip: number;
  expanded: boolean;
  phonenumber: string;
  hours: {};
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StoresService {

  private _stores = new BehaviorSubject<any>(null);

  constructor(
    private accountService: AccountService,
    private router: Router,
    private httpClient: HttpClient
  ) { }

  get stores() {
    return this._stores.asObservable();
  }

  getStores() {
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
        return this.httpClient.get<{[key: string]: StoreData }>(`${environment.firebase.databaseURL}store-addresses.json?auth=${token}`)
      }),
      map(storeData => {
        const stores: Store[] = []
        
        for (const key in storeData){
          if (storeData.hasOwnProperty(key)){
            stores.push(new Store(
              storeData[key].id,
              storeData[key].storeId,
              storeData[key].open,
              storeData[key].title,
              storeData[key].street,
              storeData[key].city,
              storeData[key].state,
              storeData[key].zip,
              storeData[key].expanded,
              storeData[key].phonenumber,
              storeData[key].hours,
              storeData[key].coordinates
            ))
          }
        }

        return stores;
      }),
      tap(stores => {
        this._stores.next(stores);
      })

    )
  }
}
