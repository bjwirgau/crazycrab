import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { StoreLocation } from './location.model';
import { BehaviorSubject } from 'rxjs';
import { Geolocation } from '@ionic-native/geolocation/ngx';

interface StoreLocationData {
  id: string,
  title: string,
  street: string,
  city: string,
  state: string,
  zip: string,
  hours: {},
  open: boolean,
  expanded: boolean,
  storeId: number,
  phonenumber: string,
  coordinates: {}
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private _storeLocations = new BehaviorSubject<StoreLocation[]>([]);

  constructor(
    private httpClient: HttpClient,

  ) { }

  get storeLocations() {
    return this._storeLocations.asObservable();
  }

  fetchLocations() {
    return this.httpClient
      .get<{[key: string]: StoreLocationData }>(`${environment.firebase.databaseURL}store-configuration/store-addresses.json`)
      .pipe(map(resData => {
        const storeLocations = [];
        for (const key in resData){
          if (resData.hasOwnProperty(key)){
            storeLocations.push(new StoreLocation(
              key,
              resData[key].title,
              resData[key].street,
              resData[key].city,
              resData[key].state,
              resData[key].zip,
              resData[key].hours,
              resData[key].open,
              resData[key].expanded,
              resData[key].storeId,
              resData[key].phonenumber,
              resData[key].coordinates
            ))
          }
        }

        return storeLocations;
      }),
      tap(storeLocations => {
        this._storeLocations.next(storeLocations);
      })
    );
  }
}
