import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';

import { MenuItem } from './menu-item.model';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { QuoteitemService } from '../cart/quoteitem.service';

interface MenuData {
  title: string,
  imageUrl: string,
  type: string,
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _menuItems = new BehaviorSubject<MenuItem[]>([]);
  private _menuHistory: string[] = ['menu'];
  constructor(
    private httpClient: HttpClient,
    private loadingCtrl: LoadingController,
    private quoteItemService: QuoteitemService
  ) { }

  get menuItems() {
    return this._menuItems.asObservable();
  }

  get menuHistory() {
    return this._menuHistory;
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

  addMenuHistory(category: string){
    this._menuHistory.push(category);
  }

  removeMenuHistory(){
    this._menuHistory.splice(-1,1);
  }
}
