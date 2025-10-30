import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

// Define the expected types for clarity, based on the previous context
export interface Category {
  id: number;
  name: string; // Assuming 'name' is the property in the Category object
  categoryName?: string; // Included for flexibility based on your Category component
  description?: string;
}

// Assuming your API responses follow a common pattern, e.g., for GET all
export interface ApiResponse<T> {
  message: string;
  data: T; // T would be Category[]
}

// ✅ Base API endpoint for category operations
const CATEGORY_API_URL = '/api/Category';

/**
 * @Service CategoryService
 * Handles all API communication related to Category CRUD operations.
 * Assumes AuthService provides the necessary JWT token.
 */
@Injectable({ providedIn: 'root' })
export class CategoryService {
  // Injecting HttpClient and AuthService for API access and token retrieval
  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * @method getAuthHeaders
   * Centralized method to retrieve the JWT token and set it in the Authorization header.
   * Throws an error if the token is missing, ensuring API calls are only attempted when authenticated.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    if (!token) {
      // Throwing an error is fine, but you might consider using an interceptor
      // or redirecting the user to the login page in a real-world app.
      throw new Error('Authentication token not found.');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * @method createCategory
   * Sends a POST request to create a new category.
   * @param data The category payload (name, description, etc.)
   */
  createCategory(data: any): Observable<any> {
    return this.http.post(CATEGORY_API_URL, data, { headers: this.getAuthHeaders() });
  }

  /**
   * @method getAllCategories
   * Sends a GET request to fetch all categories.
   * 💡 Returns an Observable of either Category[] or ApiResponse<Category[]>
   * depending on how your backend wraps arrays.
   */
  getAllCategories(): Observable<Category[] | ApiResponse<Category[]>> {
    return this.http.get<Category[] | ApiResponse<Category[]>>(CATEGORY_API_URL, { headers: this.getAuthHeaders() });
  }

  /**
   * @method updateCategory
   * Sends a PUT request to update an existing category by ID.
   * @param id The ID of the category to update
   * @param data The updated category payload
   */
  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put(`${CATEGORY_API_URL}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  /**
   * @method deleteCategory
   * Sends a DELETE request to remove a category by ID.
   * Appends the custom header 'X-Confirm-Delete' to the existing auth headers.
   * @param id The ID of the category to delete
   */
  deleteCategory(id: number): Observable<any> {
    let headers = this.getAuthHeaders();
    headers = headers.set('X-Confirm-Delete', 'true');

    return this.http.delete(`${CATEGORY_API_URL}/${id}`, { headers });
  }
}
