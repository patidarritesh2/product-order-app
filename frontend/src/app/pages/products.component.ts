import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { errMsg } from '../core/error.util';
import { Product } from '../core/models';
import { ProductService } from '../core/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    <h1>Products</h1>

    <div class="card">
      <h2>{{ editingId() ? 'Edit product' : 'Add product' }}</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label for="name">Name</label>
        <input id="name" formControlName="name" />
        <label for="price">Price</label>
        <input id="price" type="number" step="0.01" min="0" formControlName="price" />
        <label for="desc">Description</label>
        <textarea id="desc" rows="3" formControlName="description"></textarea>
        @if (error()) { <p class="error">{{ error() }}</p> }
        <div class="actions">
          <button type="submit" [disabled]="form.invalid">{{ editingId() ? 'Update' : 'Add' }}</button>
          @if (editingId()) { <button type="button" class="secondary" (click)="reset()">Cancel</button> }
        </div>
      </form>
    </div>

    <div class="card">
      @if (svc.products().length === 0) {
        <p class="muted">No products yet.</p>
      } @else {
        <table>
          <thead><tr><th>Name</th><th>Price</th><th>Description</th><th></th></tr></thead>
          <tbody>
            @for (p of svc.products(); track p.id) {
              <tr>
                <td>{{ p.name }}</td>
                <td>{{ p.price | currency: 'INR' }}</td>
                <td>{{ p.description }}</td>
                <td>
                  <div class="actions" style="margin:0">
                    <button class="secondary" (click)="edit(p)">Edit</button>
                    <button class="danger" (click)="remove(p)">Delete</button>
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
export class ProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  svc = inject(ProductService);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
  });
  editingId = signal<string | null>(null);
  error = signal('');

  ngOnInit() {
    this.svc.load().subscribe({ error: (e) => this.error.set(errMsg(e)) });
  }

  submit() {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const id = this.editingId();
    const request = id ? this.svc.update(id, value) : this.svc.create(value);
    request.subscribe({
      next: () => this.reset(),
      error: (e) => this.error.set(errMsg(e)),
    });
  }

  edit(p: Product) {
    this.editingId.set(p.id);
    this.form.setValue({ name: p.name, price: p.price, description: p.description });
  }

  reset() {
    this.editingId.set(null);
    this.error.set('');
    this.form.reset({ name: '', price: 0, description: '' });
  }

  remove(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    this.svc.remove(p.id).subscribe({ error: (e) => this.error.set(errMsg(e)) });
  }
}
