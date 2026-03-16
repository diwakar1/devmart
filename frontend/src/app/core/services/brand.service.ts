import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, PaginatedResponse, Brand, PaginationQuery } from '@shared';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly api = `${environment.apiUrl}/brands`;

  constructor(private http: HttpClient) {}

  getAll(query?: PaginationQuery): Observable<PaginatedResponse<Brand[]>> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) params = params.set(key, String(value));
      });
    }
    return this.http.get<PaginatedResponse<Brand[]>>(this.api, { params });
  }

  getById(id: number): Observable<ApiResponse<Brand>> {
    return this.http.get<ApiResponse<Brand>>(`${this.api}/${id}`);
  }

  getBySlug(slug: string): Observable<ApiResponse<Brand>> {
    return this.http.get<ApiResponse<Brand>>(`${this.api}/slug/${slug}`);
  }

  create(data: Partial<Brand>): Observable<ApiResponse<Brand>> {
    return this.http.post<ApiResponse<Brand>>(this.api, data);
  }

  update(id: number, data: Partial<Brand>): Observable<ApiResponse<Brand>> {
    return this.http.put<ApiResponse<Brand>>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.api}/${id}`);
  }
}
