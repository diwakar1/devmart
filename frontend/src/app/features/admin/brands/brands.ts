import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandService } from '../../../core/services/brand.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { Brand } from '@shared';

@Component({
  selector: 'app-admin-brands',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
})
export class AdminBrands implements OnInit {
  brands = signal<Brand[]>([]);
  loading = signal(true);
  showForm = false;
  editingId: number | null = null;
  form = { name: '', slug: '', description: '', logo_url: '', is_active: true };

  constructor(private brandService: BrandService, private notify: NotificationService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.brandService.getAll().subscribe({
      next: res => { if (res.data) this.brands.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAdd(): void {
    this.editingId = null;
    this.form = { name: '', slug: '', description: '', logo_url: '', is_active: true };
    this.showForm = true;
  }

  openEdit(b: Brand): void {
    this.editingId = b.id;
    this.form = { name: b.name, slug: b.slug, description: b.description || '', logo_url: b.logo_url || '', is_active: b.is_active };
    this.showForm = true;
  }

  autoSlug(): void {
    this.form.slug = this.form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  save(): void {
    const obs = this.editingId
      ? this.brandService.update(this.editingId, this.form)
      : this.brandService.create(this.form);
    obs.subscribe({
      next: () => { this.notify.success(this.editingId ? 'Updated' : 'Created'); this.showForm = false; this.load(); },
      error: err => this.notify.error(err.error?.message || 'Save failed'),
    });
  }

  deleteBrand(id: number): void {
    if (!confirm('Delete this brand?')) return;
    this.brandService.delete(id).subscribe({
      next: () => { this.notify.success('Deleted'); this.load(); },
      error: err => this.notify.error(err.error?.message || 'Delete failed'),
    });
  }
}
