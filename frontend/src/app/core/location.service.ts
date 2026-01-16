import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Country {
  id: number;
  name: string;
  iso2: string;
}

export interface City {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly API_URL = 'https://api.countrystatecity.in/v1';
  private readonly API_KEY = '135049ffbca9980c87cebdf557297bd6cd299ef4d2caefd1a6e06a677019db9a';

  private headers = new HttpHeaders({
    'X-CSCAPI-KEY': this.API_KEY
  });

  // Cache for countries and cities
  private countriesCache: Country[] = [];
  private citiesCache: Map<string, City[]> = new Map();

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    if (this.countriesCache.length > 0) {
      return of(this.countriesCache);
    }

    return this.http.get<Country[]>(`${this.API_URL}/countries`, { headers: this.headers }).pipe(
      map(countries => {
        // Add "Remote" as first option
        const remoteOption: Country = { id: 0, name: 'Remote', iso2: 'REMOTE' };
        this.countriesCache = [remoteOption, ...countries];
        return this.countriesCache;
      }),
      catchError(err => {
        console.error('Error fetching countries:', err);
        return of([{ id: 0, name: 'Remote', iso2: 'REMOTE' }]);
      })
    );
  }

  getCities(countryIso2: string): Observable<City[]> {
    if (countryIso2 === 'REMOTE') {
      return of([]);
    }

    if (this.citiesCache.has(countryIso2)) {
      return of(this.citiesCache.get(countryIso2)!);
    }

    return this.http.get<City[]>(`${this.API_URL}/countries/${countryIso2}/cities`, { headers: this.headers }).pipe(
      map(cities => {
        this.citiesCache.set(countryIso2, cities);
        return cities;
      }),
      catchError(err => {
        console.error('Error fetching cities:', err);
        return of([]);
      })
    );
  }

  searchCountries(query: string, countries: Country[]): Country[] {
    if (!query.trim()) {
      return countries.slice(0, 50); // Return first 50 if no query
    }
    const lowerQuery = query.toLowerCase();
    return countries.filter(c => c.name.toLowerCase().includes(lowerQuery)).slice(0, 50);
  }

  searchCities(query: string, cities: City[]): City[] {
    if (!query.trim()) {
      return cities.slice(0, 50);
    }
    const lowerQuery = query.toLowerCase();
    return cities.filter(c => c.name.toLowerCase().includes(lowerQuery)).slice(0, 50);
  }
}
