import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MessagesComponent } from './messages.component';
import { ConversationComponent } from './conversation.component';

const routes: Routes = [
  { path: '', component: MessagesComponent },
  { path: ':userId', component: ConversationComponent }
];

@NgModule({
  declarations: [MessagesComponent, ConversationComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class MessagesModule {}
