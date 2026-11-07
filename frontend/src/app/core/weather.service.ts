import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Weather } from './models';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http = inject(HttpClient);

  current(lat: number, lon: number) {
    const params = new HttpParams().set('lat', lat).set('lon', lon);
    return this.http.get<Weather>('/api/weather', { params });
  }
}
