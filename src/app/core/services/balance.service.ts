import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { ApiResponse } from '../models/api-response';
import { BalanceResponse } from '../models/balance.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  getMyBalance(): Observable<ApiResponse<BalanceResponse>> {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.get<ApiResponse<BalanceResponse>>(
      `${API_BASE_URL}/api/balances/getMyBalance`,
      { headers }
    );
  }
}
