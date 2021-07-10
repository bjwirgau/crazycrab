import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.page.html',
  styleUrls: ['./forgotpassword.page.scss'],
})
export class ForgotpasswordPage implements OnInit {

  constructor(
    public ngFireAuth: AngularFireAuth,
    public alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;

    this.resetPassword(email);
  }

  resetPassword(email) {
    return this.ngFireAuth.sendPasswordResetEmail(email)
    .then(() => {
      this.showMessage('If there is an associated email, an email will be sent.');
    }).catch(() => {
      this.showError('Error sending reset password link.');
    })
  }

  private showMessage(message: string){
    this.alertCtrl.create({
      header: 'Reset Password Sent!',
      message: message,
      buttons: ['Okay']
    }).then(
      alertEl => alertEl.present()
    );
  }

  private showError(message: string){
    this.alertCtrl.create({
      header: 'Reset Password Sent!',
      message: message,
      buttons: ['Okay']
    }).then(
      alertEl => alertEl.present()
    );
  }

}
