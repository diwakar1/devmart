import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterPage {
  first_name = '';
  last_name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  showPassword = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

  onSubmit(): void {
    if (!this.first_name || !this.last_name || !this.email || !this.password) return;
    if (this.password !== this.confirmPassword) {
      this.notify.error('Passwords do not match');
      return;
    }
    this.loading.set(true);
    this.auth.register({
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      password: this.password,
    }).subscribe({
      next: res => {
        this.loading.set(false);
        if (res.success) {
          this.notify.success('Account created successfully!');
          this.router.navigate(['/']);
        }
      },
      error: err => {
        this.loading.set(false);
        this.notify.error(err.error?.message || 'Registration failed');
      },
    });
  }
}
