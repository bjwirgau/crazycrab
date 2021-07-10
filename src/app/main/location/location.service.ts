import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { StoreLocation } from './location.model';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AccountService } from '../account/account.service';
import { AvailabilityConfiguration } from '../configuration/availability.model';
import { Router } from '@angular/router';

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
  coordinates: {},
  cutoffTime: number
}

interface AvailabilityConfigurationInterface {
  enabled: boolean,
  availabilityInterval: number,
  baseLeadTime: number,
  overflowThreshold: number,
  overflowInterval: number,
  overflowLeadTime: number
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private _storeLocations = new BehaviorSubject<StoreLocation[]>([]);
  private _availabilityConfiguration = new BehaviorSubject<AvailabilityConfiguration[]>([]);

  constructor(
    private httpClient: HttpClient,
    private accountService: AccountService,
    private router: Router,
    private geolocation: Geolocation
  ) { }

  get storeLocations() {
    return this._storeLocations.asObservable();
  }

  get availabilityConfig() {
    return this._availabilityConfiguration.asObservable();
  }

  fetchLocations() {
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
        return this.httpClient.get<{[key: string]: StoreLocationData }>(`${environment.firebase.databaseURL}store-configuration/store-addresses.json?auth=${token}`)
      }),
      map(resData => {
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
              resData[key].coordinates,
              resData[key].cutoffTime
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

  fetchAvailabilityConfiguration() {
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
        return this.httpClient.get<{[key: string]: AvailabilityConfigurationInterface }>(`${environment.firebase.databaseURL}store-configuration/availability.json?auth=${token}`)
      }),
      map(resData => {
        let availabilityConfiguration = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            availabilityConfiguration.push( new AvailabilityConfiguration(
              resData[key].enabled,
              resData[key].availabilityInterval,
              resData[key].baseLeadTime,
              resData[key].overflowThreshold,
              resData[key].overflowInterval,
              resData[key].overflowLeadTime
            ))
          }
        }
        
        return availabilityConfiguration;
      }),
      tap(availabilityConfig => {
        this._availabilityConfiguration.next(availabilityConfig);
      })
    )
  }

  fetchNearbyLocations(locations) {
    let currentLocation;
    this.geolocation.getCurrentPosition().then(location => {
      currentLocation = location;
      return this.httpClient.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${currentLocation.coords.latitude},${currentLocation.coords.longitude}&destinations=42.47358466,-83.28482151&key=AIzaSyBQBDQ5aEiImcHAFRGBf1QUpTmDbNRlIl4}`).subscribe()
    })
  }
}
