import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { BrandService } from '../../../core/services/brand.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { Product, Brand } from '@shared';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class AdminProducts implements OnInit {
  products = signal<Product[]>([]);
  brands = signal<Brand[]>([]);
  loading = signal(true);
  showForm = false;
  editingId: number | null = null;

  form: any = {
    name: '', slug: '', description: '', short_description: '',
    price: 0, discount_price: null, cost_price: null,
    sku: '', stock_quantity: 0, brand_id: null,
    is_active: true, is_featured: false,
  };

  constructor(
    private productService: ProductService,
    private brandService: BrandService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
    this.brandService.getAll().subscribe({ next: res => { if (res.data) this.brands.set(res.data); } });
  }

  load(): void {
    this.productService.getAll({ limit: 100 }).subscribe({
      next: res => { this.products.set((res.data as any)?.products || res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAdd(): void {
    this.editingId = null;
    this.form = { name: '', slug: '', description: '', short_description: '', price: 0, discount_price: null, cost_price: null, sku: '', stock_quantity: 0, brand_id: null, is_active: true, is_featured: false };
    this.showForm = true;
  }

  openEdit(p: Product): void {
    this.editingId = p.id;
    this.form = {
      name: p.name, slug: p.slug, description: p.description || '', short_description: p.short_description || '',
      price: p.price, discount_price: p.discount_price, cost_price: p.cost_price,
      sku: p.sku, stock_quantity: p.stock_quantity, brand_id: p.brand_id,
      is_active: p.is_active, is_featured: p.is_featured,
    };
    this.showForm = true;
  }

  autoSlug(): void {
    this.form.slug = this.form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  save(): void {
    const obs = this.editingId
      ? this.productService.update(this.editingId, this.form)
      : this.productService.create(this.form);

    obs.subscribe({
      next: () => { this.notify.success(this.editingId ? 'Product updated' : 'Product created'); this.showForm = false; this.load(); },
      error: err => this.notify.error(err.error?.message || 'Save failed'),
    });
  }

  deleteProduct(id: number): void {
    if (!confirm('Delete this product?')) return;
    this.productService.delete(id).subscribe({
      next: () => { this.notify.success('Product deleted'); this.load(); },
      error: err => this.notify.error(err.error?.message || 'Delete failed'),
    });
  }
}
