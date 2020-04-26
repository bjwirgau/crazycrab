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
    console.log(form);
    console.log(form.value);
    let isValid = false;
    this.loadedSeafood.forEach(seafood => {
      // console.log(seafood.id);
      // console.log('value: '+form.value['blackmussels']);
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
    console.log('Choosing Sauce');
    

  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  
  addSeafood($event) {
    if ($event && $event.srcElement.id) {
      let buttonId = $event.srcElement.id;
      let inputId = buttonId.replace("button-", "");
      inputId = inputId.replace("-add", "");
      let inputEl = <HTMLInputElement>document.getElementById(inputId);
      let weight = inputEl.value;
      if (!weight) {
        weight = '0';
      }

      inputEl.value = (parseFloat(weight)+0.5).toFixed(1);
    }
  }

  removeSeafood($event) {
    if ($event && $event.srcElement.id) {
      let buttonId = $event.srcElement.id;
      let inputId = buttonId.replace("button-", "");
      inputId = inputId.replace("-remove", "");
      let inputEl = <HTMLInputElement>document.getElementById(inputId);
      let weight = inputEl.value;
      if (parseFloat(weight) === 0 || !weight){
        return;
      }

      inputEl.value = (parseFloat(weight)-0.5).toFixed(1);
    }
  }

}
