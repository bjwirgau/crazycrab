import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeafoodService } from '../../chooseyourown/seafood.service';
import { PickyoursauceService } from './pickyoursauce.service';
import { Sauce } from './sauce.model';
import { Spicy } from './spicy.model';

@Component({
  selector: 'app-pickyoursauce',
  templateUrl: './pickyoursauce.page.html',
  styleUrls: ['./pickyoursauce.page.scss'],
})
export class PickyoursaucePage implements OnInit {

  loadedFlavors: Sauce[];
  loadedSpicy: Spicy[];
  isLoading: boolean;

  constructor(
    private router: Router,
    private seafoodService: SeafoodService,
    private sauceService: PickyoursauceService
  ) { }

  ngOnInit() {
    this.sauceService.sauces.subscribe(flavors => {
      this.loadedFlavors = flavors;
    });

    this.sauceService.spicies.subscribe(spicies => {
      this.loadedSpicy = spicies;
    });

    this.isLoading = true;
    this.sauceService.fetchFlavors().subscribe(() => {
      this.isLoading = false;
    });

    this.isLoading = true;
    this.sauceService.fetchSpicies().subscribe(() => {
      this.isLoading = false;
    })
  }

  // pickYourFlavor(flavor: string) {
  //   this.seafoodService.chooseFlavor(flavor);
  //   this.router.navigateByUrl('/main/tabs/menu/chooseyourown/pickyourspicy');
  // }
  
  finalizeOptions(){
    var flavors = [];
    const selectedFlavors = document.querySelectorAll('ion-checkbox.flavor.option-input[checked]')
    selectedFlavors.forEach(flavorEl => {
      flavors.push(flavorEl.parentElement.id);
    });

    const selectedSpicy = document.querySelector('.spicy.option-input');
    const spicy = selectedSpicy.parentElement.id;

    this.seafoodService.chooseFlavor(flavors);
    this.seafoodService.chooseSpicyLevel(spicy);

    this.router.navigateByUrl('/main/tabs/menu/chooseyourown/reviewyourseafood');
  }

  selectSauce(event: any) {
    const selectedOption = event.srcElement.closest('ion-row');
    const selectedCheckbox = selectedOption.getElementsByTagName('ion-checkbox')[0];
    if (selectedOption.id === "allmixed") {
      const allOptions = event.srcElement.closest('ion-grid').getElementsByTagName('ion-checkbox');
      for (let option of allOptions) {
        option.classList.remove('checkbox-checked');
        option.closest('ion-row').classList.remove('selected');
        option.removeAttribute('checked');
      }
      selectedCheckbox.classList.add('checkbox-checked');
      selectedCheckbox.closest('ion-row').classList.add('selected');
      selectedCheckbox.setAttributeNode(document.createAttribute('checked'));
    } else {
      const checkEl = event.srcElement.closest('ion-row').getElementsByTagName('ion-checkbox')[0];
      checkEl.classList.toggle('checkbox-checked');
      event.srcElement.closest('ion-row').classList.toggle('selected');
      checkEl.toggleAttribute('checked');
      const allMixedOption = document.querySelector('#allmixed').getElementsByTagName('ion-checkbox')[0];
      allMixedOption.classList.remove('checkbox-checked');
      allMixedOption.closest('ion-row').classList.remove('selected');
      allMixedOption.removeAttribute('checked');
    }
  }

  selectSpicy(event: any){
    const selectedOption = event.srcElement.closest('ion-row');
    const selectedCheckbox = selectedOption.getElementsByTagName('ion-checkbox')[0];
    const allOptions = event.srcElement.closest('ion-grid').getElementsByTagName('ion-checkbox');
    for (let option of allOptions) {
      option.classList.remove('checkbox-checked');
      option.closest('ion-row').classList.remove('selected');
      option.removeAttribute('checked');
    }
    selectedCheckbox.classList.add('checkbox-checked');
    selectedCheckbox.closest('ion-row').classList.add('selected');
    selectedCheckbox.setAttributeNode(document.createAttribute('checked'));
  }

}
