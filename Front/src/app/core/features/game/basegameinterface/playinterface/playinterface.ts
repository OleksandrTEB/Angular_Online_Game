import {Component, OnInit} from '@angular/core';
import {WebSocketService} from '../../../../services/websocket/websocket.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-playinterface',
  standalone: false,
  templateUrl: './playinterface.html',
  styleUrl: './playinterface.scss'
})
export class Playinterface {
  username: string | null = localStorage.getItem('username');

  showCustomForm: boolean = false;
  code: number | null = null;

  constructor(
    private router: Router,
    private ws: WebSocketService
    ) {
  }

  async goToFight() {
    await this.router.navigateByUrl('fight');

    this.ws.ws.send(JSON.stringify({
      type: 'userinfo',
      username: this.username
    }))
  }

  async customGame() {
    this.ws.ws.send(JSON.stringify({
      type: 'custom_battle'
    }))

    this.ws.ws.send(JSON.stringify({
      type: 'userinfo',
      username: this.username
    }))

    await this.router.navigateByUrl('fight');
  }

  joinToBattle() {
    this.showCustomForm = true
  }

  async sendCode() {
    this.ws.ws.send(JSON.stringify({
      type: 'code',
      code: this.code
    }))

    await this.router.navigateByUrl('fight');

    this.ws.ws.send(JSON.stringify({
      type: 'userinfo',
      username: this.username
    }))
  }
}
