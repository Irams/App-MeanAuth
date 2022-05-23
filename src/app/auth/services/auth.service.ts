import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { catchError, map, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

import { AuthResponse, Usuario } from "../interfaces/authInterface";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = environment.baseUrl
  private _usuario!: Usuario;

  get usuario(){
    return { ...this._usuario };
  }

  constructor( private http: HttpClient ) { }

  registro( name:string, email:string, password:string ){

    const url = `${ this.baseUrl }/auth/new`;
    const body = { name, email, password };

    return this.http.post<AuthResponse>( url, body )
    .pipe(
      tap( ({ok, token}) =>{
        if( ok ){
          localStorage.setItem('token', token!);
        }
      } ),
      map( resp => resp.ok ),
      catchError( err => of(err.error.msg) )
    );    

  }

  login( email: string, password:string ){
    
    const url = `${ this.baseUrl }/auth`;
    const body = { email, password };

    return this.http.post<AuthResponse>( url, body )
    .pipe(
      tap( resp =>{
        if( resp.ok ){
          localStorage.setItem('token', resp.token!);
        }
      } ),
      map( resp => resp.ok ),
      catchError( err => of(err.error.msg) )
    );
  }

  validarToken(): Observable<boolean>{
    const url = `${ this.baseUrl }/auth/renew`;
    const headers = new HttpHeaders()
          .set('x-token', localStorage.getItem('token') || '');

    // return this.http.get(url,{ headers: headers});
    return this.http.get<AuthResponse>(url,{ headers })
        .pipe(
          map( resp=>{
            localStorage.setItem('token', resp.token!);
            this._usuario = {
            email: resp.email!,
            name:resp.name!,
            uid: resp.uid!
          }
            return resp.ok;
          }),
          catchError(err => of(false))
        );
  }

  logout(){
    localStorage.removeItem('token');
  }

}
