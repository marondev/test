import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';

// SERVICES
import { AuthService } from '@services/auth/auth.service';
import { TextService } from '@services/helper/text.service';

// INTERFACE
import { APIParams } from '@core/interface/api-params';
import { APIResponse } from '@core/interface/api-response';

// ENV
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  apiBaseUrl: string = environment.apiBaseUrl;
  url: string;
  token = null;
  httpOptions = {
    headers: new HttpHeaders({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private helper: TextService
  ) {
    this.token = sessionStorage.getItem('token');
  }

  get(
    segment: string,
    params: APIParams,
    all: boolean = false,
    server: string = ''
  ): Observable<APIResponse> {
    const serialized = this.helper.serialize(params);

    this.url =
      this.apiBaseUrl + segment + '?' + serialized + '&token=' + this.token;

    if (all) {
      if (server) {
        const syncServerUrl = 'http://' + server + ':7777/sync/';
        this.url =
          syncServerUrl + segment + '?' + serialized + '&token=' + this.token;
      } else {
        this.url =
          this.apiBaseUrl +
          segment +
          '/all?' +
          serialized +
          '&token=' +
          this.token;
      }
    }

    // this.url = this.apiBaseUrl + segment + (all ? "/all?" : "?") + serialized + "&token=" + this.token;
    return this.http.get(this.url).pipe(
      map((res: APIResponse) => {
        this.authService.isStillLogged(res);
        return res;
      }),
      catchError(this.handleError)
    );
  }

  show(segment: string, id: any, server: string = ''): Observable<APIResponse> {
    const url = server ? `http://${server}:7777/` : this.apiBaseUrl;
    const requestTimeout = server ? 1000 : 3000;

    this.url = `${url}${segment}/${id}?&token=${this.token}`;
    return this.http.get(this.url).pipe(
      map((res: APIResponse) => {
        this.authService.isStillLogged(res);
        return res;
      }),
      timeout(requestTimeout),
      catchError(this.handleError)
    );
  }

  store(segment: string, body: object): Observable<APIResponse> {
    this.url = `${this.apiBaseUrl}${segment}?&token=${this.token}`;
    return this.http.post(this.url, body).pipe(
      map((res: APIResponse) => {
        this.authService.isStillLogged(res);
        return res;
      }),
      catchError(this.handleError)
    );
  }

  destroy(segment: string, id: any, parentId = 0): Observable<APIResponse> {

    this.url = `${this.apiBaseUrl}${segment}/${id}?&token=${this.token}`;

    if (segment === 'session_files') {
      this.url = `${this.apiBaseUrl}sessions/${parentId}/file/${id}?&token=${this.token}`;
    }

    return this.http.delete(this.url).pipe(
      map((res: APIResponse) => {
        this.authService.isStillLogged(res);
        return res;
      }),
      catchError(this.handleError)
    );
  }

  update(segment: string, id: any, body: object): Observable<APIResponse> {
    this.url = `${this.apiBaseUrl}${segment}/${id}?&token=${this.token}`;
    return this.http.put(this.url, body).pipe(
      map((res: APIResponse) => {
        this.authService.isStillLogged(res);
        return res;
      }),
      catchError(this.handleError)
    );
  }

  sync(segment: string, params: any = {}): Observable<APIResponse> {
    this.url =
      this.apiBaseUrl +
      segment +
      '/' +
      (params.id || 0) +
      '?' +
      '&token=' +
      sessionStorage.getItem('token');
    return this.http
      .post(this.url, JSON.stringify(params), this.httpOptions)
      .pipe(
        map((res: APIResponse) => {
          const x = res;
          this.authService.isStillLogged(x);
          return x;
        })
      );
  }

  upload(file: any): Observable<APIResponse> {
    this.url =
      environment.uploadUrl + '?token=' + sessionStorage.getItem('token');

    const byteArray = new Uint8Array(file.file.data);
    const blob = new Blob([byteArray], { type: file.type });

    const form = new FormData();
    form.append('file', blob, file.filename);

    return this.http.post(this.url, form).pipe(
      map((res: APIResponse) => {
        const x = res;
        this.authService.isStillLogged(x);
        return x;
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }
}
