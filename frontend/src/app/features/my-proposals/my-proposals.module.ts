import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyProposalsComponent } from './my-proposals.component';

@NgModule({
  declarations: [MyProposalsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: MyProposalsComponent }
    ])
  ]
})
export class MyProposalsModule {}
