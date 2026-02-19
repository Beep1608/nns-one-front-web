import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserDto } from '../dtos/user.dto';
import { environment } from '../environments/environment';
import { UserMapper } from '../mappers/user.mapper';
import { UserModel } from '../models/user.model';

interface UsersHalResponse {
  _embedded: { users: UserDto[] };
  page: { number: number; size: number; totalElements: number; totalPages: number };
}

type UsersResponse = UsersHalResponse | UserDto[];

const USERS_PAGE_SIZE = 100;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;
  private readonly formHeaders = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
  });

  getAll(): Observable<UserModel[]> {
    return this.getUsersPage(0).pipe(
      switchMap((firstResponse) => {
        const firstPageUsers = this.extractUsers(firstResponse);
        const totalPages = this.extractTotalPages(firstResponse);

        if (totalPages <= 1) {
          return of(firstPageUsers);
        }

        const pageRequests = Array.from({ length: totalPages - 1 }, (_, index) => {
          return this.getUsersPage(index + 1).pipe(map((response) => this.extractUsers(response)));
        });

        return forkJoin(pageRequests).pipe(map((pages) => [...firstPageUsers, ...pages.flat()]));
      }),
      map((users) => users.map(UserMapper.fromDto)),
      catchError(this.handleError),
    );
  }

  getById(id: number): Observable<UserModel> {
    return this.http.get<UserDto>(`${this.baseUrl}/${id}`).pipe(
      map(UserMapper.fromDto),
      catchError(this.handleError),
    );
  }

  create(dto: CreateUserDto): Observable<UserModel> {
    const body = this.toFormBody(dto);
    return this.http.post<UserDto>(this.baseUrl, body, { headers: this.formHeaders }).pipe(
      map(UserMapper.fromDto),
      catchError(this.handleError),
    );
  }

  update(id: number, dto: UpdateUserDto): Observable<UserModel> {
    const body = this.toFormBody(dto);
    return this.http.put<UserDto>(`${this.baseUrl}/${id}`, body, { headers: this.formHeaders }).pipe(
      map(UserMapper.fromDto),
      catchError(this.handleError),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  private getUsersPage(page: number): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(this.baseUrl, {
      params: {
        page,
        size: USERS_PAGE_SIZE,
      },
    });
  }

  private extractUsers(response: UsersResponse): UserDto[] {
    if (Array.isArray(response)) {
      return response;
    }
    return Array.isArray(response._embedded.users) ? response._embedded.users : [];
  }

  private extractTotalPages(response: UsersResponse): number {
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

    console.error('Error inesperado en UserService', error);
    return throwError(() => new Error('No se pudo cargar la información.'));
  }

  private toFormBody(dto: CreateUserDto | UpdateUserDto): string {
    let params = new HttpParams();

    if (dto.username && dto.username.trim().length > 0) {
      params = params.set('username', dto.username.trim());
    }

    if ('password' in dto && dto.password && dto.password.trim().length > 0) {
      params = params.set('password', dto.password.trim());
    }

    for (const role of dto.roles || []) {
      if (role.trim().length > 0) {
        params = params.append('roles', role.trim());
      }
    }

    for (const permission of dto.permissions || []) {
      if (permission.trim().length > 0) {
        params = params.append('permissions', permission.trim());
      }
    }

    return params.toString();
  }
}
