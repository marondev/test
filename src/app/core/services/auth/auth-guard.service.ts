import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  CanActivateChild,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate, CanActivateChild {

  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!sessionStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return false;
    } else {
      const allowedRoles = route.data.allowedRoles;
      const isAuthorized = this.authService.isAuthorized(allowedRoles);

      if (!isAuthorized) {
        this.router.navigate(['/login']);
      }
      return isAuthorized;
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!sessionStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return false;
    } else {
      const allowedRoles = route.data.allowedRoles;
      const isAuthorized = this.authService.isAuthorized(allowedRoles);
      if (!isAuthorized) {
        this.router.navigate(['/access-denied']);
      }
      return isAuthorized;
    }
  }
}
