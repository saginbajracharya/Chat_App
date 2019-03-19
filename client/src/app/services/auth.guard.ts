import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate 
{
  constructor(private route:Router,
              private auth:AuthService) { }
  
  canActivate( next: ActivatedRouteSnapshot, state: RouterStateSnapshot ): 
  Observable<boolean> {
    return this.auth.isLoggedIn.pipe(
      take(1),
      map((isLoggedIn: boolean) => {
          if (!isLoggedIn) {
            if (localStorage.getItem('access_token')==null) {
            this.route.navigate(['/login']);
            return false;
          }
        }
        this.auth.loggedIn.next(true);
        return true;
      })
    );
  }
}