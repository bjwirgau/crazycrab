import { Component, AfterViewInit, ViewChild, ElementRef, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { Gesture, GestureController, IonCard } from '@ionic/angular';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements AfterViewInit {
  // newItems = Array.from(Array(5).keys());
  newItems = [
    {
      'id': 1,
      'name': "Item 1"
    },
    {
      'id': 2,
      'name': "Item 2"
    }
  ];
  completeItems = [
    {
      'id': 3,
      'name': "Item 3"
    },
    {
      'id': 4 ,
      'name': "Item 4"
    }
  ];
  gestureArray: Gesture[] = [];

  @ViewChild('newItemsDropzone', {static: false}) newItemDrop: ElementRef;
  @ViewChild('completeItemsDropzone', {static: false}) completeItemDrop: ElementRef;

  @ViewChildren(IonCard, {read: ElementRef}) items: QueryList<ElementRef>;

  constructor(
    private gestureCtrl: GestureController,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    this.updateGestures();
  }

  updateGestures() {
    this.gestureArray.map(gesture => gesture.destroy());
    this.gestureArray = [];

    const array = this.items.toArray();

    for (let i = 0; i < array.length; i++) {
      const oneItem = array[i];

      const drag = this.gestureCtrl.create({
        el: oneItem.nativeElement,
        threshold: 1,
        gestureName: 'drag',
        onStart: event => {
          oneItem.nativeElement.style.transition = '';
          oneItem.nativeElement.style.opacity = '0.5';
          oneItem.nativeElement.style.transform = 'rotate(-10deg)';
          this.changeDetectorRef.detectChanges();
        },
        onMove: event => {
          oneItem.nativeElement.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(-10deg)`;
          oneItem.nativeElement.style.zIndex = 11;
          this.checkDropzoneHover(event.currentX, event.currentY);
        },
        onEnd: event => {
          this.handleDrop(oneItem, event.currentX, event.currentY, i);
        }
      });

      drag.enable();
      this.gestureArray.push(drag);
    }

    this.items.changes.subscribe(res => {
      console.log('items changed: ', res);
    });
  }

  checkDropzoneHover(x, y) {
    const newItemDrop = this.newItemDrop.nativeElement.getBoundingClientRect();
    const completeItemDrop = this.completeItemDrop.nativeElement.getBoundingClientRect();

    if (this.isInZone(x, y, newItemDrop)) {
      this.newItemDrop.nativeElement.style.backgroundColor = 'blue';
    } else {
      this.newItemDrop.nativeElement.style.backgroundColor = 'white';
    }

    if (this.isInZone(x, y, completeItemDrop)) {
      this.completeItemDrop.nativeElement.style.backgroundColor = 'red';
    } else {
      this.completeItemDrop.nativeElement.style.backgroundColor = 'white';
    }
  }

  isInZone(x, y, dropzone) {
    if (x < dropzone.left || x >= dropzone.right) {
      return false;
    }
    if (y < dropzone.top || y >= dropzone.bottom) {
      return false;
    }

    return true;
  }

  handleDrop(item, endX, endY, index) {
    const newItemDrop = this.newItemDrop.nativeElement.getBoundingClientRect();
    const completeItemDrop = this.completeItemDrop.nativeElement.getBoundingClientRect();

    if (this.isInZone(endX, endY, newItemDrop)) {
      const removedItem = this.completeItems.splice(index, 1);
      this.newItems.push(removedItem[0]);
      item.nativeElement.remove();
    } else if (this.isInZone(endX, endY, completeItemDrop)) {
      const removedItem = this.newItems.splice(index, 1);
      this.completeItems.push(removedItem[0]);
      item.nativeElement.remove();
    } else {
      item.nativeElement.style.transition = '.2 ease-out';
      item.nativeElement.style.zIndex = 'inherit';
      item.nativeElement.style.transform = 'translate(0, 0) rotate(10deg)';
      item.nativeElement.style.opacity = '1';
      item.nativeElement.style.fontWeight = 'normal';
    }

    this.completeItemDrop.nativeElement.style.backgroundColor = 'white';
    this.newItemDrop.nativeElement.style.backgroundColor = 'white';
    this.changeDetectorRef.detectChanges();
    this.updateGestures();
  }

}
