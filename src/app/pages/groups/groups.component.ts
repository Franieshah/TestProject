import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GroupService } from '../../core/services/group.service';
import { ExpenseService } from '../../core/services/expense.service';
import { UserService } from '../../core/services/user.service';
import { GroupListResponse, GroupMemberSummaryResponse } from '../../core/models/group.models';
import { ExpenseDetailResponse, ExpenseResponse } from '../../core/models/expense.models';
import { UserListResponse } from '../../core/models/user.models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/toast/toast.service';

type MemberTotals = GroupMemberSummaryResponse;

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss'
})
export class GroupsComponent implements OnInit {
  private fb = inject(FormBuilder);

  userName = 'User';
  groups: GroupListResponse[] = [];
  expenses: ExpenseResponse[] = [];
  selectedGroup: GroupListResponse | null = null;
  users: UserListResponse[] = [];

  memberTotals: MemberTotals[] = [];
  expenseDetails = new Map<number, ExpenseDetailResponse>();

  loadingGroups = true;
  loadingExpenses = false;
  loadingMembers = false;
  groupsError: string | null = null;
  expensesError: string | null = null;

  showCreateGroup = false;
  showCreateExpense = false;
  showAddMembers = false;
  showExpenseDetail = false;

  memberEmail = '';
  addMemberError: string | null = null;
  pendingMembers: UserListResponse[] = [];
selectedExpense: ExpenseDetailResponse | null = null;

  createGroupForm = this.fb.group({
    groupName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
  });

