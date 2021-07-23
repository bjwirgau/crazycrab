import { Component, Input, OnInit } from '@angular/core';
import { Store } from '../store.model';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit {
  @Input() store: Store;

  constructor() { }

  ngOnInit() {}

}
