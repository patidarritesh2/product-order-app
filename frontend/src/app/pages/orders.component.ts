import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { errMsg } from '../core/error.util';
import { Order } from '../core/models';
import { OrderService } from '../core/order.service';
import { ProductService } from '../core/product.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <h1>Orders</h1>

    <div class="card">
      <h2>{{ editingId() ? 'Edit order #' + editingId() : 'New order' }}</h2>
      @if (products().length === 0) {
        <p class="muted">Create some products first.</p>
      } @else {
        @for (p of products(); track p.id) {
          <label class="check">
            <input type="checkbox" [checked]="selected().includes(p.id)"
                   (change)="toggle(p.id, $any($event.target).checked)" />
            {{ p.name }} <span class="muted">({{ p.price | currency: 'INR' }})</span>
          </label>
        }
        <p><strong>Estimated total: {{ preview() | currency: 'INR' }}</strong></p>
        @if (error()) { <p class="error">{{ error() }}</p> }
        <div class="actions">
          <button (click)="submit()" [disabled]="selected().length === 0">
            {{ editingId() ? 'Update order' : 'Place order' }}
          </button>
          @if (editingId()) { <button class="secondary" (click)="reset()">Cancel</button> }
        </div>
      }
    </div>

    <div class="card">
      @if (orderSvc.orders().length === 0) {
        <p class="muted">No orders yet.</p>
      } @else {
        <table>
          <thead><tr><th>#</th><th>Products</th><th>Total</th><th></th></tr></thead>
          <tbody>
            @for (o of orderSvc.orders(); track o.orderId) {
              <tr>
                <td>{{ o.orderId }}</td>
                <td>{{ names(o) }}</td>
                <td>{{ o.totalAmount | currency: 'INR' }}</td>
                <td>
                  <div class="actions" style="margin:0">
                    <button class="secondary" (click)="edit(o)">Edit</button>
                    <button class="danger" (click)="remove(o)">Delete</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  orderSvc = inject(OrderService);
  private productSvc = inject(ProductService);

  products = this.productSvc.products;
  selected = signal<string[]>([]);
  editingId = signal<number | null>(null);
  error = signal('');

  preview = computed(() => {
    const prices = new Map(this.products().map((p) => [p.id, p.price]));
    return this.selected().reduce((sum, id) => sum + (prices.get(id) ?? 0), 0);
  });

  ngOnInit() {
    const onError = (e: unknown) => this.error.set(errMsg(e));
    this.productSvc.load().subscribe({ error: onError });
    this.orderSvc.load().subscribe({ error: onError });
  }

  toggle(id: string, checked: boolean) {
    this.selected.update((list) => (checked ? [...list, id] : list.filter((x) => x !== id)));
  }

  names(o: Order) {
    const byId = new Map(this.products().map((p) => [p.id, p.name]));
    return o.productIds.map((id) => byId.get(id) ?? '(deleted product)').join(', ');
  }

  submit() {
    const id = this.editingId();
    const request = id ? this.orderSvc.update(id, this.selected()) : this.orderSvc.create(this.selected());
    request.subscribe({
      next: () => this.reset(),
      error: (e) => this.error.set(errMsg(e)),
    });
  }

  edit(o: Order) {
    this.editingId.set(o.orderId);
    this.selected.set([...o.productIds]);
  }

  reset() {
    this.editingId.set(null);
    this.selected.set([]);
    this.error.set('');
  }

  remove(o: Order) {
    if (!confirm(`Delete order #${o.orderId}?`)) return;
    this.orderSvc.remove(o.orderId).subscribe({ error: (e) => this.error.set(errMsg(e)) });
  }
}
