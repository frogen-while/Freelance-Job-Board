import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { JobDetailComponent } from './job-detail.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [JobDetailComponent, CheckoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    SharedModule,
    RouterModule.forChild([
      { path: 'checkout/:applicationId', component: CheckoutComponent },
      { path: ':id', component: JobDetailComponent }
    ])
  ]
})
export class JobsModule {}