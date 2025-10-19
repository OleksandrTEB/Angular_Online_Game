import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  ws: WebSocket = new WebSocket('ws://78.88.142.214:8080');
}
