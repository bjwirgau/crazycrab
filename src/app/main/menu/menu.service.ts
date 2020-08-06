import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { Globalization, GlobalizationOptions } from '@ionic-native/globalization/ngx';

import { MenuItem } from './menu-item.model';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { LunchAvailability } from './lunch-availability.model';

interface MenuData {
  title: string,
  imageUrl: string,
  type: string,
}

interface LunchAvailabilityData {
  start: string,
  end: string
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _menuItems = new BehaviorSubject<MenuItem[]>([]);
  private _lunchAvailability = new BehaviorSubject<LunchAvailability>(null);

  currentCategory = new BehaviorSubject<string>('');
  private _menuHistory: string[] = ['menu'];

  constructor(
    private httpClient: HttpClient,
    private globalization: Globalization
  ) { }

  get menuItems() {
    return this._menuItems.asObservable();
  }

  get menuHistory() {
    return this._menuHistory;
  }

  get lunchAvailability() {
    return this._lunchAvailability;
  }

  fetchMenuItems(category: string = 'menu') {
    return this.httpClient
      .get<{[key: string]: MenuData }>(`${environment.firebase.databaseURL}${category}.json`)
      .pipe(map(resData => {
        const menuItems = [];
        for (const key in resData){
          if (resData.hasOwnProperty(key)){
            menuItems.push(new MenuItem(
              key,
              resData[key].title,
              resData[key].imageUrl,
              resData[key].type
            ))
          }
        }

        return menuItems;
      }),
      tap(menuItems => {
        this._menuItems.next(menuItems);
      })
    );
  }

  fetchLunchAvailability() {
    return this.httpClient
      .get<LunchAvailabilityData>(`${environment.firebase.databaseURL}store-configuration/lunch/availability.json`)
      .pipe(map(resData => {
        let lunchAvailability: LunchAvailability;
        lunchAvailability = new LunchAvailability(
          resData.start,
          resData.end
        );

        return lunchAvailability;
      }),
      tap(availability => {
        this._lunchAvailability.next(availability);
      })
    )
  }

  addMenuHistory(category: string){
    this._menuHistory.push(category);
  }

  removeMenuHistory(){
    this._menuHistory.splice(-1,1);
  }

  isLunchItems(): boolean {
    switch (this.currentCategory.getValue()){
      case 'lunch':
        return true;
      case 'boiled-lunch':
        return true;
      case 'fried-lunch':
        return true;
      default:
        return false;
    }
  }

  formatTime(time: number): string {
    if (!time){
      return '';
    }

    let timeSegments = time.toString().match(/.{1,2}/g);

    let timeSuffix = '';
    if (timeSegments[0] >= "12"){
      timeSuffix = 'PM'
      if (timeSegments[0] >= "13"){
        let newTime = parseInt(timeSegments[0]) - 12;
        timeSegments[0] = newTime.toString();
      }
    } else {
      timeSuffix = 'AM'
    }

    return `${timeSegments[0]}:${timeSegments[1]} ${timeSuffix}`;
  }
}
