import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AddressService } from '../../../core/services/address.service';
import { OrderService } from '../../../core/services/order.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { Address } from '@shared';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  addresses = signal<Address[]>([]);
  loading = signal(true);
  submitting = signal(false);

  selectedAddressId: number | null = null;
  paymentMethod = 'credit_card';
  customerNotes = '';
  couponCode = '';

  // Card fields
  cardNumber = '';
  cardName = '';
  cardExpiry = '';
  cardCvv = '';

  get cardType(): string {
    const digits = this.cardNumber.replace(/\D/g, '');
    if (digits.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard';
    if (digits.startsWith('37') || digits.startsWith('34')) return 'Amex';
    if (digits.startsWith('6011') || digits.startsWith('65')) return 'Discover';
    return '';
  }

  // Guest shipping address fields
  guestName = '';
  guestEmail = '';
  guestPhone = '';
  guestAddress1 = '';
  guestAddress2 = '';
  guestCity = '';
  guestState = '';
  guestPostalCode = '';
  guestCountry = 'USA';

  constructor(
    public cartService: CartService,
    public auth: AuthService,
    private addressService: AddressService,
    private orderService: OrderService,
    private router: Router,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.cartService.loadCart();

    if (this.auth.isLoggedIn()) {
      this.addressService.getAll().subscribe({
        next: res => {
          if (res.data) {
            this.addresses.set(res.data);
            const defaultAddr = res.data.find((a: Address) => a.is_default);
            if (defaultAddr) this.selectedAddressId = defaultAddr.id;
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.loading.set(false);
    }
  }

  formatCardNumber(): void {
    let v = this.cardNumber.replace(/\D/g, '').substring(0, 16);
    this.cardNumber = v.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  formatExpiry(): void {
    let v = this.cardExpiry.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
    this.cardExpiry = v;
  }

  get isGuest(): boolean {
    return !this.auth.isLoggedIn();
  }

  get canPlaceOrder(): boolean {
    if (this.isGuest) {
      return !!(this.guestName && this.guestEmail && this.guestPhone && this.guestAddress1 && this.guestCity && this.guestState && this.guestPostalCode);
    }
    return !!this.selectedAddressId;
  }

  placeOrder(): void {
    if (this.paymentMethod === 'credit_card' || this.paymentMethod === 'debit_card') {
      if (!this.cardNumber || !this.cardName || !this.cardExpiry || !this.cardCvv) {
        this.notify.error('Please fill in all card details');
        return;
      }
      const digits = this.cardNumber.replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 19) {
        this.notify.error('Card number must be 13-19 digits. Use a test card like 4242 4242 4242 4242');
        return;
      }
    }

    if (this.isGuest) {
      this.placeGuestOrder();
    } else {
      this.placeUserOrder();
    }
  }

  private placeUserOrder(): void {
    if (!this.selectedAddressId) {
      this.notify.error('Please select a shipping address');
      return;
    }
    this.submitting.set(true);
    const cardDigits = (this.paymentMethod === 'credit_card' || this.paymentMethod === 'debit_card')
      ? this.cardNumber.replace(/\D/g, '') : undefined;
    this.orderService.create({
      shipping_address_id: this.selectedAddressId,
      payment_method: this.paymentMethod,
      card_number: cardDigits,
      customer_notes: this.customerNotes || undefined,
      coupon_code: this.couponCode || undefined,
    }).subscribe({
      next: res => {
        this.submitting.set(false);
        if (res.success && res.data) {
          this.notify.success('Order placed successfully!');
          this.cartService.loadCart();
          this.router.navigate(['/order-confirmation', res.data.order_number], { queryParams: { id: res.data.id } });
        }
      },
      error: err => {
        this.submitting.set(false);
        this.notify.error(err.error?.message || 'Failed to place order');
      },
    });
  }

  private placeGuestOrder(): void {
    if (!this.guestName || !this.guestEmail || !this.guestPhone || !this.guestAddress1 || !this.guestCity || !this.guestState || !this.guestPostalCode) {
      this.notify.error('Please fill in all required shipping fields');
      return;
    }

    const guestItems = this.cartService.getGuestItems();
    if (guestItems.length === 0) {
      this.notify.error('Your cart is empty');
      return;
    }

    this.submitting.set(true);
    const guestCardDigits = (this.paymentMethod === 'credit_card' || this.paymentMethod === 'debit_card')
      ? this.cardNumber.replace(/\D/g, '') : undefined;
    this.orderService.guestCheckout({
      items: guestItems.map(i => ({
        product_id: i.product_id,
        variant_id: i.variant_id,
        quantity: i.quantity,
      })),
      shipping_address: {
        full_name: this.guestName,
        email: this.guestEmail,
        phone: this.guestPhone,
        address_line1: this.guestAddress1,
        address_line2: this.guestAddress2 || undefined,
        city: this.guestCity,
        state: this.guestState,
        postal_code: this.guestPostalCode,
        country: this.guestCountry || 'USA',
      },
      payment_method: this.paymentMethod,
      card_number: guestCardDigits,
      customer_notes: this.customerNotes || undefined,
      coupon_code: this.couponCode || undefined,
    }).subscribe({
      next: res => {
        this.submitting.set(false);
        if (res.success && res.data) {
          this.notify.success('Order placed successfully!');
          this.cartService.clearGuestCart();
          this.cartService.loadCart();
          // Cache order for the confirmation page
          try { sessionStorage.setItem('guest_order', JSON.stringify(res.data)); } catch {}
          this.router.navigate(['/order-confirmation', res.data.order_number]);
        }
      },
      error: err => {
        this.submitting.set(false);
        this.notify.error(err.error?.message || 'Failed to place order');
      },
    });
  }
}
