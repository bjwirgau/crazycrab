import { Component, OnInit, ViewChild } from '@angular/core';
import { QuoteService } from '../quote.service';
import { NgForm } from '@angular/forms';
import { IonRadioGroup } from '@ionic/angular'
import { DeliveryService } from './delivery.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.page.html',
  styleUrls: ['./delivery.page.scss'],
})
export class DeliveryPage implements OnInit {

  @ViewChild('deliveryMethods', {static: false}) deliveryMethods: IonRadioGroup

  private selectedMethod: any;

  constructor(
    private quoteService: QuoteService,
    private deliveryService: DeliveryService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onDeliveryMethodChange(event: CustomEvent) {
    this.selectedMethod = event.detail['value'];
  }

  saveDeliveryMethod(event: CustomEvent){
    this.deliveryService.saveDeliveryMethod(this.selectedMethod);
    this.router.navigateByUrl('/main/tabs/cart/payment');
  }

}
