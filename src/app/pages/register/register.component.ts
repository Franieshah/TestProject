import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);

  isSubmitting = false;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]
    ]
  });

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fix the highlighted errors.');
      return;
    }

    this.isSubmitting = true;
    this.auth
      .register({
        fullName: this.form.value.fullName ?? '',
        email: this.form.value.email ?? '',
        password: this.form.value.password ?? ''
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.success('Registration successful. Please log in.');
            this.router.navigate(['/login']);
          } else {
            this.toast.error(res.message || 'Registration failed.');
          }
        },
        error: (err) => {
          const message = err?.error?.message || err?.error?.errors?.[0] || 'Registration failed.';
          this.toast.error(message);
        }
      });
  }

  fieldError(name: 'fullName' | 'email' | 'password'): string | null {
    const control = this.form.get(name);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['minlength']) return 'Too short.';
    if (control.errors['maxlength']) return 'Too long.';
    if (control.errors['email']) return 'Enter a valid email.';
    if (control.errors['pattern']) {
      return 'Password must include upper, lower, and number.';
    }

    return 'Invalid value.';
  }
}
