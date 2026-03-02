export interface GroupListResponse {
  groupId: number;
  groupName: string;
  createdByUserId: number;
  createdAtUtc: string;
}

export interface CreateGroupRequest {
  groupName: string;
}

export interface GroupMemberSummaryResponse {
  userId: number;
  fullName: string;
  email: string;
  totalPaid: number;
  totalShare: number;
  amountToPay: number;
  amountToReceive: number;
}
