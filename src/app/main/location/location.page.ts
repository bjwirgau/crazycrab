import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit, AfterViewInit {
  @ViewChild('map', {static: false}) mapElementRef: ElementRef;

  constructor(
    private renderer: Renderer2
  ) { }

  ngOnInit() {
  }
  
  ngAfterViewInit(){
    this.getGoogleMaps().then(googleMaps => {
      const mapEl = this.mapElementRef.nativeElement;
      const map = new googleMaps.Map(mapEl, {
        center: {lat: 42.47358466, lng: -83.28482151 },
        zoom: 19
      });

      googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.renderer.addClass(mapEl, 'visible');
      })
    }).catch(err => {
      console.log(err);
    })
  }

  private getGoogleMaps(): Promise<any>{
    const win = window as any;
    const googleModule = win.google;

    if (googleModule && googleModule.maps){
      return Promise.resolve(googleModule.maps);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBQBDQ5aEiImcHAFRGBf1QUpTmDbNRlIl4';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps){
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps SDK not available');
        }
      }
    })
  }

}
