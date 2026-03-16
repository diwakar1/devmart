import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, Wishlist } from '@shared';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly api = `${environment.apiUrl}/wishlist`;

  private wishlistSig = signal<Wishlist[]>([]);
  readonly wishlist = this.wishlistSig.asReadonly();

  constructor(private http: HttpClient) {}

  loadWishlist(): void {
    this.http.get<ApiResponse<Wishlist[]>>(this.api).subscribe({
      next: res => { if (res.success && res.data) this.wishlistSig.set(res.data); },
      error: () => this.wishlistSig.set([]),
    });
  }

  add(productId: number): Observable<ApiResponse<Wishlist>> {
    return this.http.post<ApiResponse<Wishlist>>(`${this.api}/${productId}`, {}).pipe(
      tap(() => this.loadWishlist())
    );
  }

  remove(productId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.api}/${productId}`).pipe(
      tap(() => this.loadWishlist())
    );
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistSig().some(w => w.product_id === productId);
  }
}
