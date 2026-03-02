import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastItem[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  success(message: string, durationMs = 2500): void {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = 3000): void {
    this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs = 2500): void {
    this.show(message, 'info', durationMs);
  }

  remove(id: number): void {
    const next = this.toastsSubject.value.filter((t) => t.id !== id);
    this.toastsSubject.next(next);
  }

  private show(message: string, type: ToastType, durationMs: number): void {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const next = [...this.toastsSubject.value, { id, message, type }];
    this.toastsSubject.next(next);

    setTimeout(() => this.remove(id), durationMs);
  }
}
