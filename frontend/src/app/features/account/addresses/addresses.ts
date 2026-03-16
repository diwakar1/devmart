import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../../core/services/address.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { Address } from '@shared';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addresses.html',
  styleUrl: './addresses.scss',
})
export class AddressesPage implements OnInit {
  addresses = signal<Address[]>([]);
  loading = signal(true);
  showForm = false;
  editingId: number | null = null;

  form = {
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', postal_code: '', country: 'US', address_type: 'shipping' as const, is_default: false,
  };

  constructor(
    private addressService: AddressService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.addressService.getAll().subscribe({
      next: res => { if (res.data) this.addresses.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAdd(): void {
    this.editingId = null;
    this.form = { full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'US', address_type: 'shipping', is_default: false };
    this.showForm = true;
  }

  openEdit(addr: Address): void {
    this.editingId = addr.id;
    this.form = {
      full_name: addr.full_name, phone: addr.phone || '', address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '', city: addr.city, state: addr.state,
      postal_code: addr.postal_code, country: addr.country, address_type: addr.address_type as any, is_default: addr.is_default,
    };
    this.showForm = true;
  }

  saveAddress(): void {
    const obs = this.editingId
      ? this.addressService.update(this.editingId, this.form)
      : this.addressService.create(this.form);

    obs.subscribe({
      next: () => {
        this.notify.success(this.editingId ? 'Address updated' : 'Address added');
        this.showForm = false;
        this.load();
      },
      error: err => this.notify.error(err.error?.message || 'Failed to save'),
    });
  }

  deleteAddress(id: number): void {
    this.addressService.delete(id).subscribe({
      next: () => { this.notify.success('Address deleted'); this.load(); },
      error: err => this.notify.error(err.error?.message || 'Failed to delete'),
    });
  }

  setDefault(id: number): void {
    this.addressService.setDefault(id).subscribe({
      next: () => { this.notify.success('Default address updated'); this.load(); },
    });
  }
}
