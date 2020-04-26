import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { AccountService } from './account.service';
import { take, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountGuard implements CanLoad {
    constructor(
        private accountService: AccountService, 
        private router: Router
    ) {}

    canLoad(
        route: Route,
        segments: UrlSegment[]
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.accountService.userIsAuthenticated.pipe(
            take(1),
            switchMap(isAuthenticated => {
                if (!isAuthenticated) {
                    return this.accountService.autoLogin();
                } else {
                    return of(isAuthenticated);
                }
            }), 
            tap(isAuthenticated => {
                if (!isAuthenticated) {
                    this.router.navigateByUrl('/main/tabs/account');
                }
            })
        );
    }
}
