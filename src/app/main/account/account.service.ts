import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Account } from './account.model';
import { switchMap, take, tap, map } from 'rxjs/operators';
import { BehaviorSubject, from } from 'rxjs';
import { EmailValidator } from '@angular/forms';
import { Plugins } from '@capacitor/core'

export interface AuthResponseData {
  kind: string,
  idToken: string,
  email:string,
  refreshToken: string,
  localId: string,
  expiresIn: string,
  registeredIn?: boolean;
}

export interface LoginResponseData {
  idToken: string,
  email:string,
  refreshToken: string,
  localId: string,
  expiresIn: string,
  registeredIn?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private _account = new BehaviorSubject<Account>(null);

  get userIsAuthenticated() {
    return this._account.asObservable().pipe(
      map(user => {
        if (user){
          return !!user.token
        } else {
          return false;
        }
      }
    ));
  }

  get userId() {
    return this._account.asObservable().pipe(
      map(user => {
        if(user) {
          return user.id;
        } else {
          return null;
        }
      }
    ));
  }

  get token() {
    return this._account.asObservable().pipe(
      map(user => {
        if(user) {
          return user.token;
        } else {
          return null;
        }
      }
    ));
  }

  constructor(
    private httpClient: HttpClient
  ) {}

  authenticate(email: string, password: string) {
    return this.httpClient.post<LoginResponseData>(
      `${environment.firebase.firebaseLoginUrl}${environment.firebase.firebaseApiKey}`, {
        email: email, password: password, returnSecureToken: true
      }).pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    this._account.next(null);
    Plugins.Storage.remove({key: 'authData' });
  }

  createUser(email: string, password: string) {
    return this.httpClient.post<AuthResponseData>(
      `${environment.firebase.firebaseAuthUrl}${environment.firebase.firebaseApiKey}`, { 
        email: email, password: password, returnSecureToken: true
      }).pipe(tap(this.setUserData.bind(this)));
  }

  setUserData(userData: AuthResponseData){
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn*1000));
    this._account.next(new Account(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    ));
    this.storeAuthData(
      userData.localId,
      userData.idToken,
      expirationTime.toISOString(),
      userData.email
    )
  }

  storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string
  ) {
    const data = JSON.stringify({
      userId: userId, 
      token: token, 
      tokenExpirationDate: tokenExpirationDate,
      email: email
    });
    Plugins.Storage.set({key: 'authData', value: data});
  }

  autoLogin() {
    return from(Plugins.Storage.get({key: 'authData'})).pipe(
      map(storedData => {
        if(!storedData || !storedData.value) {
          return null;
        }

        const parsedData = JSON.parse(storedData.value) as {
          userId: string, 
          token: string, 
          tokenExpirationDate: string,
          email: string
        }

        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }

        const user = new Account(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationTime
        );

        return user;
      }),
      tap(user => {
        if (user) {
          this._account.next(user);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }
}
