import { Component, OnInit } from '@angular/core';
import { QuoteitemService } from './cart/quoteitem.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  count: number;

  constructor(
    private quoteItemService: QuoteitemService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.quoteItemService.quoteItems.subscribe(quoteItems => {
      this.count = 0;
      quoteItems.forEach(item => {
        this.count += item.itemQuantity;
      })
    });
  }

}
