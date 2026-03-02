import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { ApiResponse } from '../models/api-response';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';

export interface StoredUser {
  userId: number;
  fullName: string;
  email: string;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  register(payload: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${API_BASE_URL}/api/auth/register`,
      payload
    );
  }

  login(payload: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${API_BASE_URL}/api/auth/login`,
      payload
    );
  }

  storeSession(auth: AuthResponse): void {
    localStorage.setItem('settlr.token', auth.token);
    localStorage.setItem('settlr.user', JSON.stringify({
      userId: auth.userId,
      fullName: auth.fullName,
      email: auth.email
    }));
  }

  clearSession(): void {
    localStorage.removeItem('settlr.token');
    localStorage.removeItem('settlr.user');
  }

  getToken(): string | null {
    return localStorage.getItem('settlr.token');
  }

  getUser(): StoredUser | null {
    const raw = localStorage.getItem('settlr.user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  }
}
