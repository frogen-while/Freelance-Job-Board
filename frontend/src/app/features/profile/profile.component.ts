import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, PublicUser } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

interface ProfileData {
  display_name: string;
  headline: string;
  description: string;
  photo_url: string;
  location: string;
  hourly_rate: number | null;
  availability_status: string;
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
  editMode = false;
  successMessage = '';
  errorMessage = '';

  // Profile data
  profileData: ProfileData = {
    display_name: '',
    headline: '',
    description: '',
    photo_url: '',
    location: '',
    hourly_rate: null,
    availability_status: 'available'
  };

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
    this.loadProfile();
    
    if (this.isFreelancer) {
      this.loadSkills();
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
            location: profile.location || '',
            hourly_rate: profile.hourly_rate || null,
            availability_status: profile.availability_status || 'available'
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
    switch (this.profileData.availability_status) {
      case 'available': return 'Available';
      case 'partially_available': return 'Partially Available';
      case 'not_available': return 'Not Available';
      default: return 'Available';
    }
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

    const payload: any = {
      display_name: this.profileData.display_name,
      headline: this.profileData.headline,
      description: this.profileData.description,
      photo_url: this.profileData.photo_url || null,
      location: this.profileData.location || null
    };

    if (this.isFreelancer) {
      payload.hourly_rate = this.profileData.hourly_rate;
      payload.availability_status = this.profileData.availability_status;
      payload.skills = this.selectedSkills;
    }

    this.api.updateProfile(this.user.user_id, payload).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.successMessage = 'Profile updated successfully!';
          this.editMode = false;
        } else {
          this.errorMessage = res.error?.message || 'Failed to update profile';
        }
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Network error. Please try again.';
      }
    });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.loadProfile();
  }
}
