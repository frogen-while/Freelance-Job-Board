import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobDetailComponent } from './job-detail.component';

@NgModule({
  declarations: [JobDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: ':id', component: JobDetailComponent }
    ])
  ]
})
export class JobsModule {}