import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuService } from './menu.service';
import { MenuItem } from './menu-item.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit, OnDestroy {

  menuItems: MenuItem[];
  private menuItemSub: Subscription;
  private sendGrid;
  isLoading = false;
  

  constructor(
    private menuService: MenuService,
    private router: Router,
    private httpClient: HttpClient
  ) { }

  ngOnInit() {
    this.menuItemSub = this.menuService.menuItems.subscribe(menuItems => {
      this.menuItems = menuItems
    });

    this.isLoading = true;
    this.menuService.fetchMenuItems().subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    if (this.menuItemSub){
      this.menuItemSub.unsubscribe();
    }
  }

  get menuHistory() {
    return this.menuService.menuHistory;
  }

  updateMenu(category: string, type: string) {
    switch (type) {
      case 'category':
        this.isLoading = true;
        this.menuService.fetchMenuItems(category).subscribe(menuItems => {
          this.menuItems = menuItems;
          this.menuService.addMenuHistory(category);
          this.isLoading = false;
        });
        break;
      case 'chooseyourown':
      case 'product':
        this.router.navigateByUrl('/main/tabs/menu/'+category);
        break;
    }
  }

  back() {
    if (this.menuService.menuHistory.length <= 1){
      return;
    }
    this.isLoading = true;
    let previous: string;
    if (!(previous = this.menuService.menuHistory[this.menuService.menuHistory.length-2])){
      previous = 'menu';
    }
    this.menuService.fetchMenuItems(previous).subscribe(menuItems => {
      this.menuItems = menuItems;
      this.menuService.removeMenuHistory();
      this.isLoading = false;
    })
  }
}
