import { Component, OnInit, Input } from '@angular/core';
import { Order } from 'src/app/main/cart/order.model';
import { ModalController } from '@ionic/angular';
import { OrderService } from 'src/app/main/cart/order.service';
import { OrderItem } from 'src/app/main/cart/orderitem.model';

@Component({
  selector: 'app-orderdetails',
  templateUrl: './orderdetails.component.html',
  styleUrls: ['./orderdetails.component.scss'],
})
export class OrderdetailsComponent implements OnInit {
  @Input() selectedOrder: Order;

  public orderItems: OrderItem[];

  constructor(
    private modalController: ModalController,
    private orderService: OrderService
  ) { }

  ngOnInit() {
    this.orderService.fetchOrderItems(this.selectedOrder.orderId).subscribe(orderItems => {
      this.orderItems = orderItems;
    })
  }

  onCloseOrderDetails(){
    this.modalController.dismiss(null, 'cancel');
  }

  isObject(option): boolean {
    return typeof option === 'object'
  }

  getValues(values) {
    return Object.values(values);
  }

}
