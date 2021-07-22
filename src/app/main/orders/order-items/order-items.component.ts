import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrderService } from '../../cart/order.service';
import { OrderItem } from '../../cart/orderitem.model';

@Component({
  selector: 'app-order-items',
  templateUrl: './order-items.component.html',
  styleUrls: ['./order-items.component.scss'],
})
export class OrderItemsComponent implements OnInit {
  @Input() orderId;

  orderItems: OrderItem[];
  itemOptions: [];

  orderItemSubscription: Subscription;

  constructor(
    private orderService: OrderService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.orderItemSubscription = this.orderService.fetchOrderItems(this.orderId).subscribe(orderItems => {
      console.log('ngOnInit', this.orderId, orderItems);
      this.orderItems = orderItems;
      this.orderItemSubscription.unsubscribe();
      this.changeDetector.detectChanges();
    });
  }
}
