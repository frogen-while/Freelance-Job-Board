import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, PublicUser } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

interface OnboardingData {
  display_name: string;
  headline: string;
  description: string;
  photo_url: string;
  location: string;
  hourly_rate: number | null;
  availability_status: 'available' | 'partially_available' | 'not_available';
  skills: number[];
}

interface Skill {
  skill_id: number;
  name: string;
}

@Component({
  selector: 'app-onboarding-wizard',
  templateUrl: './onboarding-wizard.component.html',
  styleUrls: ['./onboarding-wizard.component.scss']
})
export class OnboardingWizardComponent implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  isFreelancer = false;
  user: PublicUser | null = null;
  loading = false;
  error = '';

  allSkills: Skill[] = [];
  filteredSkills: Skill[] = [];
  skillSearch = '';

  data: OnboardingData = {
    display_name: '',
    headline: '',
    description: '',
    photo_url: '',
    location: '',
    hourly_rate: null,
    availability_status: 'available',
    skills: []
  };

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isFreelancer = this.auth.isFreelancer();
    this.totalSteps = this.isFreelancer ? 4 : 3;

    // Pre-fill display name
    this.data.display_name = `${this.user.first_name} ${this.user.last_name}`;

    // Load skills for freelancers
    if (this.isFreelancer) {
      this.loadSkills();
    }
  }

  loadSkills(): void {
    this.api.getSkills().subscribe({
      next: (res) => {
        if (res.success) {
          this.allSkills = res.data;
          this.filteredSkills = this.allSkills.slice(0, 20);
        }
      }
    });
  }

  filterSkills(): void {
    if (!this.skillSearch.trim()) {
      this.filteredSkills = this.allSkills.slice(0, 20);
      return;
    }
    const search = this.skillSearch.toLowerCase();
    this.filteredSkills = this.allSkills
      .filter(s => s.name.toLowerCase().includes(search))
      .slice(0, 20);
  }

  toggleSkill(skillId: number): void {
    const idx = this.data.skills.indexOf(skillId);
    if (idx > -1) {
      this.data.skills.splice(idx, 1);
    } else if (this.data.skills.length < 15) {
      this.data.skills.push(skillId);
    }
  }

  isSkillSelected(skillId: number): boolean {
    return this.data.skills.includes(skillId);
  }

  getSkillName(skillId: number): string {
    return this.allSkills.find(s => s.skill_id === skillId)?.name || '';
  }

  removeSkill(skillId: number): void {
    const idx = this.data.skills.indexOf(skillId);
    if (idx > -1) {
      this.data.skills.splice(idx, 1);
    }
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

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.data.display_name.trim().length >= 2;
      case 2:
        return this.data.headline.trim().length >= 5;
      case 3:
        if (this.isFreelancer) {
          return this.data.description.trim().length >= 20;
        }
        return this.data.description.trim().length >= 10;
      case 4:
        return this.isFreelancer && this.data.skills.length >= 1 && this.data.hourly_rate !== null && this.data.hourly_rate > 0;
      default:
        return true;
    }
  }

  submit(): void {
    if (!this.user) return;

    this.loading = true;
    this.error = '';

    const payload: any = {
      display_name: this.data.display_name,
      headline: this.data.headline,
      description: this.data.description,
      photo_url: this.data.photo_url || null,
      location: this.data.location || null,
      onboarding_completed: true
    };

    if (this.isFreelancer) {
      payload.hourly_rate = this.data.hourly_rate;
      payload.availability_status = this.data.availability_status;
      payload.skills = this.data.skills;
    }

    this.api.updateProfile(this.user.user_id, payload).subscribe({
      next: (res) => {
        if (res.success) {
          // Update local user
          const updatedUser = { ...this.user!, onboarding_completed: true };
          this.auth.updateUser(updatedUser);

          // Redirect based on user type
          if (this.isFreelancer) {
            this.router.navigate(['/find-work/browse']);
          } else {
            this.router.navigate(['/hire/browse']);
          }
        } else {
          this.error = res.error?.message || 'Failed to save profile';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Network error. Please try again.';
        this.loading = false;
      }
    });
  }
}
