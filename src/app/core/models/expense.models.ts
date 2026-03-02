export interface ExpenseResponse {
  expenseId: number;
  groupId: number;
  payerUserId: number;
  amount: number;
  description: string;
  createdAtUtc: string;
}

export interface CreateExpenseRequest {
  groupId: number;
  payerUserId: number;
  amount: number;
  description: string;
}

export interface ExpenseSplitResponse {
  userId: number;
  splitAmount: number;
}

export interface ExpenseDetailResponse {
  expenseId: number;
  groupId: number;
  payerUserId: number;
  amount: number;
  description: string;
  createdAtUtc: string;
  splits: ExpenseSplitResponse[];
}

