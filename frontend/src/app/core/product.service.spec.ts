import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product } from './models';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;
  const a: Product = { id: '1', name: 'Pen', price: 10, description: '' };
  const b: Product = { id: '2', name: 'Book', price: 99, description: 'Hardcover' };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  function seed() {
    service.load().subscribe();
    http.expectOne('/api/products').flush([a, b]);
  }

  it('loads products into state', () => {
    seed();
    expect(service.products()).toEqual([a, b]);
  });

  it('prepends a created product', () => {
    seed();
    const created: Product = { id: '3', name: 'Cup', price: 5, description: '' };
    service.create({ name: 'Cup', price: 5, description: '' }).subscribe();
    const req = http.expectOne('/api/products');
    expect(req.request.method).toBe('POST');
    req.flush(created);
    expect(service.products()[0]).toEqual(created);
  });

  it('replaces an updated product', () => {
    seed();
    const updated = { ...a, price: 15 };
    service.update('1', { name: 'Pen', price: 15, description: '' }).subscribe();
    const req = http.expectOne('/api/products/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
    expect(service.products().find((p) => p.id === '1')?.price).toBe(15);
  });

  it('removes a deleted product', () => {
    seed();
    service.remove('1').subscribe();
    const req = http.expectOne('/api/products/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(service.products().map((p) => p.id)).toEqual(['2']);
  });
});
