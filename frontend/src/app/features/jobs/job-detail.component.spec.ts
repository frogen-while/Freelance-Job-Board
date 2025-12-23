/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { JobDetailComponent } from './job-detail.component';
import { ApiService } from '../../core/api.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('JobDetailComponent', () => {
  let component: JobDetailComponent;
  let fixture: ComponentFixture<JobDetailComponent>;
  let mockApi: Partial<ApiService>;

  beforeEach(async () => {
    mockApi = { getJobById: (id: number) => of({ data: { job_id: id, title: 'Test Job', description: 'Desc', budget: 100 } }), applyToJob: () => of({}) };
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [JobDetailComponent],
      providers: [
        { provide: ApiService, useValue: mockApi },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load job detail', () => {
    expect(component.job).toBeTruthy();
    expect(component.job.title).toBe('Test Job' as any);
  });
});