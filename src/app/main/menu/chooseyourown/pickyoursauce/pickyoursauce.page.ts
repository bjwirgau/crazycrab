import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pickyoursauce',
  templateUrl: './pickyoursauce.page.html',
  styleUrls: ['./pickyoursauce.page.scss'],
})
export class PickyoursaucePage implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  pickYourSpicy() {
    this.router.navigateByUrl('/main/tabs/menu/chooseyourown/pickyourspicy');
  }

}
