import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../environments/environment.development";
import { ProductModel } from "../models/product.model";
import { catchError, map, Observable, throwError } from "rxjs";
import { ProductDto } from "../dtos/product.dto";
import { ProductMapper } from "../mappers/product.mapper";


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
  private handleError(error: HttpErrorResponse) {
    console.log(`Error en la llamada a: ${error.url}`);
    return throwError(() => new Error('No se pudo cargar la información.'));
  }
}
