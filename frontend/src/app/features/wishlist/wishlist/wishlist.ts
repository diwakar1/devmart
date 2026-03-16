import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class WishlistPage implements OnInit {
  loading = signal(true);

  constructor(
    public wishlistService: WishlistService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.wishlistService.loadWishlist();
    this.loading.set(false);
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.remove(productId).subscribe({
      next: () => this.notify.success('Removed from wishlist'),
      error: () => this.notify.error('Failed to remove'),
    });
  }
}
