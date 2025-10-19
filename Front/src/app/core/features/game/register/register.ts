import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  username: string = '';

  constructor(private router: Router) {
  }

  async newUsername() {
    if (!localStorage.getItem('username')) {
      if (this.username === "" || !this.username) {
        this.username = `Anonimus${new Date().getTime()}`;

        localStorage.setItem('username', this.username);
      } else {
        localStorage.setItem('username', this.username);
      }

      await this.router.navigateByUrl('game');
    }
  }
}
