import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './track-order.html',
  styleUrl: './track-order.scss',
})
export class TrackOrder implements OnInit {
  orderNumber = '';
  email = '';
  order = signal<any>(null);
  loading = signal(false);
  searched = signal(false);

  constructor(
    private orderService: OrderService,
    private notify: NotificationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.loading.set(true);
      this.searched.set(true);
      this.orderService.trackByToken(token).subscribe({
        next: res => {
          this.order.set(res.data || null);
          this.loading.set(false);
        },
        error: err => {
          this.loading.set(false);
          this.notify.error(err.error?.message || 'Invalid or expired tracking link');
        },
      });
    }
  }

  search(): void {
    if (!this.orderNumber.trim() || !this.email.trim()) {
      this.notify.error('Please enter both order number and email');
      return;
    }
    this.loading.set(true);
    this.searched.set(true);
    this.order.set(null);
    this.orderService.trackOrder(this.orderNumber.trim(), this.email.trim()).subscribe({
      next: res => {
        this.order.set(res.data || null);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.notify.error(err.error?.message || 'Order not found');
      },
    });
  }

  getStatusStep(status: string): number {
    const steps: Record<string, number> = { pending: 1, processing: 2, shipped: 3, delivered: 4 };
    return steps[status] || 0;
  }
}
