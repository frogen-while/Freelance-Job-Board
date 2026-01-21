import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService, PublicUser } from '../../core/auth.service';
import {
  Category,
  Skill,
  CreateJobPayload,
  ExperienceLevel,
  JobType,
  DurationEstimate
} from '../../core/models';

@Component({
  selector: 'app-job-create',
  templateUrl: './job-create.component.html',
  styleUrls: ['./job-create.component.scss']
})
export class JobCreateComponent implements OnInit {
  user: PublicUser | null = null;
  categories: Category[] = [];
  skills: Skill[] = [];
  filteredSkills: Skill[] = [];

  title = '';
  description = '';
  budget: number | null = null;
  deadline = '';
  category_id: number | null = null;
  experience_level: ExperienceLevel | '' = '';
  job_type: JobType | '' = '';
  duration_estimate: DurationEstimate | '' = '';
  is_remote = false;
  location = '';
  selectedSkills: number[] = [];
  skillSearch = '';

  loading = false;
  saving = false;
  successMessage = '';
  errorMessage = '';
  currentStep = 1;
  totalSteps = 3;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();

    if (!this.user) {
      return;
    }

    this.loadCategories();
    this.loadSkills();
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories = res.data;
        }
      }
    });
  }

  loadSkills(): void {
    this.api.getSkills().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.skills = res.data;
          this.filteredSkills = this.skills;
        }
      }
    });
  }

  filterSkills(): void {
    const query = this.skillSearch.toLowerCase();
    this.filteredSkills = this.skills.filter(skill =>
      skill.name.toLowerCase().includes(query) &&
      !this.selectedSkills.includes(skill.skill_id)
    );
  }

  toggleSkill(skillId: number): void {
    const index = this.selectedSkills.indexOf(skillId);
    if (index > -1) {
      this.selectedSkills.splice(index, 1);
    } else if (this.selectedSkills.length < 10) {
      this.selectedSkills.push(skillId);
    }
    this.filterSkills();
  }

  removeSkill(skillId: number): void {
    const index = this.selectedSkills.indexOf(skillId);
    if (index > -1) {
      this.selectedSkills.splice(index, 1);
      this.filterSkills();
    }
  }

  isSkillSelected(skillId: number): boolean {
    return this.selectedSkills.includes(skillId);
  }

  getSkillName(skillId: number): string {
    const skill = this.skills.find(s => s.skill_id === skillId);
    return skill?.name || '';
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceedStep1(): boolean {
    return !!(this.title && this.description && this.category_id);
  }

  canProceedStep2(): boolean {
    return !!(this.budget && this.budget > 0);
  }

  canSubmit(): boolean {
    return this.canProceedStep1() && this.canProceedStep2();
  }

  submitJob(): void {
    if (!this.user || !this.canSubmit()) return;

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CreateJobPayload = {
      title: this.title,
      description: this.description,
      category_id: this.category_id!,
      employer_id: this.user.user_id,
      budget: this.budget!,
      deadline: this.deadline || undefined,
      experience_level: this.experience_level || undefined,
      job_type: this.job_type || undefined,
      duration_estimate: this.duration_estimate || undefined,
      is_remote: this.is_remote,
      location: this.location || undefined,
      skill_ids: this.selectedSkills.length > 0 ? this.selectedSkills : undefined
    };

    this.api.createJob(payload).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.successMessage = 'Job posted successfully!';
          setTimeout(() => {
            this.router.navigateByUrl('/my-jobs');
          }, 1500);
        } else {
          this.errorMessage = res.error?.message || 'Failed to create job';
        }
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Network error. Please try again.';
      }
    });
  }

  getExperienceLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      'entry': 'Entry Level - Looking for someone new to the field',
      'intermediate': 'Intermediate - Some experience required',
      'expert': 'Expert - Extensive experience required'
    };
    return labels[level] || '';
  }

  getJobTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'fixed': 'Fixed Price',
      'hourly': 'Hourly Rate'
    };
    return labels[type] || '';
  }

  getDurationLabel(duration: string): string {
    const labels: Record<string, string> = {
      'less_than_week': 'Less than a week',
      '1_2_weeks': '1-2 weeks',
      '2_4_weeks': '2-4 weeks',
      '1_3_months': '1-3 months',
      '3_6_months': '3-6 months',
      'more_than_6_months': 'More than 6 months'
    };
    return labels[duration] || '';
  }
}
