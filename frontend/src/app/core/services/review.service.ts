import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, PaginatedResponse, Review, CreateReviewRequest, PaginationQuery } from '@shared';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly api = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: number, query?: PaginationQuery): Observable<PaginatedResponse<{ reviews: Review[]; summary: { average: number; total: number; distribution: Record<number, number> } }>> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) params = params.set(key, String(value));
      });
    }
    return this.http.get<PaginatedResponse<{ reviews: Review[]; summary: { average: number; total: number; distribution: Record<number, number> } }>>(`${this.api}/product/${productId}`, { params });
  }

  create(productId: number, data: CreateReviewRequest): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.api}/product/${productId}`, data);
  }

  update(id: number, data: Partial<CreateReviewRequest>): Observable<ApiResponse<Review>> {
    return this.http.put<ApiResponse<Review>>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.api}/${id}`);
  }

  voteHelpful(id: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.api}/${id}/helpful`, {});
  }
}
