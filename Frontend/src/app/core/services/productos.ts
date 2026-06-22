import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly baseUrl = 'http://localhost:3000/productos';

  constructor(private http: HttpClient) {}

  getAll(tiendaId?: string): Observable<Producto[]> {
    const params = tiendaId
      ? new HttpParams().set('tiendaId', tiendaId)
      : undefined;
    return this.http.get<Producto[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  create(data: Omit<Producto, '_id'>): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, data);
  }

  update(id: string, data: Omit<Producto, '_id'>): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
