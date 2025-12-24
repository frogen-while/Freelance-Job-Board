/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { ApiService } from '../../core/api.service';
import { of } from 'rxjs';


describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockApi: Partial<ApiService>;

  beforeEach(async () => {
    mockApi = { getJobs: () => of({ data: [] }), getCategories: () => of({ data: [] }) };
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [HomeComponent],
      providers: [{ provide: ApiService, useValue: mockApi }]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load jobs on init', () => {
    expect(component.jobs).toEqual([]);
  });

  it('should load categories on init', () => {
    expect(component.categories).toEqual([]);
  });
});

