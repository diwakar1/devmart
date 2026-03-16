import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, PaginatedResponse, Order, CreateOrderRequest, GuestCheckoutRequest, PaginationQuery } from '@shared';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  create(data: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.api, data);
  }

  guestCheckout(data: GuestCheckoutRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.api}/guest`, data);
  }

  trackOrder(orderNumber: string, email: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.api}/track`, { order_number: orderNumber, email });
  }

  trackByToken(token: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.api}/track/${token}`);
  }

  getUserOrders(query?: PaginationQuery): Observable<PaginatedResponse<Order[]>> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) params = params.set(key, String(value));
      });
    }
    return this.http.get<PaginatedResponse<Order[]>>(this.api, { params });
  }

  getById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.api}/${id}`);
  }

  cancel(id: number): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.api}/${id}/cancel`, {});
  }

  // Admin
  getAllOrders(query?: PaginationQuery): Observable<PaginatedResponse<Order[]>> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) params = params.set(key, String(value));
      });
    }
    return this.http.get<PaginatedResponse<Order[]>>(`${this.api}/admin/all`, { params });
  }

  updateStatus(id: number, status: string, notes?: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.api}/${id}/status`, { status, notes });
  }

  updateTracking(id: number, data: { tracking_number: string; shipping_provider?: string; tracking_url?: string }): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.api}/${id}/tracking`, data);
  }
}
