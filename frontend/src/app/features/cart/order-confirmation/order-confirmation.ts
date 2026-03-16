import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss',
})
export class OrderConfirmation implements OnInit {
  orderNumber = '';
  order = signal<any>(null);
  loading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.orderNumber = this.route.snapshot.params['orderNumber'] || '';
    const orderId = this.route.snapshot.queryParams['id'];
    if (orderId && this.auth.isLoggedIn()) {
      this.loading.set(true);
      this.orderService.getById(Number(orderId)).subscribe({
        next: res => {
          this.order.set(res.data || null);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else if (!this.auth.isLoggedIn()) {
      // Guest: try to load from sessionStorage (set during checkout)
      const cached = sessionStorage.getItem('guest_order');
      if (cached) {
        try { this.order.set(JSON.parse(cached)); } catch {}
        sessionStorage.removeItem('guest_order');
      }
    }
  }
}
