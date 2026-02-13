import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../environments/environment.development";
import { catchError, map, Observable, throwError } from "rxjs";
import { UserModel } from "../models/user.model";
import { UserDto } from "../dtos/user.dto";
import { UserMapper } from "../mappers/user.mapper";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`

  getAll(): Observable<UserModel[]> {
    return this.http
                .get<UserDto[]>(this.baseUrl)
                .pipe(
                  map(dtos => dtos.map(UserMapper.fromDto)),
                  catchError(this.handleError)
                )
  }
  private handleError( error: HttpErrorResponse ){
    console.log(`Error en la llamada a: ${error.url}`)
    return throwError(()=> new Error('No se pudo cargar la información.'))
  }


}
