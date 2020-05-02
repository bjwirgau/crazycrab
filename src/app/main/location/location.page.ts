import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { LocationService } from './location.service';
import { StoreLocation } from './location.model';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit, AfterViewInit {
  @ViewChild('map', {static: false}) mapElementRef: ElementRef;

  loading: boolean = false;
  expanded: boolean = false;
  storeLocations: StoreLocation[];

  constructor(
    private renderer: Renderer2,
    private locationService: LocationService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.locationService.fetchLocations().subscribe(() => {
      this.loading = false;
    });

    this.locationService.storeLocations.subscribe(locations => {
      console.log("Store Locations", locations);
      this.storeLocations = locations;
    });
  }

  toggleCollapsed(){
    
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
