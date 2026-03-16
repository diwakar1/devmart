import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, Address, CreateAddressRequest } from '@shared';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly api = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Address[]>> {
    return this.http.get<ApiResponse<Address[]>>(this.api);
  }

  getById(id: number): Observable<ApiResponse<Address>> {
    return this.http.get<ApiResponse<Address>>(`${this.api}/${id}`);
  }

  create(data: CreateAddressRequest): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>(this.api, data);
  }

  update(id: number, data: Partial<CreateAddressRequest>): Observable<ApiResponse<Address>> {
    return this.http.put<ApiResponse<Address>>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.api}/${id}`);
  }

  setDefault(id: number): Observable<ApiResponse<Address>> {
    return this.http.patch<ApiResponse<Address>>(`${this.api}/${id}/default`, {});
  }
}
