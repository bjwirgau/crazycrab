import { Injectable } from '@angular/core';
import { AccountService } from '../account.service';
import { take, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AccountDetails } from '../accountdetails/accountdetails.model';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  private _account = new BehaviorSubject<AccountDetails>(null)

  constructor(
    private accountService: AccountService,
    private httpClient: HttpClient,
    private db: AngularFirestore
  ) { }

    get account(){
      return this._account.asObservable();
    }

  createAccount(
    email: string,
    firstname: string,
    lastname: string
  ) {
    let account: AccountDetails;

    return this.accountService.userId.pipe(
      take(1),
      map(userId => {
        if (!userId){
          throw new Error('User id not found when creating a new account!');
        }

        account = new AccountDetails(
          userId,
          email,
          firstname,
          lastname,
          ''
        )

        // let accountDoc = this.db.doc<any>(`accounts/${userId}`);
        let accountCollection = this.db.collection<any>(`accounts`);
        accountCollection.add({
          userId: account.userId,
          email: account.email,
          firstname: account.firstname,
          lastname: account.lastname,
          defaultStore: account.defaultStore
        }).then(() => {
          console.log('Account created successfully!');
        }).catch(err => {
          console.log('Error creating acount.', err);
        });
      })
    )
  }
}
