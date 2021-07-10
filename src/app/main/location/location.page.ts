import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { LocationService } from './location.service';
import { StoreLocation } from './location.model';
import { MenuService } from '../menu/menu.service';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';

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
  map: any;

  public items: any = [];

  constructor(
    private renderer: Renderer2,
    private locationService: LocationService,
    private menuService: MenuService,
    private geolocation: Geolocation
  ) {}

  ngOnInit() {
    this.loading = true;
    this.locationService.fetchLocations().subscribe(() => {
      this.loading = false;
    });

    this.locationService.storeLocations.subscribe(locations => {
      this.locationService.fetchNearbyLocations(locations);
      this.storeLocations = locations;
    });
  }

  toggleCollapsed(){
    
  }
  
  ngAfterViewInit(){
    this.getGoogleMaps().then(googleMaps => {
      const mapEl = this.mapElementRef.nativeElement;
      const southfieldLocation = new googleMaps.LatLng(this.storeLocations[0].coordinates['latitude'],this.storeLocations[0].coordinates['longitude'])
      const map = new googleMaps.Map(mapEl, {
        center: southfieldLocation,
        zoom: 17
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

  expandItem(item, event): void {
    if (event.srcElement.id === "directions"){
      return;
    }
    if (item.expanded) {
      item.expanded = false;
    } else {
      this.storeLocations.map(listItem => {
        if (item == listItem) {
          listItem.expanded = !listItem.expanded;
        } else {
          listItem.expanded = false;
        }
        return listItem;
      });
    }
  }

  getFormattedTime(time: number): string {
    return this.menuService.formatTime(time);
  }

  setPosition() {

  }

  getDirections() {
    this.getGoogleMaps().then(googleMaps => {
      const mapEl = this.mapElementRef.nativeElement;
      const southfieldLocation = new googleMaps.LatLng(this.storeLocations[0].coordinates['latitude'],this.storeLocations[0].coordinates['longitude']);
      const directionsService = new googleMaps.DirectionsService();
      const directionsRenderer = new googleMaps.DirectionsRenderer();

      const map = new googleMaps.Map(mapEl, {
        center: southfieldLocation,
        zoom: 17
      });

      this.geolocation.getCurrentPosition().then((currentLocation) => {
        directionsRenderer.setMap(map);
        let request = {
          origin: new googleMaps.LatLng(currentLocation.coords.latitude, currentLocation.coords.longitude),
          destination: southfieldLocation,
          travelMode: googleMaps.TravelMode["DRIVING"]
        };

        directionsService.route(request, function(response, status) {
          if (status == 'OK'){
            directionsRenderer.setDirections(response);
          }
        })
      }).catch((err) => {
        console.log('Error getting location.', err);
      });
    })
  }


}
