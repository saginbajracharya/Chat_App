import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css']
})
export class ChatFormComponent {
  message: string;
  messages: string[] = [];

  constructor(private auth: AuthService) { }

  ngOnInit() {
  }
  //send message to the server with user, message and room
  sendMessage() {
    this.auth.sendMessage(this.message);
    this.message = '';
  }

  typing(){
    this.auth.isTyping();
  }

}
