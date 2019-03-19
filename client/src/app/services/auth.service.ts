import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as io from 'socket.io-client';

@Injectable({  providedIn: 'root' })

export class AuthService {

  private url       = 'http://localhost:3000';
  public  userlist  = [];
  private socket    : any;
  public  room      : string;
  public  loggedIn  : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient,
              private route: Router){ this.socket = io(this.url); }
    
  get isLoggedIn(){
    return this.loggedIn.asObservable();
  }
  
//--------------------------Request to Server Login,SignUp,Logout Services---------------------------------

  /* login
   * post username & password and find user from api /login 
   */
  login(username: string, password: string){
    return this.http.post<any>('http://localhost:3000/login', { username, password })
      .pipe(tap(res => { 
        if(res){
          this.socket.emit("add_user",username);
        }
      }
    ));
  }

  /* SignUp
   * post user details and INSERT from api /signup 
   */
  signUp(username: string, password: string, firstname: string, lastname: string, email: string){
    return this.http.post<any>('http://localhost:3000/signup',{ username, password, firstname, lastname, email });
  }

  /* Update Online Status
   * update user status as per login 0=offline 1=online
  */
  updateUserStatus(username: string, status:string){
    let params = new HttpParams();
    params = params.append('username',username);
    params = params.append('status',status);
    return this.http.get<any>('http://localhost:3000/updateUserStatus', { params: params }).subscribe(response=>{});
  }

  getAllUsers(){
    return this.http.get<any>('http://localhost:3000/allUsers');
  }

  /* logout
   * loggedIn set false
   * updateUserStatus to 0
   * remove access_token from localStorage
   * remove user from localStorage
  */
  logout(){
    this.socket.emit("logOut", localStorage.getItem('user'));
    this.loggedIn.next(false);
    if(this.updateUserStatus(localStorage.getItem('user'),'0')){
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      this.route.navigate(['/']);
    }
  }

  public isTyping() {
    this.socket.emit("typing", localStorage.getItem('user'),this.room);
  }

  public sendMessage( message) {
    this.socket.emit('new-message', localStorage.getItem('user'), message,this.room);
  }

  //Join Room
  public joinRoom(room) {
    this.socket.emit('join', localStorage.getItem('user'), room);
  }

  //Leave Room
  public leaveRoom(room) {
    this.socket.emit('leave', localStorage.getItem('user'), room);
  }

  /* 
  localStorage.getItem('user') as logged in user
  userToChatWith as person to chat with
  */
  public privateChat(userToChatWith){
    if (userToChatWith == localStorage.getItem('user')){
      console.log(userToChatWith);
      console.log(localStorage.getItem('user'));
      return;
    }else{
      this.socket.emit('privateChat', userToChatWith, localStorage.getItem('user'),);
    }
  }

// ------------------------------------------------------------------------------------------------------------/

//------------------------------------------Get/Return from Server-------------------------------------------------------------------/
  //Get All Online Users List
  public getOnlineUsers = () => {
    return Observable.create((observer: any) => {
      this.socket.on('usersOnline', (user: any) => {
        observer.next(user);
      })
    });
  }

  //get message from server of any room Global,Lobby,Hall,Delux
  public getRoomMessages = () => {
    return Observable.create((observer) => {
      this.socket.on('newRoomMsg', (userName, message) => {
        localStorage.setItem('userName', userName);
        observer.next(message);
      });
    });
  }

  // Room Join Welcome message to ownself only
  public getRoomMsg() {
    return Observable.create((observer) => {
      this.socket.on('roomJoinMsg', (roomMsg) => {
        observer.next(roomMsg);
      });
      return () => { this.socket.disconnect(); }
    });
  }

  // Room Join BroadCast MESSAGE to all in room except ownself
  public newUserRoomJoined() {
    return Observable.create((observer) => {
      this.socket.on('newUserJoined', (data) => {
        observer.next(data);
      });
      return () => { this.socket.disconnect(); }
    });
  }

  //User Left the Room Message broadcast to all in room except ownself
  public userleftRoom() {
    return Observable.create((observer) => {
      this.socket.on('leftRoom', (data) => {
        observer.next(data);
      });
      return () => { this.socket.disconnect(); }
    });
  }

  public userIsTyping(){
    return Observable.create((observer) => {
      this.socket.on('userTyping', (typingMsg) => {
        observer.next(typingMsg);
      });
      return () => { this.socket.disconnect(); }
    });
  }

  public privateRoomJoined() {
    return Observable.create((observer) => {
      this.socket.on('privateRoomJoinMsg', (roomMsg) => {
        observer.next(roomMsg);
      });
      return () => { this.socket.disconnect(); }
    });
  }
}