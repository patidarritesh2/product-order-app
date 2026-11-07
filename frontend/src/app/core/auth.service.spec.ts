import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('stores token and user after login', () => {
    service.login('ritesh', 'secret123').subscribe();
    const req = http.expectOne('/api/auth/login');
    expect(req.request.body).toEqual({ username: 'ritesh', password: 'secret123' });
    req.flush({ token: 'abc', user: { id: 1, username: 'ritesh' } });

    expect(service.token).toBe('abc');
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.user()?.username).toBe('ritesh');
  });

  it('clears state on logout', () => {
    service.login('ritesh', 'secret123').subscribe();
    http.expectOne('/api/auth/login').flush({ token: 'abc', user: { id: 1, username: 'ritesh' } });

    service.logout();
    expect(service.token).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });
});
