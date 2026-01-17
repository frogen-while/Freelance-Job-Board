import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, PublicUser } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { ExperienceLevel, CompanySize } from '../../core/models';

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
  isFreelancer = false;
  user: PublicUser | null = null;
  loading = false;
  error = '';

  allSkills: Skill[] = [];
  filteredSkills: Skill[] = [];
  skillSearch = '';

  industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Marketing', 'Media', 'Manufacturing', 'Other'];

  data = {
    headline: '',
    description: '',
    photo_url: '',
    location: '',
    hourly_rate: null as number | null,
    experience_level: null as ExperienceLevel | null,
    github_url: '',
    linkedin_url: '',
    skills: [] as number[],
    company_name: '',
    company_description: '',
    company_website: '',
    company_size: null as CompanySize | null,
    industry: ''
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
    this.filteredSkills = this.allSkills.filter(s => s.name.toLowerCase().includes(search)).slice(0, 20);
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

  canSubmit(): boolean {
    if (!this.data.headline.trim()) return false;
    if (this.isFreelancer) {
      return this.data.skills.length >= 1 && this.data.hourly_rate !== null && this.data.hourly_rate > 0;
    }
    return this.data.company_name.trim().length >= 2;
  }

  submit(): void {
    if (!this.user) return;
    this.loading = true;
    this.error = '';

    const basePayload: any = {
      headline: this.data.headline,
      description: this.data.description,
      photo_url: this.data.photo_url || null,
      location: this.data.location || null,
      onboarding_completed: true
    };

    if (this.isFreelancer) {
      basePayload.skills = this.data.skills;
    }

    this.api.updateProfile(this.user.user_id, basePayload).subscribe({
      next: (res) => {
        if (res.success) {
          this.saveTypeSpecificProfile();
        } else {
          this.error = res.error?.message || 'Failed to save profile';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Network error';
        this.loading = false;
      }
    });
  }

  private saveTypeSpecificProfile(): void {
    if (!this.user) return;

    if (this.isFreelancer) {
      this.api.updateFreelancerProfile(this.user.user_id, {
        hourly_rate: this.data.hourly_rate,
        experience_level: this.data.experience_level,
        github_url: this.data.github_url || null,
        linkedin_url: this.data.linkedin_url || null
      }).subscribe({
        next: () => this.onSuccess(),
        error: () => this.onSuccess()
      });
    } else {
      this.api.updateEmployerProfile(this.user.user_id, {
        company_name: this.data.company_name || null,
        company_description: this.data.company_description || null,
        company_website: this.data.company_website || null,
        company_size: this.data.company_size,
        industry: this.data.industry || null
      }).subscribe({
        next: () => this.onSuccess(),
        error: () => this.onSuccess()
      });
    }
  }

  private onSuccess(): void {
    const updatedUser = { ...this.user!, onboarding_completed: true };
    this.auth.updateUser(updatedUser);
    this.router.navigate([this.isFreelancer ? '/find-work/browse' : '/my-jobs']);
  }
}
