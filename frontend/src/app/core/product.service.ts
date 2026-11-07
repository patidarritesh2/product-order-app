import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { Product, ProductInput } from './models';

/** Holds product state in a signal; components read `products()` and call the methods below. */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private readonly url = '/api/products';

  private _products = signal<Product[]>([]);
  readonly products = this._products.asReadonly();

  load() {
    return this.http.get<Product[]>(this.url).pipe(tap((list) => this._products.set(list)));
  }

  create(input: ProductInput) {
    return this.http
      .post<Product>(this.url, input)
      .pipe(tap((p) => this._products.update((list) => [p, ...list])));
  }

  update(id: string, input: ProductInput) {
    return this.http
      .put<Product>(`${this.url}/${id}`, input)
      .pipe(tap((p) => this._products.update((list) => list.map((x) => (x.id === id ? p : x)))));
  }

  remove(id: string) {
    return this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(tap(() => this._products.update((list) => list.filter((x) => x.id !== id))));
  }
}
