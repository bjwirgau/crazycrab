import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pickyourspicy',
  templateUrl: './pickyourspicy.page.html',
  styleUrls: ['./pickyourspicy.page.scss'],
})
export class PickyourspicyPage implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  reviewYourSeafood() {
    this.router.navigateByUrl('/main/tabs/menu/chooseyourown/reviewyourseafood');
  }
}
