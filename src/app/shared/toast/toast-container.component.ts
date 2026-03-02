import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastItem } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  readonly toasts$ = this.toastService.toasts$;

  trackById(_: number, item: ToastItem): number {
    return item.id;
  }

  dismiss(id: number): void {
    this.toastService.remove(id);
  }
}
