import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import type { Product, Review } from '@shared';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCard],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  product = signal<Product | null>(null);
  reviews = signal<Review[]>([]);
  reviewSummary = signal<{ average: number; total: number; distribution: Record<number, number> } | null>(null);
  relatedProducts = signal<Product[]>([]);
  loading = signal(true);
  quantity = 1;
  activeTab = signal<'description' | 'reviews'>('description');

  // Review form
  newRating = 5;
  newTitle = '';
  newComment = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public cartService: CartService,
    public wishlistService: WishlistService,
    private reviewService: ReviewService,
    public auth: AuthService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.productService.getBySlug(slug).subscribe({
          next: res => {
            if (res.data) {
              this.product.set(res.data);
              this.loadReviews(res.data.id);
              this.loadRelated(res.data.id);
            }
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      }
    });
  }

  private loadReviews(productId: number): void {
    this.reviewService.getProductReviews(productId).subscribe({
      next: res => {
        if (res.data) {
          this.reviews.set(res.data.reviews || []);
          this.reviewSummary.set(res.data.summary || null);
        }
      },
    });
  }

  private loadRelated(productId: number): void {
    this.productService.getRelated(productId).subscribe({
      next: res => this.relatedProducts.set(res.data || []),
    });
  }

  get hasDiscount(): boolean {
    const p = this.product();
    return !!p?.discount_price && p.discount_price < p.price;
  }

  get displayPrice(): number {
    const p = this.product();
    if (!p) return 0;
    return this.hasDiscount ? p.discount_price! : p.price;
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.addItem({
      product_id: p.id,
      quantity: this.quantity,
      product_name: p.name,
      product_image: '',
      price: this.displayPrice,
    }).subscribe({
      next: () => this.notify.success('Added to cart!'),
      error: err => this.notify.error(err.error?.message || 'Failed to add to cart'),
    });
  }

  toggleWishlist(): void {
    if (!this.auth.isLoggedIn()) {
      this.notify.error('Please sign in to use wishlist');
      this.router.navigate(['/login']);
      return;
    }
    const p = this.product();
    if (!p) return;
    if (this.wishlistService.isInWishlist(p.id)) {
      this.wishlistService.remove(p.id).subscribe();
    } else {
      this.wishlistService.add(p.id).subscribe();
    }
  }

  submitReview(): void {
    const p = this.product();
    if (!p) return;
    this.reviewService.create(p.id, {
      rating: this.newRating,
      title: this.newTitle,
      comment: this.newComment,
    }).subscribe({
      next: () => {
        this.notify.success('Review submitted!');
        this.newTitle = '';
        this.newComment = '';
        this.newRating = 5;
        this.loadReviews(p.id);
      },
      error: err => this.notify.error(err.error?.message || 'Failed to submit review'),
    });
  }
}