  createExpenseForm = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(255)]],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    payerUserId: [null as number | null, [Validators.required]]
  });

  constructor(
    private groupService: GroupService,
    private expenseService: ExpenseService,
    private userService: UserService,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user?.fullName) this.userName = user.fullName;

    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUsers();
    this.loadGroups();
  }

  loadUsers(excludeGroupId?: number): void {
    this.userService.getUsers(excludeGroupId).subscribe({
      next: (res) => {
        if (res.success && res.data) this.users = res.data;
      }
    });
  }

  loadGroups(): void {
    this.loadingGroups = true;
    this.groupService.getMyGroups().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.groups = res.data;
          this.groupsError = null;
        } else {
          this.groupsError = res.message || 'Unable to load groups.';
        }
        this.loadingGroups = false;
      },
      error: () => {
        this.groupsError = 'Unable to load groups.';
        this.loadingGroups = false;
      }
    });
  }

  selectGroup(group: GroupListResponse): void {
    this.selectedGroup = group;
    this.loadUsers(group.groupId);
    this.loadGroupMembers();
    this.loadExpenses(group.groupId);
  }

  loadGroupMembers(): void {
    if (!this.selectedGroup) return;
    this.loadingMembers = true;

    this.groupService.getGroupMemberSummary(this.selectedGroup.groupId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.memberTotals = res.data;
          this.setDefaultPayer();
        } else {
          this.memberTotals = [];
        }
        this.loadingMembers = false;
      },
      error: () => {
        this.memberTotals = [];
        this.loadingMembers = false;
      }
    });
  }

  loadExpenses(groupId: number): void {
    this.loadingExpenses = true;
    this.expensesError = null;
    this.expenses = [];
    this.expenseDetails.clear();

    this.expenseService.getGroupExpenses(groupId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.expenses = res.data;
          this.computeTotalsWithSplits();
        } else {
          this.expenses = [];
          this.expensesError = res.message || 'Unable to load expenses.';
          this.loadingExpenses = false;
        }
      },
      error: () => {
        this.expenses = [];
        this.expensesError = 'Unable to load expenses.';
        this.loadingExpenses = false;
      }
    });
  }

  computeTotalsWithSplits(): void {
    if (!this.expenses.length) {
      this.loadingExpenses = false;
      return;
    }

    const detailCalls = this.expenses.map((expense) =>
      this.expenseService.getExpenseDetail(expense.expenseId)
    );

    forkJoin(detailCalls).subscribe({
      next: (results) => {
        this.expenseDetails.clear();
        results.forEach((res) => {
          if (res.success && res.data) {
            this.expenseDetails.set(res.data.expenseId, res.data);
          }
        });
        this.loadingExpenses = false;
      },
      error: () => {
        this.loadingExpenses = false;
      }
    });
  }

  private setDefaultPayer(): void {
    const currentUser = this.auth.getUser();
    if (!currentUser) return;
    const isMember = this.memberTotals.some((m) => m.userId === currentUser.userId);
    if (isMember) {
      this.createExpenseForm.patchValue({ payerUserId: currentUser.userId });
    }
  }

  openCreateGroup(): void {
    this.createGroupForm.reset();
    this.showCreateGroup = true;
  }

  closeCreateGroup(): void {
    this.showCreateGroup = false;
  }

  submitCreateGroup(): void {
    if (this.createGroupForm.invalid) {
      this.createGroupForm.markAllAsTouched();
      this.toast.error('Please enter a valid group name.');
      return;
    }

    const groupName = this.createGroupForm.value.groupName ?? '';
    this.groupService.createGroup({ groupName }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success('Group created.');
          this.showCreateGroup = false;
          this.loadGroups();
        } else {
          this.toast.error(res.message || 'Unable to create group.');
        }
      },
      error: (err) => {
        const message = err?.error?.message || 'Unable to create group.';
        this.toast.error(message);
      }
    });
  }

  createGroupError(): string | null {
    const control = this.createGroupForm.get('groupName');
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Please enter group name.';
    if (control.errors['minlength']) return 'Group name is too short.';
    if (control.errors['maxlength']) return 'Group name is too long.';
    return 'Invalid group name.';
  }

  openCreateExpense(): void {
    if (!this.selectedGroup) return;
    this.createExpenseForm.reset();
    this.setDefaultPayer();
    this.showCreateExpense = true;
  }

  closeCreateExpense(): void {
    this.showCreateExpense = false;
  }

  submitCreateExpense(): void {
    if (!this.selectedGroup) return;
    if (this.createExpenseForm.invalid) {
      this.createExpenseForm.markAllAsTouched();
      this.toast.error('Please fill all required expense fields correctly.');
      return;
    }

    const payload = {
      groupId: this.selectedGroup.groupId,
      payerUserId: Number(this.createExpenseForm.value.payerUserId ?? 0),
      description: this.createExpenseForm.value.description ?? '',
      amount: Number(this.createExpenseForm.value.amount ?? 0)
    };

    this.expenseService.createExpense(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success('Expense added.');
          this.showCreateExpense = false;
          this.loadExpenses(this.selectedGroup!.groupId);
          this.loadGroupMembers();
        } else {
          this.toast.error(res.message || 'Unable to add expense.');
        }
      },
      error: (err) => {
        const message = err?.error?.message || 'Unable to add expense.';
        this.toast.error(message);
      }
      });
  }

  createExpenseError(name: 'description' | 'amount' | 'payerUserId'): string | null {
    const control = this.createExpenseForm.get(name);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['maxlength']) return 'Too long.';
    if (control.errors['min']) return 'Amount must be greater than 0.';
    return 'Invalid value.';
  }

    openAddMembers(): void {
    if (!this.selectedGroup) return;
    this.memberEmail = '';
    this.addMemberError = null;
    this.pendingMembers = [];
    this.loadUsers();
    this.showAddMembers = true;
  }

  closeAddMembers(): void {
    this.showAddMembers = false;
    this.addMemberError = null;
  }

    addMemberToList(): void {
    if (!this.selectedGroup) return;

    const email = (this.memberEmail || '').trim().toLowerCase();
    if (!email) {
      this.addMemberError = 'Enter an email address.';
      return;
    }

    const user = this.users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      this.addMemberError = 'User not found.';
      return;
    }

    const alreadyLocal = this.memberTotals.some((m) => m.userId === user.userId);
    if (alreadyLocal) {
      this.addMemberError = 'User is already a member.';
      return;
    }

    const alreadyPending = this.pendingMembers.some((m) => m.userId === user.userId);
    if (alreadyPending) {
      this.addMemberError = 'User already added below.';
      return;
    }

    this.pendingMembers.push(user);
    this.memberEmail = '';
    this.addMemberError = null;
  }

  removePendingMember(userId: number): void {
    this.pendingMembers = this.pendingMembers.filter((u) => u.userId !== userId);
  }

  submitAddMembers(): void {
    if (!this.selectedGroup) return;

    const ids = this.pendingMembers.map((u) => u.userId);
    if (ids.length === 0) {
      this.addMemberError = 'Add at least one member.';
      return;
    }

    this.groupService.addMembers(this.selectedGroup.groupId, ids).subscribe({
      next: (res: any) => {
        const already = res?.data?.alreadyMembers ?? res?.data?.AlreadyMembers;
        if (Array.isArray(already) && already.length) {
          this.addMemberError = 'Some users were already members.';
        }
        if (res.success) {
          this.toast.success('Members added.');
          this.showAddMembers = false;
          this.loadGroupMembers();
          this.loadUsers();
        } else {
          this.toast.error(res.message || 'Unable to add members.');
        }
      },
      error: (err) => {
        const message = err?.error?.message || 'Unable to add members.';
        this.toast.error(message);
      }
    });
  }

  openExpenseDetail(expenseId: number): void {
    const detail = this.expenseDetails.get(expenseId);
    if (!detail) return;
    this.selectedExpense = detail;
    this.showExpenseDetail = true;
  }

  closeExpenseDetail(): void {
    this.showExpenseDetail = false;
    this.selectedExpense = null;
  }

  expenseMemberName(userId: number): string {
    const member = this.memberTotals.find((m) => m.userId === userId);
    return member?.fullName ?? `User ${userId}`;
  }

  logout(): void {
    this.auth.clearSession();
    this.router.navigate(['/login']);
  }

  formatMoney(value: number | undefined): string {
    if (value === undefined || value === null) return '₹0.00';
    return `₹${value.toFixed(2)}`;
  }

  userNameById(userId: number): string {
    const user = this.users.find((u) => u.userId === userId) ||
      this.memberTotals.find((m) => m.userId === userId);
    return user?.fullName ?? `User ${userId}`;
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
}
