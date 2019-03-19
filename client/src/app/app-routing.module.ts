import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupFormComponent } from './components/signup-form/signup-form.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { ChatComponent } from './components/chat/chat.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
	{ path : '' , redirectTo: '/login', pathMatch: 'full' },
	{ path : 'signup' , component : SignupFormComponent },
	{ path : 'login' , component : LoginFormComponent },
	{ path: 'chat', component: ChatComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash : false})],
  exports: [RouterModule],
  declarations: []
})

export class AppRoutingModule { }
