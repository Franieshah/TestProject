import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  isSubmitting = false;
  showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required]]
  });

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Enter your email and password.');
      return;
    }

    this.isSubmitting = true;
    this.auth
      .login({
        email: this.form.value.email ?? '',
        password: this.form.value.password ?? ''
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.auth.storeSession(res.data);
            this.toast.success('Welcome back!');
            this.router.navigate(['/dashboard']);
          } else {
            this.toast.error(res.message || 'Login failed.');
          }
        },
        error: (err) => {
          const message = err?.error?.message || err?.error?.errors?.[0] || 'Invalid email or password.';
          this.toast.error(message);
        }
      });
  }

  fieldError(name: 'email' | 'password'): string | null {
    const control = this.form.get(name);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['email']) return 'Enter a valid email.';
    return 'Invalid value.';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
