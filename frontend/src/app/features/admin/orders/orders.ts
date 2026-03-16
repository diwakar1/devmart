import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { Order } from '@shared';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class AdminOrders implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  selectedOrder = signal<any>(null);
  newStatus = '';
  trackingNumber = '';

  constructor(private orderService: OrderService, private notify: NotificationService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.orderService.getAllOrders().subscribe({
      next: res => {
        const data = (res.data as any)?.orders || res.data || [];
        this.orders.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  viewOrder(order: Order): void {
    this.orderService.getById(order.id).subscribe({
      next: res => {
        this.selectedOrder.set(res.data);
        this.newStatus = res.data?.status || order.status;
        this.trackingNumber = res.data?.tracking_number || '';
      },
    });
  }

  updateStatus(): void {
    const order = this.selectedOrder();
    if (!order) return;
    this.orderService.updateStatus(order.id, this.newStatus).subscribe({
      next: () => { this.notify.success('Status updated'); this.load(); this.selectedOrder.set(null); },
      error: err => this.notify.error(err.error?.message || 'Update failed'),
    });
  }

  updateTracking(): void {
    const order = this.selectedOrder();
    if (!order) return;
    this.orderService.updateTracking(order.id, { tracking_number: this.trackingNumber }).subscribe({
      next: () => { this.notify.success('Tracking updated'); },
      error: err => this.notify.error(err.error?.message || 'Update failed'),
    });
  }

  getStatusColor(status: string): string {
    const c: Record<string, string> = { pending: '#f39c12', processing: '#3498db', shipped: '#9b59b6', delivered: '#27ae60', cancelled: '#e74c3c', refunded: '#95a5a6' };
    return c[status] || '#999';
  }
}
