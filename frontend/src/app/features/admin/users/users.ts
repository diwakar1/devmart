import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { UserPublic } from '@shared';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class AdminUsers implements OnInit {
  users = signal<UserPublic[]>([]);
  loading = signal(true);

  constructor(private userService: UserService, private notify: NotificationService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.userService.getAll().subscribe({
      next: res => { if (res.data) this.users.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  toggleActive(user: UserPublic): void {
    this.userService.toggleActive(user.id).subscribe({
      next: () => { this.notify.success(`User ${user.is_active ? 'deactivated' : 'activated'}`); this.load(); },
      error: err => this.notify.error(err.error?.message || 'Action failed'),
    });
  }

  changeRole(user: UserPublic, role: string): void {
    this.userService.updateRole(user.id, role as 'user' | 'admin').subscribe({
      next: () => { this.notify.success('Role updated'); this.load(); },
      error: err => this.notify.error(err.error?.message || 'Action failed'),
    });
  }
}
