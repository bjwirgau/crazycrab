import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AccountService, AuthResponseData } from '../account.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Observable, combineLatest, concat } from 'rxjs';
import { AccountdetailsService, AccountDetailData } from '../accountdetails/accountdetails.service';
import { SignupService } from './signup.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  isLoading = false;

  constructor(
    private accountService: AccountService,
    private accountDetailService: AccountdetailsService,
    private signupService: SignupService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  ngOnInit(
  ) {
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    const firstname = form.value.firstname;
    const lastname = form.value.lastname;

    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Creating account...' })
      .then(loadingEl => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>
        let accountObs: Observable<AccountDetailData>
        authObs = this.accountService.createUser(email,password);
        accountObs = this.signupService.createAccount(email,firstname,lastname);

        concat(authObs, accountObs).subscribe(response => {
          loadingEl.dismiss();
          this.router.navigateByUrl('/main/tabs/account/accountdetails');
        }, errorReponse => {
          loadingEl.dismiss();
          const code = errorReponse.error.error.message;
          let message = '';
          switch (code) {
            case 'EMAIL_EXISTS':
              message = 'Email already exists. Please try another email.';
              break;
            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
              message = 'Too many attempts. Try again later.'
          }

          this.showError(message);
        });
      });
  }

  private showError(message: string){
    this.alertCtrl.create({
      header: 'Authentication Failed',
      message: message,
      buttons: ['Okay']
    }).then(
      alertEl => alertEl.present()
    );
  }

}
