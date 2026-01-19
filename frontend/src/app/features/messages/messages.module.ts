import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MessagesComponent } from './messages.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: MessagesComponent }
];

@NgModule({
  declarations: [MessagesComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class MessagesModule {}
