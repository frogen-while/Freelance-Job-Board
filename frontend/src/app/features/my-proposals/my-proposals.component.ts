import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';

interface Proposal {
  id: number;
  jobTitle: string;
  jobDescription: string;
  bidAmount: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
  employerName: string;
}

@Component({
  selector: 'app-my-proposals',
  templateUrl: './my-proposals.component.html',
  styleUrls: ['./my-proposals.component.scss']
})
export class MyProposalsComponent implements OnInit {
  proposals: Proposal[] = [];
  filteredProposals: Proposal[] = [];
  loading = true;
  statusFilter: string = 'all';

  stats = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  };

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.loadProposals();
  }

  private loadProposals(): void {
    // TODO: Replace with actual API call
    // For now, show empty state
    setTimeout(() => {
      this.proposals = [];
      this.filteredProposals = [];
      this.calculateStats();
      this.loading = false;
    }, 500);
  }

  private calculateStats(): void {
    this.stats.total = this.proposals.length;
    this.stats.pending = this.proposals.filter(p => p.status === 'Pending').length;
    this.stats.accepted = this.proposals.filter(p => p.status === 'Accepted').length;
    this.stats.rejected = this.proposals.filter(p => p.status === 'Rejected').length;
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    if (status === 'all') {
      this.filteredProposals = this.proposals;
    } else {
      this.filteredProposals = this.proposals.filter(p => p.status === status);
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
