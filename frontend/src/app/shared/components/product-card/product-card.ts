import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Product } from '@shared';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  @Input({ required: true }) product!: Product;

  get hasDiscount(): boolean {
    return !!this.product.discount_price && this.product.discount_price < this.product.price;
  }

  get discountPercent(): number {
    if (!this.hasDiscount) return 0;
    return Math.round((1 - this.product.discount_price! / this.product.price) * 100);
  }

  get displayPrice(): number {
    return this.hasDiscount ? this.product.discount_price! : this.product.price;
  }
}
