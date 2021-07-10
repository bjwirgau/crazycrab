import { Component, Input, OnInit } from '@angular/core';
import { cardschema } from './cardschema';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() card: cardschema;

  constructor() { }

  ngOnInit() {}

  dragStart(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }

}
