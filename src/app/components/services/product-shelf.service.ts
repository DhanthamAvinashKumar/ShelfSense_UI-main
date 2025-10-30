import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface ProductShelfEntry {
  productShelfId: number;
  productId: number;
  shelfId: number;
  quantity: number;
  lastRestockedAt: string;
}

export interface ProductShelfCreateRequest {
  productId: number;
  shelfId: number;
  quantity: number;
}

export interface ProductShelfAutoAssignRequest {
  productId: number;
  categoryId: number;
  initialQuantity: number;
}

export interface ProductShelfResponse {
  message: string;
  data: ProductShelfEntry[];
}

@Injectable({ providedIn: 'root' })
export class ProductShelfService {
  private readonly API_URL = '/api/ProductShelf';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    if (!token) throw new Error('Authentication token not found.');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAll(): Observable<ProductShelfResponse> {
    return this.http.get<ProductShelfResponse>(this.API_URL, { headers: this.getAuthHeaders() });
  }

  autoAssign(data: ProductShelfAutoAssignRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/auto-assign`, data, { headers: this.getAuthHeaders() });
  }

  update(id: number, data: ProductShelfCreateRequest): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  delete(id: number): Observable<any> {
    const headers = this.getAuthHeaders().set('X-Confirm-Delete', 'true');
    return this.http.delete(`${this.API_URL}/${id}`, { headers });
  }
}
