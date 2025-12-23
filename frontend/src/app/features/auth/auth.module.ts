import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { SignupComponent } from './signup.component';

@NgModule({
  declarations: [LoginComponent, SignupComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild([
    { path: '', component: LoginComponent },
    { path: 'signup', component: SignupComponent }
  ])]
})
export class AuthModule {}