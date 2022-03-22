/* eslint-disable @typescript-eslint/naming-convention */
import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// SERVICES
import { JwtHelperService } from '@auth0/angular-jwt';

// ENV
import { environment } from '@env/environment';

export interface User {
  avatar: any;
  username: string;
  fullname: string;
  id: number;
  place_id?: number;
  role: string;
  updated_at: string;
  created_at: string;
}

export interface Credential {
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  apiBaseUrl: string = environment.apiBaseUrl;
  url: string;
  user: User;

  avatarEmitter = new EventEmitter();

  constructor(
    private router: Router,
    private http: HttpClient,
    private jwtHelperService: JwtHelperService
  ) {}

  avatarEmit(val) {
    this.avatarEmitter.emit(val);
  }

  me(isUpdate = false): Observable<User> {
    if (this.user && !isUpdate) {
      return new Observable((observer) => {
        observer.next(this.user);
      });
    }

    const token = sessionStorage.getItem('token');
    const url = this.apiBaseUrl + 'me?token=' + token;

    return this.http.get(url).pipe(
      map((res: any) => {
        if (res.results_count) {
          this.user = res.results;
        }
        return res.results;
      }),
      catchError(this.handleError)
    );
  }

  login(params: Credential) {
    const url = this.apiBaseUrl + 'auth/login';

    return this.http.post(url, params).pipe(
      map((res: any) => {
        if (res.results_count) {
          this.user = res.results;
        }
        return res;
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  isStillLogged(res: any) {
    if (res.forced_login) {
      // this.toastr.error('Session Expired');
      this.logout();
      return;
    }

    this.saveSession(res.token);
  }

  getRole() {
    // Get token from local storage or state management
    const token = sessionStorage.getItem('token');

    // Decode token to read the payload details
    const decodeToken = this.jwtHelperService.decodeToken(token);

    // Check if it was decoded successfully, if not the token is not valid, deny access
    if (!decodeToken) {
      return false;
    }

    return decodeToken.role;
  }

  isAuthorized(allowedRoles: string[]): boolean {
    // Check if the list of allowed roles is empty, if empty, authorize the user to access the page
    if (allowedRoles == null || allowedRoles.length === 0) {
      return true;
    }

    const role = this.getRole();

    // Check if the user roles is in the list of allowed roles, return true if allowed and false if not allowed
    return allowedRoles.includes(role);
  }

  private saveSession(token: string): void {
    if (token) {sessionStorage.setItem('token', token);}
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an observable with a user-facing error message
    return throwError(() => 'Something bad happened; please try again later.');
  }
}
