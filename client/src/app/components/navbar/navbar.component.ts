import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user:string;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {this.user=localStorage.getItem('user'); }

  onLogout() {
    this.authService.logout();
    this.authService.getOnlineUsers();
  }
}
