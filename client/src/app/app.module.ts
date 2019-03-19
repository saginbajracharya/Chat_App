import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { ChatComponent } from './components/chat/chat.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SignupFormComponent } from './components/signup-form/signup-form.component';

import { AppRoutingModule } from './/app-routing.module';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth.guard';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ChatFormComponent } from './components/chat-form/chat-form.component';
import { FeedComponent } from './components/feed/feed.component';

import { EmojiPickerModule } from 'ng-emoji-picker';
import { PickerModule } from '@ctrl/ngx-emoji-mart'

@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    SignupFormComponent,
    ChatComponent,
    NavbarComponent,
    SidebarComponent,
    ChatFormComponent,
    FeedComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    EmojiPickerModule,
    PickerModule
  ],
  providers: [AuthService, AuthGuard, FeedComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
