import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { OrderItem } from '../orderitem.model';
import { Router } from '@angular/router';
import { ConfirmationService } from './confirmation.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.page.html',
  styleUrls: ['./confirmation.page.scss'],
})
export class ConfirmationPage implements OnInit {
  loadedOrder: Order;
  loadedOrderItems: OrderItem[];
  isOrderLoading: boolean;
  isOrderItemsLoading: boolean;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    if (this.orderService.orderComplete.getValue()){
      this.isOrderLoading = true;

      this.orderService.fetchLatestOrder().subscribe(order => {
          this.orderService.fetchOrderItems(order[0].orderId).subscribe(orderItems => {
            this.loadedOrderItems = orderItems;

            this.loadedOrder = order[0];
            this.isOrderLoading = false;
            this.orderService.orderComplete.next(false);
    
            this.confirmationService.sendOrderConfirmationEmail();
          });  
      });
    } else {
      this.router.navigateByUrl('/main/tabs/menu');
    }
  }

  isObject(option): boolean {
    return typeof option === 'object'
  }

  getValues(values) {
    return Object.values(values);
  }

}
