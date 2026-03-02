import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { ApiResponse } from '../models/api-response';
import { UserListResponse } from '../models/user.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  getUsers(excludeGroupId?: number): Observable<ApiResponse<UserListResponse[]>> {
    const query = excludeGroupId ? `?excludeGroupId=${excludeGroupId}` : '';
    return this.http.get<ApiResponse<UserListResponse[]>>(
      `${API_BASE_URL}/api/users${query}`,
      { headers: this.authHeader() }
    );
  }

  private authHeader(): HttpHeaders | undefined {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }
}
