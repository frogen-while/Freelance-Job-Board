/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JobsListComponent } from './jobs-list.component';
import { ApiService } from '../../core/api.service';
import { of } from 'rxjs';

const jExpect = (globalThis as { expect: <T>(actual: T) => jasmine.Matchers<T> }).expect;

describe('JobsListComponent', () => {
  let component: JobsListComponent;
  let fixture: ComponentFixture<JobsListComponent>;
  let mockApi: Partial<ApiService>;

  beforeEach(async () => {
    mockApi = { getJobs: () => of({ data: [{ job_id: 1, title: 'Test Job', budget: 100 }] }) };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [JobsListComponent],
      providers: [{ provide: ApiService, useValue: mockApi }]
    }).compileComponents();

    fixture = TestBed.createComponent(JobsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load jobs', () => {
    jExpect(component).toBeTruthy();
    jExpect(component.jobs.length).toBeGreaterThan(0);
  });
});