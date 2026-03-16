import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, PaginatedResponse, UserPublic, PaginationQuery } from '@shared';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(query?: PaginationQuery): Observable<PaginatedResponse<UserPublic[]>> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) params = params.set(key, String(value));
      });
    }
    return this.http.get<PaginatedResponse<UserPublic[]>>(this.api, { params });
  }

  getById(id: number): Observable<ApiResponse<UserPublic>> {
    return this.http.get<ApiResponse<UserPublic>>(`${this.api}/${id}`);
  }

  toggleActive(id: number): Observable<ApiResponse<UserPublic>> {
    return this.http.patch<ApiResponse<UserPublic>>(`${this.api}/${id}/toggle-active`, {});
  }

  updateRole(id: number, role: 'user' | 'admin'): Observable<ApiResponse<UserPublic>> {
    return this.http.patch<ApiResponse<UserPublic>>(`${this.api}/${id}/role`, { role });
  }
}
