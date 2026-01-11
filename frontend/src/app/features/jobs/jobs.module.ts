import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobDetailComponent } from './job-detail.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [JobDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([
      { path: ':id', component: JobDetailComponent }
    ])
  ]
})
export class JobsModule {}