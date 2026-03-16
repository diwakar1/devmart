import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { BrandService } from '../../../core/services/brand.service';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import type { Product, Category, Brand, ProductFilterQuery, PaginationMeta } from '@shared';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  flatCategories = signal<{ id: number; name: string; isChild: boolean }[]>([]);
  brands = signal<Brand[]>([]);
  pagination = signal<PaginationMeta | null>(null);
  loading = signal(true);
  showFilters = signal(false);

  filters: ProductFilterQuery = {
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  };

  search = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Read all filters from URL (single source of truth)
      this.filters.category = params['category'] ? +params['category'] : undefined;
      this.filters.brand = params['brand'] ? +params['brand'] : undefined;
      this.filters.search = params['search'] || undefined;
      this.filters.sortBy = params['sortBy'] || 'created_at';
      this.filters.sortOrder = (params['sortOrder'] as 'ASC' | 'DESC') || 'DESC';
      this.filters.isFeatured = params['isFeatured'] === 'true' ? true : undefined;
      this.filters.isNew = params['isNew'] === 'true' ? true : undefined;
      this.filters.page = params['page'] ? +params['page'] : 1;
      this.search = this.filters.search || '';
      this.loadProducts();
    });
    this.categoryService.getAll().subscribe(res => {
      if (res.data) {
        this.categories.set(res.data);
        // Flatten tree for sidebar display
        const flat: { id: number; name: string; isChild: boolean }[] = [];
        for (const cat of res.data) {
          flat.push({ id: cat.id, name: cat.name, isChild: false });
          if ((cat as any).children) {
            for (const child of (cat as any).children) {
              flat.push({ id: child.id, name: child.name, isChild: true });
            }
          }
        }
        this.flatCategories.set(flat);
      }
    });
    this.brandService.getAll().subscribe(res => { if (res.data) this.brands.set(res.data); });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAll(this.filters).subscribe({
      next: res => {
        if (res.data) this.products.set(res.data);
        if (res.pagination) this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applySearch(): void {
    this.filters.search = this.search;
    this.filters.page = 1;
    this.updateUrl();
  }

  setCategory(id: number | undefined): void {
    this.filters.category = id;
    this.filters.page = 1;
    this.updateUrl();
  }

  setBrand(id: number | undefined): void {
    this.filters.brand = id;
    this.filters.page = 1;
    this.updateUrl();
  }

  setSort(sortBy: string, sortOrder: 'ASC' | 'DESC'): void {
    this.filters.sortBy = sortBy;
    this.filters.sortOrder = sortOrder;
    this.filters.page = 1;
    this.updateUrl();
  }

  goToPage(page: number): void {
    this.filters.page = page;
    this.updateUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateUrl(): void {
    const queryParams: Record<string, string | null> = {
      category: this.filters.category ? String(this.filters.category) : null,
      brand: this.filters.brand ? String(this.filters.brand) : null,
      search: this.filters.search || null,
      sortBy: this.filters.sortBy !== 'created_at' ? this.filters.sortBy! : null,
      sortOrder: this.filters.sortOrder !== 'DESC' ? this.filters.sortOrder! : null,
      isFeatured: this.filters.isFeatured ? 'true' : null,
      isNew: this.filters.isNew ? 'true' : null,
      page: this.filters.page && this.filters.page > 1 ? String(this.filters.page) : null,
    };
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  get pages(): number[] {
    const p = this.pagination();
    if (!p) return [];
    return Array.from({ length: p.totalPages }, (_, i) => i + 1);
  }
}
