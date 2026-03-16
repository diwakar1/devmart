import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfilePage {
  editing = false;
  changingPassword = false;

  firstName = '';
  lastName = '';
  email = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    public authService: AuthService,
    private notify: NotificationService
  ) {
    const user = this.authService.currentUser();
    if (user) {
      this.firstName = user.first_name;
      this.lastName = user.last_name;
      this.email = user.email;
    }
  }

  saveProfile(): void {
    this.authService.updateProfile({ first_name: this.firstName, last_name: this.lastName }).subscribe({
      next: () => {
        this.editing = false;
        this.notify.success('Profile updated');
      },
      error: err => this.notify.error(err.error?.message || 'Update failed'),
    });
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.notify.error('Passwords do not match');
      return;
    }
    this.authService.changePassword({ current_password: this.currentPassword, new_password: this.newPassword }).subscribe({
      next: () => {
        this.changingPassword = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.notify.success('Password changed');
      },
      error: err => this.notify.error(err.error?.message || 'Failed to change password'),
    });
  }
}
