import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartWithItems } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartPage implements OnInit {
  constructor(
    public cartService: CartService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.cartService.loadCart();
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateItem(itemId, { quantity }).subscribe({
      error: err => this.notify.error(err.error?.message || 'Failed to update item'),
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe({
      next: () => this.notify.success('Item removed from cart'),
      error: err => this.notify.error(err.error?.message || 'Failed to remove item'),
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => this.notify.success('Cart cleared'),
    });
  }
}
