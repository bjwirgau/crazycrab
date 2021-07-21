import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order } from '../cart/order.model';
import { OrderService } from '../cart/order.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements AfterViewInit, OnInit {

  newOrders: Order[] = [];
  pendingOrders: Order[] = [];
  completeOrders: Order[] = [];

  newOrderGestureArray: Gesture[] = [];
  pendingOrderGestureArray: Gesture[] = [];
  completeOrderGestureArray: Gesture[] = [];
  contentScrollActive = true;

  newItemSubscription: Subscription;
  pendingItemSubscription: Subscription;
  completeItemSubscription: Subscription;
  itemSubscription: Subscription;

  @ViewChild('newDropzone') newDropzone: ElementRef;
  @ViewChild('pendingDropzone') pendingDropzone: ElementRef;
  @ViewChild('completeDropzone') completeDropzone: ElementRef;
  @ViewChildren('newItems', {read: ElementRef}) newItems: QueryList<ElementRef>;
  @ViewChildren('pendingItems', {read: ElementRef}) pendingItems: QueryList<ElementRef>;
  @ViewChildren('completeItems', {read: ElementRef}) completeItems: QueryList<ElementRef>;

  constructor(
    private gestureCtrl: GestureController,
    private changeDetector: ChangeDetectorRef,
    private ordersService: OrderService
  ) { }

  ngOnInit() {
    this.ordersService.fetchOrdersByStatus(`${environment.orderStatuses.new}`).subscribe(newOrders => {
      this.newOrders = newOrders;
    });
    this.ordersService.fetchOrdersByStatus(`${environment.orderStatuses.pending}`).subscribe(pendingOrders => {
      this.pendingOrders = pendingOrders;
    });
    this.ordersService.fetchOrdersByStatus(`${environment.orderStatuses.complete}`).subscribe(completeOrders => {
      this.completeOrders = completeOrders;
    });
  }

  ngAfterViewInit() {
    this.updateGestures(this.newItems, 'new');
    this.updateGestures(this.pendingItems, 'pending');
    this.updateGestures(this.completeItems, 'complete');
  }

  updateGestures(orderItems, status) {

    if (status == 'new') {
      this.newOrderGestureArray.map(gesture => gesture.destroy());
      this.newOrderGestureArray = [];
    }

    if (status == 'pending') {
      this.pendingOrderGestureArray.map(gesture => gesture.destroy());
      this.pendingOrderGestureArray = [];
    }

    if (status == 'complete') {
      this.completeOrderGestureArray.map(gesture => gesture.destroy());
      this.completeOrderGestureArray = [];
    }

    const arr = orderItems.toArray();

    for (let i=0; i < arr.length; i++ ) {
      const orderItem = arr[i];

      const drag = this.gestureCtrl.create({
        el: orderItem.nativeElement,
        threshold: 1,
        gestureName: 'drag',
        onStart: ev => {
          orderItem.nativeElement.style.transform = '';
          orderItem.nativeElement.style.opacity = '0.6';
          orderItem.nativeElement.style.fontWeight = 'normal';
          this.contentScrollActive = false;
          this.changeDetector.detectChanges();
        },
        onMove: ev => {
          this.contentScrollActive = false;
          orderItem.nativeElement.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
          orderItem.nativeElement.style.zIndex = 11;
          this.checkDropzoneHover(ev.currentX);
        },
        onEnd: ev => {
          orderItem.nativeElement.style.zIndex = 1;
          this.contentScrollActive = true;
          this.handleDrop(orderItem, ev.currentX, i);
          this.contentScrollActive = true;
        }
      });
      drag.enable();
      if (status == 'new') {
        this.newOrderGestureArray.push(drag);
      }
      if (status == 'pending') {
        this.pendingOrderGestureArray.push(drag);
      }
      if (status == 'complete') {
        this.completeOrderGestureArray.push(drag);
      }
    }

    this.itemSubscription = orderItems.changes.subscribe(res => {
      if (this.newOrderGestureArray.length != orderItems.length && status == 'new' ) {
        this.updateGestures(orderItems, 'new');
      }
      if (this.pendingOrderGestureArray.length != orderItems.length && status == 'pending') {
        this.updateGestures(orderItems, 'pending');
      }
      if (this.completeOrderGestureArray.length != orderItems.length && status == 'complete') {
        this.updateGestures(orderItems, 'complete');
      }
      this.itemSubscription.unsubscribe();
    })
  }

  checkDropzoneHover(x) {
    const newDropzone = this.newDropzone.nativeElement.getBoundingClientRect();
    const pendingDropzone = this.pendingDropzone.nativeElement.getBoundingClientRect();
    const completeDropzone = this.completeDropzone.nativeElement.getBoundingClientRect();

    if (this.isInZone(x, newDropzone)) {
      this.newDropzone.nativeElement.style.backgroundColor = 'red';
    } else {
      this.newDropzone.nativeElement.style.backgroundColor = 'white';
    }
  
    if (this.isInZone(x, pendingDropzone)) {
      this.pendingDropzone.nativeElement.style.backgroundColor = 'yellow';
    } else {
      this.pendingDropzone.nativeElement.style.backgroundColor = 'white';
    }

    if (this.isInZone(x, completeDropzone)) {
      this.completeDropzone.nativeElement.style.backgroundColor = 'green';
    } else {
      this.completeDropzone.nativeElement.style.backgroundColor = 'white';
    }
  }

  isInZone(x, dropzone) {
    if (x < dropzone.left || x >= dropzone.right) {
      return false;
    }

    return true;
  }

  handleDrop(item, x, index) {
    const newDropzone = this.newDropzone.nativeElement.getBoundingClientRect();
    const pendingDropzone = this.pendingDropzone.nativeElement.getBoundingClientRect();
    const completeDropzone = this.completeDropzone.nativeElement.getBoundingClientRect();

    const currentStatus = item.nativeElement.parentElement.id

    if (this.isInZone(x, newDropzone) && currentStatus !== 'new-status') {
      switch (currentStatus) {
        case 'pending-status':
          let pendingItem = this.pendingOrders.splice(index, 1);
          // Update object
          pendingItem[0].status = `${environment.orderStatuses.new}`;
          this.ordersService.updateOrder(pendingItem[0]).subscribe();
          this.newOrders.unshift(pendingItem[0]);
          item.nativeElement.remove();
          break;
        case 'complete-status':
          let completeItem = this.completeOrders.splice(index, 1);
          // Update object
          completeItem[0].status = `${environment.orderStatuses.new}`;
          this.ordersService.updateOrder(completeItem[0]).subscribe();
          this.newOrders.unshift(completeItem[0]);
          item.nativeElement.remove();
          break;
      }
    } else if (this.isInZone(x, pendingDropzone) && currentStatus !== 'pending-status') { 
      switch (currentStatus) {
        case 'new-status':
          let newItem = this.newOrders.splice(index, 1);
          // Update object
          newItem[0].status = `${environment.orderStatuses.pending}`;
          this.ordersService.updateOrder(newItem[0]).subscribe();
          this.pendingOrders.unshift(newItem[0]);
          item.nativeElement.remove();
          break;
        case 'complete-status':
          let completeItem = this.completeOrders.splice(index, 1);
          // Update object
          completeItem[0].status = `${environment.orderStatuses.pending}`;
          this.ordersService.updateOrder(completeItem[0]).subscribe();
          this.pendingOrders.unshift(completeItem[0]);
          item.nativeElement.remove();
          break;
      }
    } else if (this.isInZone(x, completeDropzone) && currentStatus !== 'complete-status') {
      switch (currentStatus) {
        case 'new-status':
          let newItem = this.newOrders.splice(index, 1);
          // Update object
          newItem[0].status = `${environment.orderStatuses.complete}`;
          this.ordersService.updateOrder(newItem[0]).subscribe();
          this.completeOrders.unshift(newItem[0]);
          item.nativeElement.remove();
          break;
        case 'pending-status':
          let pendingItem = this.pendingOrders.splice(index, 1);
          // Update object
          pendingItem[0].status = `${environment.orderStatuses.complete}`;
          this.ordersService.updateOrder(pendingItem[0]).subscribe();
          this.completeOrders.unshift(pendingItem[0]);
          item.nativeElement.remove();
          break;
      }
    } else {
      item.nativeElement.style.transition = '.2 ease-out';
      item.nativeElement.style.zIndex = '1';
      item.nativeElement.style.transform = 'translate(0,0)';
      item.nativeElement.style.opacity = '1',
      item.nativeElement.style.fontWeight = 'normal';
    }

    this.newDropzone.nativeElement.style.backgroundColor = 'white';
    this.pendingDropzone.nativeElement.style.backgroundColor = 'white';
    this.completeDropzone.nativeElement.style.backgroundColor = 'white';
    this.changeDetector.detectChanges();
  }

}
