import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { Order } from './models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private readonly url = '/api/orders';

  private _orders = signal<Order[]>([]);
  readonly orders = this._orders.asReadonly();

  load() {
    return this.http.get<Order[]>(this.url).pipe(tap((list) => this._orders.set(list)));
  }

  create(productIds: string[]) {
    return this.http
      .post<Order>(this.url, { productIds })
      .pipe(tap((o) => this._orders.update((list) => [o, ...list])));
  }

  update(orderId: number, productIds: string[]) {
    return this.http
      .put<Order>(`${this.url}/${orderId}`, { productIds })
      .pipe(tap((o) => this._orders.update((list) => list.map((x) => (x.orderId === orderId ? o : x)))));
  }

  remove(orderId: number) {
    return this.http
      .delete<void>(`${this.url}/${orderId}`)
      .pipe(tap(() => this._orders.update((list) => list.filter((x) => x.orderId !== orderId))));
  }
}
