import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { distinctUntilChanged, throttleTime } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  message      : string;
  roomMessage  : string;
  messages     = [];
  roomMessages = [];
  typingMsg    = null;
  user         = localStorage.getItem('user');
  
  constructor(private auth: AuthService) {
    
    //newUser joined to a room broadcast except ourself
    this.auth.newUserRoomJoined().subscribe((data) => {
      this.roomMessages.push({'roomMsg':data.message});
    });

    //user left the room broadcast except ourself
    this.auth.userleftRoom().subscribe((data) => {
      this.roomMessages.push({'roomMsg':data.message});
    });

    //user room join welcome message
    this.auth.getRoomMsg().subscribe((roomMsg) => {
      this.roomMessages = [];
      this.roomMessages.push({'roomMsg':roomMsg.roomMsg});
    });

    //user privateRoomJoined welcome message
    this.auth.privateRoomJoined().subscribe((roomMsg) => {
      this.roomMessages = [];
      this.messages = [];
      this.roomMessages.push({ 'roomMsg': roomMsg.roomMsg });
    });

    this.auth.userIsTyping().subscribe((typingMsg) => {
      this.typingMsg = typingMsg.message;
      setTimeout(() => {
        this.typingMsg = '';
      },500);
    });

    //get user message and print out message of any room i.e. Global,Lobby,Hall,Delux
    if (this.auth.getRoomMessages() != null) {
      this.auth
        .getRoomMessages()
        .pipe(distinctUntilChanged())
        .pipe(throttleTime(1000))
        .subscribe((message: string) => {
          if (this.messages.length == 20) {
            this.messages = [];
          }
          let currentTime = moment().format('h:mm a');
          this.messages.push({'user':localStorage.getItem('userName'),'msg':message,'time':currentTime});
          // console.log(this.messages);
        });
    } 
  }

  ngOnInit() {
  }

}
