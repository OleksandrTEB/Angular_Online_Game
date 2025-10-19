import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-playinterface',
  standalone: false,
  templateUrl: './playinterface.html',
  styleUrl: './playinterface.scss'
})
export class Playinterface {
  username: string | null = localStorage.getItem('username');

  constructor(private router: Router) {
  }

  async goToFight() {
    await this.router.navigateByUrl('fight');
  }
}
