import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, forkJoin, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '@shared';

export interface CartItemExt extends CartItem {
  product_name?: string;
  product_image?: string;
  product_price?: number;
}

export interface CartWithItems extends Cart {
  items: CartItemExt[];
}

/** Shape stored in localStorage for guest carts */
export interface GuestCartItem {
  id: number;           // local auto-increment
  product_id: number;
  variant_id: number | null;
  quantity: number;
  price_snapshot: number;
  product_name: string;
  product_image: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = `${environment.apiUrl}/cart`;
  private readonly GUEST_KEY = 'devmart_guest_cart';
  private localIdCounter = 1;

  private http = inject(HttpClient);

  private cartSig = signal<CartWithItems | null>(null);
  readonly cart = this.cartSig.asReadonly();

  readonly cartItemCount = computed(() => {
    const cart = this.cartSig();
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  });

  readonly cartTotal = computed(() => {
    const cart = this.cartSig();
    return cart?.items?.reduce((sum, item) => sum + item.price_snapshot * item.quantity, 0) ?? 0;
  });

  /** Whether the user is currently authenticated (injected lazily to avoid circular DI) */
  private get isLoggedIn(): boolean {
    return !!localStorage.getItem('devmart_access_token');
  }

  // ── Load cart ────────────────────────────────────────────
  loadCart(): void {
    if (this.isLoggedIn) {
      this.http.get<ApiResponse<CartWithItems>>(`${this.api}`).subscribe({
        next: res => { if (res.success && res.data) this.cartSig.set(res.data); },
        error: () => this.cartSig.set(null),
      });
    } else {
      this.loadGuestCart();
    }
  }

  // ── Add item ─────────────────────────────────────────────
  addItem(data: AddToCartRequest & { product_name?: string; product_image?: string; price?: number }): Observable<ApiResponse<CartWithItems>> {
    if (this.isLoggedIn) {
      return this.http.post<ApiResponse<CartWithItems>>(`${this.api}/items`, data).pipe(
        tap(res => { if (res.success && res.data) this.cartSig.set(res.data); })
      );
    }

    // Guest mode — store locally
    const items = this.getGuestItems();
    const existing = items.find(
      i => i.product_id === data.product_id && i.variant_id === (data.variant_id ?? null)
    );
    if (existing) {
      existing.quantity = data.quantity ?? 1;
    } else {
      items.push({
        id: this.localIdCounter++,
        product_id: data.product_id,
        variant_id: data.variant_id ?? null,
        quantity: data.quantity ?? 1,
        price_snapshot: data.price ?? 0,
        product_name: data.product_name ?? `Product #${data.product_id}`,
        product_image: data.product_image ?? '',
      });
    }
    this.saveGuestItems(items);
    return of({ success: true, message: 'Added to cart' } as ApiResponse<CartWithItems>);
  }

  // ── Update item ──────────────────────────────────────────
  updateItem(itemId: number, data: UpdateCartItemRequest): Observable<ApiResponse<CartWithItems>> {
    if (this.isLoggedIn) {
      return this.http.put<ApiResponse<CartWithItems>>(`${this.api}/items/${itemId}`, data).pipe(
        tap(res => { if (res.success && res.data) this.cartSig.set(res.data); })
      );
    }

    const items = this.getGuestItems();
    const item = items.find(i => i.id === itemId);
    if (item) item.quantity = data.quantity;
    this.saveGuestItems(items);
    return of({ success: true, message: 'Updated' } as ApiResponse<CartWithItems>);
  }

  // ── Remove item ──────────────────────────────────────────
  removeItem(itemId: number): Observable<ApiResponse<CartWithItems>> {
    if (this.isLoggedIn) {
      return this.http.delete<ApiResponse<CartWithItems>>(`${this.api}/items/${itemId}`).pipe(
        tap(res => { if (res.success && res.data) this.cartSig.set(res.data); })
      );
    }

    let items = this.getGuestItems();
    items = items.filter(i => i.id !== itemId);
    this.saveGuestItems(items);
    return of({ success: true, message: 'Removed' } as ApiResponse<CartWithItems>);
  }

  // ── Clear cart ───────────────────────────────────────────
  clearCart(): Observable<ApiResponse> {
    if (this.isLoggedIn) {
      return this.http.delete<ApiResponse>(`${this.api}`).pipe(
        tap(() => this.cartSig.set(null))
      );
    }

    localStorage.removeItem(this.GUEST_KEY);
    this.cartSig.set(null);
    return of({ success: true, message: 'Cart cleared' } as ApiResponse);
  }

  // ── Merge guest cart into server cart on login ───────────
  mergeGuestCart(): Observable<unknown> {
    const guestItems = this.getGuestItems();
    if (guestItems.length === 0) return of(null);

    const requests = guestItems.map(item =>
      this.http.post<ApiResponse<CartWithItems>>(`${this.api}/items`, {
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      } as AddToCartRequest)
    );

    return forkJoin(requests).pipe(
      switchMap(() => {
        localStorage.removeItem(this.GUEST_KEY);
        // Reload the server cart to get merged state
        return this.http.get<ApiResponse<CartWithItems>>(`${this.api}`);
      }),
      tap(res => {
        if ((res as ApiResponse<CartWithItems>).success && (res as ApiResponse<CartWithItems>).data) {
          this.cartSig.set((res as ApiResponse<CartWithItems>).data!);
        }
      })
    );
  }

  /** Returns raw guest cart items (for guest checkout) */
  getGuestItems(): GuestCartItem[] {
    try {
      const raw = localStorage.getItem(this.GUEST_KEY);
      const items: GuestCartItem[] = raw ? JSON.parse(raw) : [];
      // keep localIdCounter above max existing id
      if (items.length > 0) {
        this.localIdCounter = Math.max(...items.map(i => i.id)) + 1;
      }
      return items;
    } catch {
      return [];
    }
  }

  clearGuestCart(): void {
    localStorage.removeItem(this.GUEST_KEY);
  }

  /** Copy the current (server) cart into localStorage so it survives logout */
  transferToGuestCart(): void {
    const cart = this.cartSig();
    if (!cart?.items?.length) return;

    const guestItems: GuestCartItem[] = cart.items.map((item, idx) => ({
      id: idx + 1,
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      quantity: item.quantity,
      price_snapshot: item.price_snapshot,
      product_name: item.product_name ?? `Product #${item.product_id}`,
      product_image: item.product_image ?? '',
    }));
    localStorage.setItem(this.GUEST_KEY, JSON.stringify(guestItems));
  }

  // ── Private helpers ──────────────────────────────────────
  private saveGuestItems(items: GuestCartItem[]): void {
    localStorage.setItem(this.GUEST_KEY, JSON.stringify(items));
    this.loadGuestCart();
  }

  private loadGuestCart(): void {
    const items = this.getGuestItems();
    if (items.length === 0) {
      this.cartSig.set(null);
      return;
    }
    // Map guest items to CartWithItems shape
    this.cartSig.set({
      id: 0,
      user_id: null,
      session_id: null,
      created_at: '',
      updated_at: '',
      items: items.map(i => ({
        id: i.id,
        cart_id: 0,
        product_id: i.product_id,
        variant_id: i.variant_id as any,
        quantity: i.quantity,
        price_snapshot: i.price_snapshot,
        created_at: '',
        updated_at: '',
        product_name: i.product_name,
        product_image: i.product_image,
        product_price: i.price_snapshot,
      })),
    });
  }
}
