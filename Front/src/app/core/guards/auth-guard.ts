import { Injectable } from '@angular/core';
import {CanActivate, Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = !!localStorage.getItem('username');

    if (!isLoggedIn) {
      return true;
    } else {
      await this.router.navigateByUrl('game');
      return false;
    }
  }
}
