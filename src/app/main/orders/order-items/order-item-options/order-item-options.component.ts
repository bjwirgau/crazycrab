import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-item-options',
  templateUrl: './order-item-options.component.html',
  styleUrls: ['./order-item-options.component.scss'],
})
export class OrderItemOptionsComponent implements OnInit {
  @Input() options;

  constructor() { }

  ngOnInit() {
    if (this.options) {
      this.options = Object.entries(this.options);
    }
  }

}
