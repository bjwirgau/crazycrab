import { Component, OnInit } from '@angular/core';
import { cardstore } from '../card/cardstore';
import { listschema } from '../list/listschema';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  cardStore: cardstore;
  lists: listschema[];

  constructor() { }

  ngOnInit() {
    this.setMockData();
  }

  setMockData(): void {
    this.cardStore = new cardstore();
    const lists: listschema[] = [
      {
        name: 'Incoming',
        cards: []
      },
      {
        name: 'In Progress',
        cards: []
      },
      {
        name: 'Complete',
        cards: []
      }
    ]

    this.lists = lists;
  }

}
