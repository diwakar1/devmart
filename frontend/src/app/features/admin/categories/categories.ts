import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { Category } from '@shared';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class AdminCategories implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  showForm = false;
  editingId: number | null = null;
  form = { name: '', slug: '', description: '', image_url: '', is_active: true, parent_id: null as number | null };

  constructor(private categoryService: CategoryService, private notify: NotificationService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.categoryService.getAll().subscribe({
      next: res => { if (res.data) this.categories.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAdd(): void {
    this.editingId = null;
    this.form = { name: '', slug: '', description: '', image_url: '', is_active: true, parent_id: null };
    this.showForm = true;
  }

  openEdit(c: Category): void {
    this.editingId = c.id;
    this.form = { name: c.name, slug: c.slug, description: c.description || '', image_url: c.image_url || '', is_active: c.is_active, parent_id: c.parent_id };
    this.showForm = true;
  }

  autoSlug(): void {
    this.form.slug = this.form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  save(): void {
    const obs = this.editingId
      ? this.categoryService.update(this.editingId, this.form)
      : this.categoryService.create(this.form);
    obs.subscribe({
      next: () => { this.notify.success(this.editingId ? 'Updated' : 'Created'); this.showForm = false; this.load(); },
      error: err => this.notify.error(err.error?.message || 'Save failed'),
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Delete this category?')) return;
    this.categoryService.delete(id).subscribe({
      next: () => { this.notify.success('Deleted'); this.load(); },
      error: err => this.notify.error(err.error?.message || 'Delete failed'),
    });
  }
}
