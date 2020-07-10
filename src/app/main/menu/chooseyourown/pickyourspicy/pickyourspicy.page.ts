import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeafoodService } from '../../chooseyourown/seafood.service';
import { PickyourSpicyservice } from './pickyourspicy.service';
import { Spicy } from './spicy.model';

@Component({
  selector: 'app-pickyourspicy',
  templateUrl: './pickyourspicy.page.html',
  styleUrls: ['./pickyourspicy.page.scss'],
})
export class PickyourspicyPage implements OnInit {

  loadedSpicies: Spicy[];
  isLoading: boolean;

  constructor(
    private router: Router,
    private seafoodService: SeafoodService,
    private spicyService: PickyourSpicyservice
  ) { }

  ngOnInit() {
    this.spicyService.spicies.subscribe(spicies => {
      this.loadedSpicies = spicies;
    });

    this.isLoading = true;
    this.spicyService.fetchSpicies().subscribe(() => {
      this.isLoading = false;
    })
  }

  pickYourSpicy(spicyLevel: string) {
    this.seafoodService.chooseSpicyLevel(spicyLevel);
    this.router.navigateByUrl('/main/tabs/menu/chooseyourown/reviewyourseafood');
  }
}
