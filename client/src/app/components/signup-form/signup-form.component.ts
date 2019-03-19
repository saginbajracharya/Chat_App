import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css']
})
export class SignupFormComponent {
  signupForm  : FormGroup;
  submitted   = false;
  loading     = false;
  error       = '';
  success     = '';

  constructor(private formBuilder: FormBuilder,     
              private auth: AuthService) { }
  ngOnInit(){
    this.signupForm = this.formBuilder.group({
      username  : ['', Validators.required],
      password  : ['', Validators.required],
      firstname : ['', Validators.required],
      lastname  : ['', Validators.required],
      email     : ['', Validators.required],
    });
  }
  
  get f(){ 
    return this.signupForm.controls; 
  }

  onSubmit() {
    this.submitted = true;
    if (this.signupForm.invalid){
      return;
    }else{
      this.loading = true;
      this.auth.signUp(this.f.username.value, this.f.password.value, this.f.firstname.value, this.f.lastname.value, this.f.email.value).subscribe(resp => {
        if(resp && resp.success == true){
          this.loading = false;
          this.success = resp.msg;
        }else{
          this.error = resp.msg;
        }
      },
        error => {
          // console.log("EE",error);
          this.loading = false;
          this.error = "Server Not Responding !!";
        });
    }
  }
}