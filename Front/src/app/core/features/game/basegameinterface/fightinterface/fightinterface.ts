import {Component, OnInit} from '@angular/core';
import {WebSocketService} from '../../../../services/websocket/websocket.service';
import {Player, Section} from '../../../../interfaces/interfaces';
import {Router} from '@angular/router';

@Component({
  selector: 'app-fightinterface',
  standalone: false,
  templateUrl: './fightinterface.html',
  styleUrl: './fightinterface.scss'
})
export class Fightinterface implements OnInit {
  x: string = './assets/x.png';
  o: string = './assets/o.png';

  img: string = this.x;

  status: string = 'Offline';
  conn: boolean = false;
  winner: boolean = false;
  player_winner: string = '';

  tryReconnect: boolean = false;

  canClickReset: boolean = true;

  sections: Section[] = [
    {id: 0, canClick: true},
    {id: 1, canClick: true},
    {id: 2, canClick: true},
    {id: 3, canClick: true},
    {id: 4, canClick: true},
    {id: 5, canClick: true},
    {id: 6, canClick: true},
    {id: 7, canClick: true},
    {id: 8, canClick: true}
  ]

  arrLen: number = 0;

  currentChar: string = 'x';
  canStart: boolean = false;
  canStep: boolean = false;
  username: string | null = localStorage.getItem('username');
  players!: Player[];

  constructor(private WebSocketService: WebSocketService,
              private router: Router,) {
  }

  ngOnInit() {
    const ws = this.WebSocketService.ws;

    ws.onopen = () => {
      this.conn = true;
      this.status = 'Online';

      ws.send(JSON.stringify({
        type: 'userinfo',
        username: this.username
      }))
    }

    ws.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);

      if (data.players) {
        this.players = data.players;
        for (let player of this.players) {
          if (player.username === this.username) {
            this.canStep = player.canStep;
          }
        }

        this.canStart = data.canStart;
      }

      if (data.type === 'canStep') {
        this.canStep = data.canStep;
      }

      if (data.reset) {
        this.arrLen = 0;
        this.canClickReset = true;
        this.winner = false;
        this.sections = [
          {id: 0, canClick: true},
          {id: 1, canClick: true},
          {id: 2, canClick: true},
          {id: 3, canClick: true},
          {id: 4, canClick: true},
          {id: 5, canClick: true},
          {id: 6, canClick: true},
          {id: 7, canClick: true},
          {id: 8, canClick: true}
        ]
      }

      if (data.section) {
        this.arrLen++;
        if (this.currentChar === 'x') {
          this.img = this.x
        } else {
          this.img = this.o;
        }

        data.clicked_sections.forEach((section: Section) => {
          const id: number = section.id;
          if (id != undefined) {
            this.sections[id].canClick = section.canClick;
            this.sections[id].clicked = section.clicked;
            this.sections[id].img = section.img;
          }
        })

        this.currentChar = data.currentChar

        if (this.currentChar === 'x') {
          this.img = this.x
        } else {
          this.img = this.o;
        }

        if (this.arrLen >= 9) {
          this.arrLen = 0
          setTimeout(() => {
            this.WebSocketService.ws.send(JSON.stringify({
              type: 'wont-reset'
            }))
          }, 3000)
        }
      }

      if (data.winner === true) {
        this.winner = true;
        this.player_winner = data.player_winner;

        setTimeout(() => {
          this.WebSocketService.ws.send(JSON.stringify({
            type: 'wont-reset'
          }))
        }, 4000)
      }
    }

    ws.onclose = () => {
      this.status = 'Offline';
      this.canStart = false;
      this.conn = false;
    }
  }

  clickTo(index: number) {
    if (this.canStep && this.sections[index].canClick) {
      const data: Section = {
        id: index,
        char: this.currentChar,
        clicked: true,
        img: this.img,
        canClick: false
      }

      if (this.currentChar === 'x') {
        this.img = this.x
      } else {
        this.img = this.o;
      }

      this.currentChar = (this.currentChar === 'x') ? 'o' : 'x';


      this.WebSocketService.ws.send(JSON.stringify({
        type: 'clicked',
        section: data,
        currentChar: this.currentChar
      }))
    }
  }

  resetBtn() {
    if (this.canClickReset) {
      this.WebSocketService.ws.send(JSON.stringify({
        type: 'wont-reset'
      }))

      this.canClickReset = false;
    }
  }

  async goToMenu() {
    await this.router.navigateByUrl('game')
  }
}
