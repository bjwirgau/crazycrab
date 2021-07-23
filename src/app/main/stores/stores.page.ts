import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from './store.model';
import { StoresService } from './stores.service';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.page.html',
  styleUrls: ['./stores.page.scss'],
})
export class StoresPage implements OnInit, OnDestroy {

  storesSubscription: Subscription;

  loadedStores: Store[];

  constructor(
    private storesService: StoresService
  ) { }

  ngOnInit() {
    this.storesSubscription = this.storesService.getStores().subscribe(stores => {
      this.loadedStores = stores;
    })
  }

  ngOnDestroy() {
    if (this.storesSubscription) {
      this.storesSubscription.unsubscribe();
    }
  }

  addStore() {
    this.loadedStores.push(new Store(
      0, 0, true, '', '', '', '', 12345, false, '', {}, { latitude: 0, longitude: 0}
    ))
  }

}
