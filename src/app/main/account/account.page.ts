import { Component, OnInit } from '@angular/core';
import { AccountService, LoginResponseData } from './account.service';
import { Router } from '@angular/router';
import { LoadingController, ModalController, AlertController } from '@ionic/angular';
import { NgForm, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  isLoading = false;
  form: FormGroup;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    if(this.accountService.userIsAuthenticated){
      this.router.navigateByUrl('/main/tabs/account/accountdetails');
    }
  }

  login(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then(loadingEl => {
        loadingEl.present();
        let authObs: Observable<LoginResponseData>;
        authObs = this.accountService.authenticate(email, password);
        authObs.subscribe(resData => {
          this.isLoading = false;
          loadingEl.dismiss();
          this.router.navigateByUrl('/main/tabs/account/accountdetails');
        }, errorRes => {
          loadingEl.dismiss();
          const code = errorRes.error.error.message;
          let message = '';
          switch (code) {
            case 'EMAIL_NOT_FOUND':
            case 'INVALID_PASSWORD':
              message = 'Login Failed. Invalid email or password.';
              break;
            case 'USER_DISABLED':
              message = 'Account has been disabled. Contact Crazy Crab for Support.';
          }

          this.showError(message);
        });
      });
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.login(email, password);
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
