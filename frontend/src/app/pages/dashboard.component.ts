import { Component, OnInit, inject, signal } from '@angular/core';
import { errMsg } from '../core/error.util';
import { Weather } from '../core/models';
import { OrderService } from '../core/order.service';
import { ProductService } from '../core/product.service';
import { WeatherService } from '../core/weather.service';

interface City { name: string; lat: number; lon: number }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <h1>Dashboard</h1>
    <div class="grid">
      <div class="card"><div class="muted">Products</div><div class="big">{{ products.products().length }}</div></div>
      <div class="card"><div class="muted">Your orders</div><div class="big">{{ orders.orders().length }}</div></div>
    </div>

    <div class="card">
      <h2>Weather</h2>
      <label for="city">City</label>
      <select id="city" (change)="onCity($any($event.target).value)">
        @for (c of cities; track c.name; let i = $index) {
          <option [value]="i">{{ c.name }}</option>
        }
      </select>

      @if (loading()) {
        <p class="muted">Loading…</p>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
        <button class="secondary" (click)="loadWeather()">Retry</button>
      } @else {@if (weather(); as w) {
        <p class="big">{{ w.temperature }}°C</p>
        <p>{{ w.description }} · Humidity {{ w.humidity }}% · Wind {{ w.windSpeed }} km/h</p>
        <p class="muted">Updated {{ w.time }}</p>
}}
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  products = inject(ProductService);
  orders = inject(OrderService);
  private weatherSvc = inject(WeatherService);

  cities: City[] = [
    { name: 'Pune', lat: 18.5204, lon: 73.8567 },
    { name: 'Indore', lat: 22.7196, lon: 75.8577 },
    { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
    { name: 'Delhi', lat: 28.6139, lon: 77.209 },
  ];
  city = signal<City>(this.cities[0]);
  weather = signal<Weather | null>(null);
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.products.load().subscribe({ error: () => undefined });
    this.orders.load().subscribe({ error: () => undefined });
    this.loadWeather();
  }

  onCity(index: string) {
    this.city.set(this.cities[Number(index)]);
    this.loadWeather();
  }

  loadWeather() {
    const { lat, lon } = this.city();
    this.loading.set(true);
    this.error.set('');
    this.weatherSvc.current(lat, lon).subscribe({
      next: (w) => { this.weather.set(w); this.loading.set(false); },
      error: (e) => { this.error.set(errMsg(e)); this.loading.set(false); },
    });
  }
}
