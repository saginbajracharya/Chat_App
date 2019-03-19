import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})

export class LoginFormComponent implements OnInit {

  loginForm   : FormGroup;
  returnUrl   : string;
  submitted   = false;
  loading     = false;
  error       = '';

  constructor(private router     : Router,
              private formBuilder: FormBuilder,     
              private route      : ActivatedRoute,
              private auth       : AuthService) { }

  ngOnInit() {
  	this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() { 
    return this.loginForm.controls; 
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid){
      //Form  not valid
      return;
    }else{
      //Form valid
      this.loading = true;
      //search for the user
      this.auth.login(this.f.username.value, this.f.password.value).subscribe(res=> {
        //if user found
        if( res && res.success==true){
          //update user status
          if(this.auth.updateUserStatus(res.data[0].username,'1')){
            this.auth.loggedIn.next(true);
            localStorage.setItem('user', res.data[0].username);
            localStorage.setItem('access_token',res.data[0].access_token);
            this.router.navigate(['/chat']);
          }
        }
        //if user not found
        this.auth.loggedIn.next(false);
        this.error = res.msg;
        this.loading = false;
      },
      error => {
        // console.log("EE",error);
        this.auth.loggedIn.next(false);
        this.loading = false;
        this.error = "Server Not Responding !!";
      });
    }
  }
}