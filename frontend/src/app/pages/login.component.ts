import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { errMsg } from '../core/error.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="card narrow">
      <h2>Login</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label for="u">Username</label>
        <input id="u" formControlName="username" autocomplete="username" />
        <label for="p">Password</label>
        <input id="p" type="password" formControlName="password" autocomplete="current-password" />
        @if (error()) { <p class="error">{{ error() }}</p> }
        <div class="actions">
          <button type="submit" [disabled]="form.invalid || loading()">Login</button>
          <a routerLink="/register" class="muted">Create an account</a>
        </div>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  error = signal('');
  loading = signal(false);

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => { this.error.set(errMsg(e)); this.loading.set(false); },
    });
  }
}
