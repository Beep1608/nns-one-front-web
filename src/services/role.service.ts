import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { catchError, forkJoin, map, Observable, of, switchMap, throwError } from "rxjs";
import { RoleModel } from "../models/role.model";
import { RoleDto } from "../dtos/role.dto";

interface RoleHalRespose {
  _embedded: { roles: RoleDto[] };
  page: { number: number; size: number; totalElements: number; totalPages: number };
}

type RolesResponse = RoleHalRespose | RoleDto[];

const ROLES_PAGE_SIZE = 5;

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/roles`;
  private readonly formHeaders = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
  });

  getAll(): Observable<RoleModel[]> {
    return this.getRolePage(0).pipe(
      switchMap((firstResponse) => {
        const firstPageRoles = this.extractRoles(firstResponse);
        const totalPages = this.extractTotalPages(firstResponse);

        if (totalPages <= 1) {
          return of(firstPageRoles);
        }

        const pageRequests = Array.from({ length: totalPages - 1 }, (_, index) => {
          return this.getRolePage(index + 1).pipe(map((response) => this.extractRoles(response)));
        });

        return forkJoin(pageRequests).pipe(map((pages) => [...firstPageRoles, ...pages.flat()]));
      }),
      // Assuming RoleDto matches RoleModel structure or mapping is trivial for now. 
      // If RoleModel has extra fields or different structure, a mapper might be needed.
      // Based on previous view_file, RoleDto has id and name, RoleModel has name.
      map((roles) => roles.map(role => ({ id: role.id, name: role.name }))),
      catchError(this.handleError),
    );
  }

  private getRolePage(page: number): Observable<RolesResponse> {
    return this.http.get<RolesResponse>(this.baseUrl, {
      params: {
        page,
        size: ROLES_PAGE_SIZE
      }
    });
  }

  private extractRoles(response: RolesResponse): RoleDto[] {
    if (Array.isArray(response)) {
      return response;
    }
    return Array.isArray(response._embedded.roles) ? response._embedded.roles : [];
  }

  private extractTotalPages(response: RolesResponse): number {
    if (Array.isArray(response)) {
      return 1;
    }
    return Math.max(1, response.page?.totalPages ?? 1);
  }

  private handleError(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      console.error(`Error en la llamada a: ${error.url ?? 'URL desconocida'}`, error);
      return throwError(() => new Error(error.error?.message || 'No se pudo cargar la información.'));
    }

    console.error('Error inesperado en RoleService', error);
    return throwError(() => new Error('No se pudo cargar la información.'));
  }
}
