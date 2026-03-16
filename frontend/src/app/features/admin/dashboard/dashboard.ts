import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class AdminDashboard implements OnInit {
  stats = signal<any>({
    totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0,
    recentOrders: [],
  });

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: res => this.stats.update(s => ({ ...s, totalProducts: (res as any)?.data?.pagination?.total || (res.data as any)?.length || 0 })),
    });
    this.orderService.getAllOrders().subscribe({
      next: res => {
        const orders = (res.data as any)?.orders || res.data || [];
        this.stats.update(s => ({
          ...s,
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          totalRevenue: Array.isArray(orders) ? orders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0) : 0,
          recentOrders: Array.isArray(orders) ? orders.slice(0, 5) : [],
        }));
      },
    });
    this.userService.getAll().subscribe({
      next: res => this.stats.update(s => ({ ...s, totalUsers: res.data?.length || 0 })),
    });
  }

  getStatusColor(status: string): string {
    const c: Record<string, string> = { pending: '#f39c12', processing: '#3498db', shipped: '#9b59b6', delivered: '#27ae60', cancelled: '#e74c3c' };
    return c[status] || '#999';
  }
}
