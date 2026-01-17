import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobsBrowseComponent } from './jobs-browse.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [JobsBrowseComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'browse', pathMatch: 'full' },
      { path: 'browse', component: JobsBrowseComponent }
    ])
  ]
})
export class FindWorkModule {}
