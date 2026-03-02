export interface GroupBalanceItem {
  groupId: number;
  groupName: string;
  totalPaid: number;
  totalShare: number;
  amountToPay: number;
  amountToReceive: number;
  totalOwed: number;
  net: number;
}

export interface BalanceResponse {
  groups: GroupBalanceItem[];
  overallPaid: number;
  overallShare: number;
  overallToPay: number;
  overallToReceive: number;
  overallOwed: number;
  overallNet: number;
}
