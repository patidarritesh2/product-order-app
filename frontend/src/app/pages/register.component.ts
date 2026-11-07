import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { errMsg } from '../core/error.util';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="card narrow">
      <h2>Create account</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label for="u">Username</label>
        <input id="u" formControlName="username" autocomplete="username" />
        @if (form.controls.username.touched && form.controls.username.invalid) {
          <p class="error">3–50 characters: letters, numbers, underscore</p>
        }
        <label for="p">Password</label>
        <input id="p" type="password" formControlName="password" autocomplete="new-password" />
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <p class="error">At least 8 characters</p>
        }
        @if (error()) { <p class="error">{{ error() }}</p> }
        <div class="actions">
          <button type="submit" [disabled]="form.invalid || loading()">Register</button>
          <a routerLink="/login" class="muted">I already have an account</a>
        </div>
      </form>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });
  error = signal('');
  loading = signal(false);

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { username, password } = this.form.getRawValue();
    this.auth.register(username, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => { this.error.set(errMsg(e)); this.loading.set(false); },
    });
  }
}
