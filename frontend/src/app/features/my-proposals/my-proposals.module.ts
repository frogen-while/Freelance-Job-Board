import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyProposalsComponent } from './my-proposals.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [MyProposalsComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: MyProposalsComponent }
    ])
  ]
})
export class MyProposalsModule {}
