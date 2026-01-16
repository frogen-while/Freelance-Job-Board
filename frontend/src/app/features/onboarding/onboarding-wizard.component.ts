import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, PublicUser } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { LocationService, Country, City } from '../../core/location.service';
import { ExperienceLevel, CompanySize } from '../../core/models';

interface OnboardingData {
  // Base profile
  headline: string;
  description: string;
  photo_url: string;
  location: string;
  // Freelancer-specific
  hourly_rate: number | null;
  experience_level: ExperienceLevel | null;
  github_url: string;
  linkedin_url: string;
  skills: number[];
  // Employer-specific
  company_name: string;
  company_description: string;
  company_website: string;
  company_size: CompanySize | null;
  industry: string;
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
  totalSteps = 4;
  isFreelancer = false;
  user: PublicUser | null = null;
  loading = false;
  error = '';

  allSkills: Skill[] = [];
  filteredSkills: Skill[] = [];
  skillSearch = '';

  industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce',
    'Marketing', 'Media', 'Manufacturing', 'Real Estate', 'Consulting', 'Other'
  ];

  // Countries and cities from API
  countries: Country[] = [];
  cities: City[] = [];
  selectedCountry: Country | null = null;
  selectedCity: City | null = null;
  countrySearch: string = '';
  citySearch: string = '';
  filteredCountries: Country[] = [];
  filteredCities: City[] = [];
  showCountryDropdown = false;
  showCityDropdown = false;
  loadingCountries = false;
  loadingCities = false;

  data: OnboardingData = {
    headline: '',
    description: '',
    photo_url: '',
    location: '',
    hourly_rate: null,
    experience_level: null,
    github_url: '',
    linkedin_url: '',
    skills: [],
    company_name: '',
    company_description: '',
    company_website: '',
    company_size: null,
    industry: ''
  };

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isFreelancer = this.auth.isFreelancer();
    this.totalSteps = 4; // Both freelancer and employer have 4 steps

    // Load countries
    this.loadCountries();

    // Load skills for freelancers
    if (this.isFreelancer) {
      this.loadSkills();
    }
  }

  loadCountries(): void {
    this.loadingCountries = true;
    this.locationService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        this.filteredCountries = this.locationService.searchCountries('', countries);
        this.loadingCountries = false;
      },
      error: () => {
        this.loadingCountries = false;
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

  // ========== Country/City Dropdown Methods ==========
  
  filterCountries(): void {
    this.filteredCountries = this.locationService.searchCountries(this.countrySearch, this.countries);
  }

  filterCities(): void {
    this.filteredCities = this.locationService.searchCities(this.citySearch, this.cities);
  }

  selectCountry(country: Country): void {
    this.selectedCountry = country;
    this.countrySearch = country.name;
    this.showCountryDropdown = false;
    
    // Reset city
    this.selectedCity = null;
    this.citySearch = '';
    this.cities = [];
    this.filteredCities = [];
    
    // Load cities for selected country
    if (country.iso2 !== 'REMOTE') {
      this.loadingCities = true;
      this.locationService.getCities(country.iso2).subscribe({
        next: (cities) => {
          this.cities = cities;
          this.filteredCities = this.locationService.searchCities('', cities);
          this.loadingCities = false;
        },
        error: () => {
          this.loadingCities = false;
        }
      });
    }
    
    // Update location
    this.updateLocation();
  }

  selectCity(city: City): void {
    this.selectedCity = city;
    this.citySearch = city.name;
    this.showCityDropdown = false;
    this.updateLocation();
  }

  updateLocation(): void {
    if (this.selectedCountry?.iso2 === 'REMOTE') {
      this.data.location = 'Remote';
    } else if (this.selectedCity && this.selectedCountry) {
      this.data.location = `${this.selectedCity.name}, ${this.selectedCountry.name}`;
    } else if (this.selectedCountry) {
      this.data.location = this.selectedCountry.name;
    } else {
      this.data.location = '';
    }
  }

  onCountryFocus(): void {
    this.filteredCountries = this.locationService.searchCountries('', this.countries);
    this.showCountryDropdown = true;
  }

  onCountryBlur(): void {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      this.showCountryDropdown = false;
    }, 200);
  }

  onCityFocus(): void {
    this.filteredCities = this.locationService.searchCities('', this.cities);
    this.showCityDropdown = true;
  }

  onCityBlur(): void {
    setTimeout(() => {
      this.showCityDropdown = false;
    }, 200);
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
        // Step 1 is always passable (photo and location are optional)
        return true;
      case 2:
        return this.data.headline.trim().length >= 5;
      case 3:
        if (this.isFreelancer) {
          return this.data.description.trim().length >= 20;
        }
        return this.data.description.trim().length >= 10;
      case 4:
        if (this.isFreelancer) {
          return this.data.skills.length >= 1 && this.data.hourly_rate !== null && this.data.hourly_rate > 0;
        }
        // Employer: company name is required
        return this.data.company_name.trim().length >= 2;
      default:
        return true;
    }
  }

  submit(): void {
    if (!this.user) return;

    this.loading = true;
    this.error = '';

    // Step 1: Save base profile
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
          // Step 2: Save type-specific profile
          this.saveTypeSpecificProfile();
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

  private saveTypeSpecificProfile(): void {
    if (!this.user) return;

    if (this.isFreelancer) {
      const freelancerPayload = {
        hourly_rate: this.data.hourly_rate,
        experience_level: this.data.experience_level,
        github_url: this.data.github_url || null,
        linkedin_url: this.data.linkedin_url || null
      };

      this.api.updateFreelancerProfile(this.user.user_id, freelancerPayload).subscribe({
        next: () => this.onSuccess(),
        error: () => this.onSuccess() // Still redirect on partial success
      });
    } else {
      const employerPayload = {
        company_name: this.data.company_name || null,
        company_description: this.data.company_description || null,
        company_website: this.data.company_website || null,
        company_size: this.data.company_size,
        industry: this.data.industry || null
      };

      this.api.updateEmployerProfile(this.user.user_id, employerPayload).subscribe({
        next: () => this.onSuccess(),
        error: () => this.onSuccess() // Still redirect on partial success
      });
    }
  }

  private onSuccess(): void {
    // Update local user
    const updatedUser = { ...this.user!, onboarding_completed: true };
    this.auth.updateUser(updatedUser);

    // Redirect based on user type
    if (this.isFreelancer) {
      this.router.navigate(['/find-work/browse']);
    } else {
      this.router.navigate(['/hire/browse']);
    }
  }
}
