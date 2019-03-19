import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FeedComponent } from '../feed/feed.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  userlist = [];
  room: string = 'Global'; //firstly default selection/join to Global room 
  constructor(private auth: AuthService, private route: Router ,private feedCmp: FeedComponent) { }

  ngOnInit() {
    this.auth.room = this.room; //set room value in auth var
    
    this.auth.getOnlineUsers().subscribe(res => {
      if(res.length==0){
        this.route.navigate(['/']);
      }else{
        this.userlist = [];
        for (let i = 0; i < res.length; i++) {
          // if (res[i].status==1) {
          this.userlist.push(res[i]);
          // }
        }
      }
    });
  }

  privateMsg(userToChatWith) {
    this.auth.privateChat(userToChatWith);
  }

  // on selection change change room and send to auth.room
  selectRoom() {
    this.auth.room = this.room;
  }

  join() {
    this.auth.joinRoom(this.room);
  }

  leave() {
    this.auth.leaveRoom(this.room);
    this.room = 'Global';
    this.auth.room = this.room;
  }

}
