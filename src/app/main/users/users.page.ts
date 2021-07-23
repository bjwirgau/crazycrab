import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountDetails } from '../account/accountdetails/accountdetails.model';
import { UsersService } from './users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit, OnDestroy {

  public loadedUsers: AccountDetails[];
  
  private accountsSubscription: Subscription;

  constructor(
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.accountsSubscription = this.usersService.getUsers().subscribe(users => {
      this.loadedUsers = users;
    })
  }

  ngOnDestroy() {
    if (this.accountsSubscription) {
      this.accountsSubscription.unsubscribe();
    }
  }

}
