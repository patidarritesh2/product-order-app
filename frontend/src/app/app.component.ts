import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (auth.isLoggedIn()) {
      <nav class="nav">
        <strong>Product &amp; Order Manager</strong>
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/products" routerLinkActive="active">Products</a>
        <a routerLink="/orders" routerLinkActive="active">Orders</a>
        <span class="spacer"></span>
        <span class="muted">{{ auth.user()?.username }}</span>
        <button class="secondary" (click)="auth.logout()">Logout</button>
      </nav>
    }
    <main><router-outlet /></main>
  `,
  styles: [`
    .nav { display: flex; align-items: center; gap: 16px; padding: 12px 24px; background: #fff; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
    .nav a { color: var(--text); text-decoration: none; padding: 4px 8px; border-radius: 6px; }
    .nav a.active { background: #dbeafe; color: var(--primary); }
    .spacer { flex: 1; }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
}
