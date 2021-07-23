import { Component, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigService } from './config.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
})
export class ConfigPage implements OnInit {
  @Output() loadedConfiguration: {};

  configSubscription: Subscription;

  ionicForm: FormGroup;
  isLoading: boolean
  
  constructor(
    private configService: ConfigService,
    public formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit(
  ) {
    this.ionicForm = new FormGroup({
      archiveOrderPeriod: new FormControl(),
      enabled: new FormControl(),
      baseLeadTime: new FormControl(),
      availabilityInterval: new FormControl(),
      overflowLeadTime: new FormControl(),
      overflowThreshold: new FormControl(),
      overflowInterval: new FormControl(),
      lunchStart: new FormControl()
    })

    this.configSubscription = this.configService.getConfiguration().subscribe(configData => {
      this.loadedConfiguration = configData;
      let lunchStart = new Date().setHours(configData.lunch.availability.start/100,0,0,0);
      let lunchEnd = new Date().setHours(configData.lunch.availability.end/100,0,0,0);
      this.ionicForm = this.formBuilder.group({
        archiveOrderPeriod: [configData.archiveOrderPeriod],
        enabled: [configData.availability[0].enabled],
        baseLeadTime: [configData.availability[0].baseLeadTime],
        availabilityInterval: [configData.availability[0].availabilityInterval],
        overflowLeadTime: [configData.availability[0].overflowLeadTime],
        overflowThreshold: [configData.availability[0].overflowThreshold],
        overflowInterval: [configData.availability[0].overflowInterval],
        lunchStart: [new Date(lunchStart).toISOString()],
        lunchEnd: [new Date(lunchEnd).toISOString()]
      });
    });
  }
  
  onSubmit() {
    this.isLoading = true;
    const configuration = {
      archiveOrderPeriod: this.ionicForm.get('archiveOrderPeriod').value,
      availability: [{
        enabled: this.ionicForm.get('enabled').value,
        baseLeadTime: this.ionicForm.get('baseLeadTime').value,
        availabilityInterval: this.ionicForm.get('availabilityInterval').value,
        overflowLeadTime: this.ionicForm.get('overflowLeadTime').value,
        overflowThreshold: this.ionicForm.get('overflowThreshold').value,
        overflowInterval: this.ionicForm.get('overflowInterval').value
      }],
      lunch: {
        availability: {
          end: new Date(this.ionicForm.get('lunchEnd').value).getHours()*100,
          start: new Date(this.ionicForm.get('lunchStart').value).getHours()*100
        }
      }
    }

    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Saving...' })
      .then(loadingEl => {
        loadingEl.present();
        // let authObs: Observable<LoginResponseData>;
        let saveConfigObs = this.configService.saveConfiguration(configuration);
        saveConfigObs.subscribe(resData => {
          loadingEl.dismiss();
          setTimeout(function() {
            this.isLoading = false;
          }.bind(this), 3000);
        }, errorRes => {
          loadingEl.dismiss();
          let message = 'Error saving configuration';
          console.log(errorRes);

          this.showError(message);
        });
      });
  }

  private showError(message: string){
    this.alertCtrl.create({
      header: 'Oops!',
      message: message,
      buttons: ['Okay']
    }).then(
      alertEl => alertEl.present()
    );
  }

  compareWith(v1, v2) {
    return v1 == v2;
  }

}
