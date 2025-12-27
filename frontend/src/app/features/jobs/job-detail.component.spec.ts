/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { JobDetailComponent } from './job-detail.component';
import { ApiService } from '../../core/api.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

const jExpect = (globalThis as { expect: <T>(actual: T) => jasmine.Matchers<T> }).expect;

describe('JobDetailComponent', () => {
  let component: JobDetailComponent;
  let fixture: ComponentFixture<JobDetailComponent>;
  let mockApi: Partial<ApiService>;

  beforeEach(async () => {
    mockApi = {
      getJobById: () => of({ data: { job_id: 1, title: 'Test Job', description: 'Desc', budget: 100 } }),
      applyToJob: () => of({})
    };

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
    jExpect(component.job).toBeTruthy();
    jExpect(component.job?.title).toBe('Test Job');
  });
});