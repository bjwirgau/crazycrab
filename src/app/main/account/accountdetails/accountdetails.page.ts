import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { AccountDetails } from './accountdetails.model';
import { AccountdetailsService } from './accountdetails.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accountdetails',
  templateUrl: './accountdetails.page.html',
  styleUrls: ['./accountdetails.page.scss'],
})
export class AccountdetailsPage implements OnInit {
  loadedAccountDetails: AccountDetails[];
  isLoading = false;

  constructor(
    private accountService: AccountService,
    private accountDetailService: AccountdetailsService,
    private router: Router
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.isLoading = true;
    this.accountDetailService.fetchAccountDetails().subscribe(accountDetails => {
      this.loadedAccountDetails = accountDetails;
      this.isLoading = false;
    });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/main/tabs/account');
  }

}
