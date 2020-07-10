import { Component, OnInit, ViewChild } from '@angular/core';
import { Seafood } from './seafood.model';
import { SeafoodService } from './seafood.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuService } from '../menu.service';
import { Subscription } from 'rxjs';
import { NgForm, FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ValidationComponent } from './validation/validation.component';

@Component({
  selector: 'app-chooseyourown',
  templateUrl: './chooseyourown.page.html',
  styleUrls: ['./chooseyourown.page.scss'],
})
export class ChooseyourownPage implements OnInit {
  loadedSeafood: Seafood[];
  seafoodSub: Subscription;
  isLoading = false;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private seafoodService: SeafoodService,
    private router: Router,
    private menuService: MenuService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.seafoodSub = this.seafoodService.seafood.subscribe(seafood => {
      this.loadedSeafood = seafood;
    });

    this.isLoading = true;
    this.seafoodService.fetchSeafood().subscribe(() => {
      this.isLoading = false;
    })
  }

  onSubmit(form: NgForm) {
    let isValid = false;
    this.loadedSeafood.forEach(seafood => {
      if (form.value[seafood.id]) {
        isValid = true;
      }
    })

    if (!isValid) {
      this.modalCtrl.create({
        component: ValidationComponent,
      })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
    } else {
      this.router.navigateByUrl('/main/tabs/menu/chooseyourown/pickyoursauce');
    }
  }

  chooseSauce() {

  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  
  addSeafood($event, seafood: Seafood) {
    if ($event && $event.srcElement.id) {
      let buttonId = $event.srcElement.id;
      let inputId = buttonId.replace("button-", "");
      inputId = inputId.replace("-add", "");
      let weightEl = <HTMLInputElement>document.getElementById(inputId);
      let weight = weightEl.value;
      let subtotalEl = <HTMLInputElement>document.getElementById(inputId+"-subtotal");
      if (!weight) {
        weight = '0';
      }

      weightEl.value = (parseFloat(weight)+0.5).toFixed(1);
      let subtotal = (parseFloat(weightEl.value)*parseFloat(seafood.price)).toFixed(2);
      subtotalEl.value = '$'+subtotal;
      this.seafoodService.updateSeafood(inputId, seafood.name, weightEl.value, seafood.price, subtotal, seafood.imageUrl);
    }
  }

  reduceSeafood($event, seafood: Seafood) {
    if ($event && $event.srcElement.id) {
      let buttonId = $event.srcElement.id;
      let inputId = buttonId.replace("button-", "");
      inputId = inputId.replace("-remove", "");
      let weightEl = <HTMLInputElement>document.getElementById(inputId);
      let weight = weightEl.value;
      let subtotalEl = <HTMLInputElement>document.getElementById(inputId+"-subtotal");
      if (parseFloat(weight) < 0 || !weight){
        return;
      }

      weightEl.value = (parseFloat(weight)-0.5).toFixed(1);
      // if (parseFloat(weightEl.value) === 0){
      //   this.seafoodService.removeSeafood(seafood);
      // }
      let subtotal = (parseFloat(weightEl.value)*parseFloat(seafood.price)).toFixed(2);
      subtotalEl.value = '$'+subtotal;
      this.seafoodService.updateSeafood(inputId, seafood.name, weightEl.value, seafood.price, subtotal, seafood.imageUrl);
    }
  }

}
