import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { ApiResponse } from '../models/api-response';
import { CreateGroupRequest, GroupListResponse, GroupMemberSummaryResponse } from '../models/group.models';
import { UserListResponse } from '../models/user.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class GroupService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  getMyGroups(): Observable<ApiResponse<GroupListResponse[]>> {
    return this.http.get<ApiResponse<GroupListResponse[]>>(
      `${API_BASE_URL}/api/groups`,
      { headers: this.authHeader() }
    );
  }

  getGroupMembers(groupId: number): Observable<ApiResponse<UserListResponse[]>> {
    return this.http.get<ApiResponse<UserListResponse[]>>(
      `${API_BASE_URL}/api/groups/${groupId}/members`,
      { headers: this.authHeader() }
    );
  }

  getGroupMemberSummary(groupId: number): Observable<ApiResponse<GroupMemberSummaryResponse[]>> {
    return this.http.get<ApiResponse<GroupMemberSummaryResponse[]>>(
      `${API_BASE_URL}/api/groups/${groupId}/members/summary`,
      { headers: this.authHeader() }
    );
  }

  createGroup(payload: CreateGroupRequest): Observable<ApiResponse<GroupListResponse>> {
    return this.http.post<ApiResponse<GroupListResponse>>(
      `${API_BASE_URL}/api/groups`,
      payload,
      { headers: this.authHeader() }
    );
  }

  addMembers(groupId: number, userIds: number[]): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(
      `${API_BASE_URL}/api/groups/${groupId}/members`,
      { userId: userIds },
      { headers: this.authHeader() }
    );
  }

  private authHeader(): HttpHeaders | undefined {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }
}
