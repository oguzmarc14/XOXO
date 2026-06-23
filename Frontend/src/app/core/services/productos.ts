import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  Producto,
  ProductoPayload
} from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private readonly baseUrl =
    'http://localhost:3000/productos';

  constructor(
    private http: HttpClient
  ) {}

  /*
    Administrador:
    getAll()

    Gerente o cajero:
    getAll(tiendaId)
  */
  getAll(
    tiendaId?: string
  ): Observable<Producto[]> {
    let params =
      new HttpParams();

    if (tiendaId) {
      params = params.set(
        'tiendaId',
        tiendaId
      );
    }

    return this.http.get<Producto[]>(
      this.baseUrl,
      {
        params
      }
    );
  }

  getById(
    id: string
  ): Observable<Producto> {
    return this.http.get<Producto>(
      `${this.baseUrl}/${id}`
    );
  }

  create(
    data: ProductoPayload
  ): Observable<Producto> {
    return this.http.post<Producto>(
      this.baseUrl,
      data
    );
  }

  update(
    id: string,
    data: ProductoPayload
  ): Observable<Producto> {
    return this.http.put<Producto>(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  delete(
    id: string
  ): Observable<{
    message: string;
  }> {
    return this.http.delete<{
      message: string;
    }>(
      `${this.baseUrl}/${id}`
    );
  }
}
