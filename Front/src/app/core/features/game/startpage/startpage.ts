import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-startpage',
  standalone: false,
  templateUrl: './startpage.html',
  styleUrl: './startpage.scss',
})
export class Startpage {
  constructor(private router: Router) {}

  async goToRegister() {
    await this.router.navigateByUrl('register');
  }
}
