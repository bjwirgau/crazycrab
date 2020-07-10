import { Component, OnInit, NgZone } from '@angular/core';
import { SeafoodService } from '../../chooseyourown/seafood.service';
import { Router } from '@angular/router';
import { CustomizedSeafood } from '../seafood.model';
import { ProductService } from '../../product/product.service';
import { ProductOption } from '../../product/product-options.model';


@Component({
  selector: 'app-reviewyourseafood',
  templateUrl: './reviewyourseafood.page.html',
  styleUrls: ['./reviewyourseafood.page.scss'],
})
export class ReviewyourseafoodPage implements OnInit {

  currentSeafood: CustomizedSeafood[];
  chooseYourOwnSubtotal: number;
  complete: boolean;

  constructor(
    private router: Router,
    private seafoodService: SeafoodService,
    private productService: ProductService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.complete = false;
    this.seafoodService.customizedSeafood.subscribe(seafood => {
      this.currentSeafood = seafood;
      this.chooseYourOwnSubtotal = 0;
      seafood.forEach(item => {
        this.chooseYourOwnSubtotal += parseFloat(item.subtotal)
      })
    })
  }

  addSeafoodToCart(customizedSeafood: CustomizedSeafood[]) {
    let options:{} = {};
    let subtotal = 0;
    

    customizedSeafood.forEach(seafood => {
      let unit: string = "Pounds";
      if (parseFloat(seafood.weight) === 1.0 ){
        unit = "Pound";
      }
      options[seafood.id] = {
        'item': `${seafood.weight} ${unit} ${seafood.name}`
      }
      options['flavor'] = seafood.flavor;
      options['spicy'] = seafood.spicyLevel;

      subtotal += parseFloat(seafood.subtotal);
    });

    this.productService.addItemToCart(
      'chooseyourown',
      'Seafood Combo',
      subtotal,
      subtotal,
      1,
      options,
      "/assets/placeholder.png"
    )

    this.complete = true;

  }

}
