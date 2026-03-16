import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import type { Order } from '@shared';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class OrdersPage implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  selectedOrder = signal<any>(null);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getUserOrders().subscribe({
      next: res => {
        if (res.data) this.orders.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  viewDetail(order: Order): void {
    this.orderService.getById(order.id).subscribe({
      next: res => this.selectedOrder.set(res.data),
    });
  }

  closeDetail(): void {
    this.selectedOrder.set(null);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '#f39c12', processing: '#3498db', shipped: '#9b59b6',
      delivered: '#27ae60', cancelled: '#e74c3c', refunded: '#95a5a6',
    };
    return colors[status] || '#999';
  }
}
