import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyJobsComponent } from './my-jobs.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [MyJobsComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: MyJobsComponent }
    ])
  ]
})
export class MyJobsModule {}
