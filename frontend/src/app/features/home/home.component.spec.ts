import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { ApiService } from '../../core/api.service';
import { of } from 'rxjs';

const jExpect = (globalThis as { expect: <T>(actual: T) => jasmine.Matchers<T> }).expect;

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockApi: Partial<ApiService>;

  beforeEach(async () => {
    mockApi = { 
      getJobs: () => of({ success: true, data: [] }), 
      getCategories: () => of({ success: true, data: [] }) 
    };
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
    jExpect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    jExpect(component.categories).toEqual([]);
  });
});

