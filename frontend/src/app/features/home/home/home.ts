import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import type { Product, Category } from '@shared';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  featuredProducts = signal<Product[]>([]);
  newArrivals = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  private categoryIconMap: Record<string, string> = {
    'electronics': 'devices',
    'clothing': 'checkroom',
    'home-kitchen': 'kitchen',
    'books': 'menu_book',
    'sports-outdoors': 'sports_soccer',
    'beauty-personal-care': 'spa',
    'toys-games': 'toys',
    'smartphones': 'smartphone',
    'laptops': 'laptop',
    'tablets': 'tablet',
    'cameras': 'photo_camera',
    'audio': 'headphones',
    'gaming': 'sports_esports',
  };

  getCategoryIcon(slug: string): string {
    return this.categoryIconMap[slug] || 'category';
  }

  ngOnInit(): void {
    this.productService.getFeatured().subscribe({
      next: res => { if (res.data) this.featuredProducts.set(res.data); },
    });
    this.productService.getNewArrivals().subscribe({
      next: res => { if (res.data) this.newArrivals.set(res.data); },
    });
    this.categoryService.getAll().subscribe({
      next: res => {
        if (res.data) this.categories.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
