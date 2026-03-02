import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { ApiResponse } from '../models/api-response';
import { CreateExpenseRequest, ExpenseDetailResponse, ExpenseResponse } from '../models/expense.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  getGroupExpenses(groupId: number): Observable<ApiResponse<ExpenseResponse[]>> {
    return this.http.get<ApiResponse<ExpenseResponse[]>>(
      `${API_BASE_URL}/api/expenses/group/${groupId}`,
      { headers: this.authHeader() }
    );
  }

  getExpenseDetail(expenseId: number): Observable<ApiResponse<ExpenseDetailResponse>> {
    return this.http.get<ApiResponse<ExpenseDetailResponse>>(
      `${API_BASE_URL}/api/expenses/${expenseId}`,
      { headers: this.authHeader() }
    );
  }

  createExpense(payload: CreateExpenseRequest): Observable<ApiResponse<ExpenseResponse>> {
    return this.http.post<ApiResponse<ExpenseResponse>>(
      `${API_BASE_URL}/api/expenses`,
      payload,
      { headers: this.authHeader() }
    );
  }

  private authHeader(): HttpHeaders | undefined {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }
}
