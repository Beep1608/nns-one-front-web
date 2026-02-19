import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { ProductModel } from '../models/product.model';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ProductDto } from '../dtos/product.dto';
import { ProductMapper } from '../mappers/product.mapper';
import { CreateProductDto } from '../dtos/create-product.dto';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/products`;

  getAll(): Observable<ProductModel[]> {
    return this.http.get<ProductDto[]>(this.baseUrl).pipe(
      map((dtos) => dtos.map(ProductMapper.fromDto)),
      catchError(this.handleError),
    );
  }

  create(dto: CreateProductDto): Observable<ProductModel> {
    return this.http.post<ProductDto>(this.baseUrl, dto).pipe(
      map(ProductMapper.fromDto),
      catchError(this.handleError),
    );
  }

  updateStock(id: number, quantity: number): Observable<ProductModel | null> {
    return this.http
      .patch<ProductDto | null>(`${this.baseUrl}/${id}/stock`, null, {
        params: { quantity },
      })
      .pipe(
        map((dto) => (dto ? ProductMapper.fromDto(dto) : null)),
        catchError(this.handleError),
      );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError),
    );
  }

  private handleError(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      console.error(`Error en la llamada a: ${error.url ?? 'URL desconocida'}`, error);
      return throwError(() => new Error(error.error?.message || 'No se pudo completar la operación.'));
    }

    console.error('Error inesperado en ProductService', error);
    return throwError(() => new Error('No se pudo completar la operación.'));
  }
}
