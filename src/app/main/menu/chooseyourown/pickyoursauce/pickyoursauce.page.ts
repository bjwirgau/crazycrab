import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeafoodService } from '../../chooseyourown/seafood.service';
import { PickyoursauceService } from './pickyoursauce.service';
import { Sauce } from './sauce.model';

@Component({
  selector: 'app-pickyoursauce',
  templateUrl: './pickyoursauce.page.html',
  styleUrls: ['./pickyoursauce.page.scss'],
})
export class PickyoursaucePage implements OnInit {

  loadedFlavors: Sauce[];
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

    this.isLoading = true;
    this.sauceService.fetchFlavors().subscribe(() => {
      this.isLoading = false;
    })
  }

  pickYourFlavor(flavor: string) {
    this.seafoodService.chooseFlavor(flavor);
    this.router.navigateByUrl('/main/tabs/menu/chooseyourown/pickyourspicy');
  }

}
