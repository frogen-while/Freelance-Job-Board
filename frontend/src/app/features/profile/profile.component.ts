import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, PublicUser } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { ExperienceLevel, AvailabilityStatus, CompanySize } from '../../core/models';

interface ProfileData {
  display_name: string;
  headline: string;
  description: string;
  photo_url: string;
  location: string;
}

interface FreelancerData {
  hourly_rate: number | null;
  availability_status: AvailabilityStatus;
  experience_level: ExperienceLevel | null;
  github_url: string;
  linkedin_url: string;
  jobs_completed: number;
  rating: number | null;
  reviews_count: number;
}

interface EmployerData {
  company_name: string;
  company_description: string;
  company_website: string;
  company_size: CompanySize | null;
  industry: string;
  jobs_posted: number;
  total_spent: number;
  rating: number | null;
  reviews_count: number;
}

interface Skill {
  skill_id: number;
  name: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: PublicUser | null = null;
  loading = true;
  saving = false;
  isFreelancer = false;
  isEmployer = false;
  editMode = false;
  successMessage = '';
  errorMessage = '';

  // Base profile data
  profileData: ProfileData = {
    display_name: '',
    headline: '',
    description: '',
    photo_url: '',
    location: ''
  };

  // Freelancer-specific data
  freelancerData: FreelancerData = {
    hourly_rate: null,
    availability_status: 'available',
    experience_level: null,
    github_url: '',
    linkedin_url: '',
    jobs_completed: 0,
    rating: null,
    reviews_count: 0
  };

  // Employer-specific data
  employerData: EmployerData = {
    company_name: '',
    company_description: '',
    company_website: '',
    company_size: null,
    industry: '',
    jobs_posted: 0,
    total_spent: 0,
    rating: null,
    reviews_count: 0
  };

  industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce',
    'Marketing', 'Media', 'Manufacturing', 'Real Estate', 'Consulting', 'Other'
  ];

  // Skills
  allSkills: Skill[] = [];
  filteredSkills: Skill[] = [];
  selectedSkills: number[] = [];
  skillSearch = '';

  constructor(
    public auth: AuthService, 
    private api: ApiService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
    if (!this.user) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.isFreelancer = this.auth.isFreelancer();
    this.isEmployer = !this.isFreelancer;
    this.loadProfile();
    
    if (this.isFreelancer) {
      this.loadSkills();
      this.loadFreelancerProfile();
    } else {
      this.loadEmployerProfile();
    }
  }

  loadProfile(): void {
    if (!this.user) return;

    this.api.getProfileByUserId(this.user.user_id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const profile = res.data;
          this.profileData = {
            display_name: profile.display_name || `${this.user!.first_name} ${this.user!.last_name}`,
            headline: profile.headline || '',
            description: profile.description || '',
            photo_url: profile.photo_url || '',
            location: profile.location || ''
          };
          
          // Load selected skills for freelancers
          if (this.isFreelancer && profile.skills) {
            this.loadProfileSkills();
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadFreelancerProfile(): void {
    if (!this.user) return;

    this.api.getFreelancerProfile(this.user.user_id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const fp = res.data;
          this.freelancerData = {
            hourly_rate: fp.hourly_rate || null,
            availability_status: fp.availability_status || 'available',
            experience_level: fp.experience_level || null,
            github_url: fp.github_url || '',
            linkedin_url: fp.linkedin_url || '',
            jobs_completed: fp.jobs_completed || 0,
            rating: fp.rating || null,
            reviews_count: fp.reviews_count || 0
          };
        }
      }
    });
  }

  loadEmployerProfile(): void {
    if (!this.user) return;

    this.api.getEmployerProfile(this.user.user_id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const ep = res.data;
          this.employerData = {
            company_name: ep.company_name || '',
            company_description: ep.company_description || '',
            company_website: ep.company_website || '',
            company_size: ep.company_size || null,
            industry: ep.industry || '',
            jobs_posted: ep.jobs_posted || 0,
            total_spent: ep.total_spent || 0,
            rating: ep.rating || null,
            reviews_count: ep.reviews_count || 0
          };
        }
      }
    });
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

  loadProfileSkills(): void {
    if (!this.user) return;

    this.api.getProfileSkills(this.user.user_id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.selectedSkills = res.data.map((s: any) => s.skill_id);
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
    const idx = this.selectedSkills.indexOf(skillId);
    if (idx > -1) {
      this.selectedSkills.splice(idx, 1);
    } else if (this.selectedSkills.length < 15) {
      this.selectedSkills.push(skillId);
    }
  }

  isSkillSelected(skillId: number): boolean {
    return this.selectedSkills.includes(skillId);
  }

  getSkillName(skillId: number): string {
    return this.allSkills.find(s => s.skill_id === skillId)?.name || '';
  }

  removeSkill(skillId: number): void {
    const idx = this.selectedSkills.indexOf(skillId);
    if (idx > -1) {
      this.selectedSkills.splice(idx, 1);
    }
  }

  getInitials(): string {
    if (!this.user) return '';
    return (this.user.first_name[0] + this.user.last_name[0]).toUpperCase();
  }

  getAvailabilityLabel(): string {
    switch (this.freelancerData.availability_status) {
      case 'available': return 'Available';
      case 'partially_available': return 'Partially Available';
      case 'not_available': return 'Not Available';
      default: return 'Available';
    }
  }

  getExperienceLevelLabel(): string {
    switch (this.freelancerData.experience_level) {
      case 'entry': return 'Entry Level';
      case 'intermediate': return 'Intermediate';
      case 'expert': return 'Expert';
      default: return '';
    }
  }

  formatRating(rating: number | null): string {
    if (!rating) return 'No rating';
    return rating.toFixed(1);
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (!this.user) return;

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Step 1: Save base profile
    const basePayload: any = {
      display_name: this.profileData.display_name,
      headline: this.profileData.headline,
      description: this.profileData.description,
      photo_url: this.profileData.photo_url || null,
      location: this.profileData.location || null
    };

    if (this.isFreelancer) {
      basePayload.skills = this.selectedSkills;
    }

    this.api.updateProfile(this.user.user_id, basePayload).subscribe({
      next: (res) => {
        if (res.success) {
          // Step 2: Save type-specific profile
          this.saveTypeSpecificProfile();
        } else {
          this.saving = false;
          this.errorMessage = res.error?.message || 'Failed to update profile';
        }
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Network error. Please try again.';
      }
    });
  }

  private saveTypeSpecificProfile(): void {
    if (!this.user) return;

    if (this.isFreelancer) {
      const freelancerPayload = {
        hourly_rate: this.freelancerData.hourly_rate,
        availability_status: this.freelancerData.availability_status,
        experience_level: this.freelancerData.experience_level,
        github_url: this.freelancerData.github_url || null,
        linkedin_url: this.freelancerData.linkedin_url || null
      };

      this.api.updateFreelancerProfile(this.user.user_id, freelancerPayload).subscribe({
        next: () => {
          this.saving = false;
          this.successMessage = 'Profile updated successfully!';
          this.editMode = false;
        },
        error: () => {
          this.saving = false;
          this.successMessage = 'Profile updated (some data may not have saved).';
          this.editMode = false;
        }
      });
    } else {
      const employerPayload = {
        company_name: this.employerData.company_name || null,
        company_description: this.employerData.company_description || null,
        company_website: this.employerData.company_website || null,
        company_size: this.employerData.company_size,
        industry: this.employerData.industry || null
      };

      this.api.updateEmployerProfile(this.user.user_id, employerPayload).subscribe({
        next: () => {
          this.saving = false;
          this.successMessage = 'Profile updated successfully!';
          this.editMode = false;
        },
        error: () => {
          this.saving = false;
          this.successMessage = 'Profile updated (some data may not have saved).';
          this.editMode = false;
        }
      });
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.loadProfile();
    if (this.isFreelancer) {
      this.loadFreelancerProfile();
    } else {
      this.loadEmployerProfile();
    }
  }
}
