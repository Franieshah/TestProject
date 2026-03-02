import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BalanceService } from '../../core/services/balance.service';
import { AuthService } from '../../core/services/auth.service';
import { BalanceResponse } from '../../core/models/balance.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userName = 'User';
  balance?: BalanceResponse;
  loading = true;
  error: string | null = null;

  constructor(
    private balanceService: BalanceService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user?.fullName) this.userName = user.fullName;

    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.balanceService.getMyBalance().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.balance = res.data;
          this.error = null;
        } else {
          this.error = res.message || 'Unable to load balance.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load balance.';
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.auth.clearSession();
    this.router.navigate(['/login']);
  }

  formatMoney(value: number | undefined): string {
    if (value === undefined || value === null) return '₹0.00';
    return `₹${value.toFixed(2)}`;
  }
}

