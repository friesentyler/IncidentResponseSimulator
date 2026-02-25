import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

interface TokenResponse {
    access: string;
    refresh: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private readonly ACCESS_TOKEN = 'access_token';
    private readonly REFRESH_TOKEN = 'refresh_token';

    private loginStatus = new BehaviorSubject<boolean>(this.isLoggedIn());
    loginStatus$ = this.loginStatus.asObservable();

    login(credentials: any): Observable<TokenResponse> {
        return this.http.post<TokenResponse>(`${environment.apiUrl}token/`, credentials).pipe(
            tap(response => {
                this.setTokens(response);
                this.loginStatus.next(true);
            }),
            catchError(err => {
                return throwError(() => err);
            })
        );
    }

    refreshToken(): Observable<TokenResponse> {
        const refresh = localStorage.getItem(this.REFRESH_TOKEN);
        if (!refresh) {
            return throwError(() => new Error('No refresh token available'));
        }

        return this.http.post<TokenResponse>(`${environment.apiUrl}token/refresh/`, { refresh }).pipe(
            tap(response => {
                // SimpleJWT refresh endpoint usually only returns a new 'access' token, 
                // but some configurations might return both.
                this.setAccessToken(response.access);
                if (response.refresh) {
                    this.setRefreshToken(response.refresh);
                }
            }),
            catchError(err => {
                this.logout();
                return throwError(() => err);
            })
        );
    }

    logout(): void {
        localStorage.removeItem(this.ACCESS_TOKEN);
        localStorage.removeItem(this.REFRESH_TOKEN);
        this.loginStatus.next(false);
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN);
    }

    private setTokens(tokens: TokenResponse): void {
        localStorage.setItem(this.ACCESS_TOKEN, tokens.access);
        localStorage.setItem(this.REFRESH_TOKEN, tokens.refresh);
    }

    private setAccessToken(token: string): void {
        localStorage.setItem(this.ACCESS_TOKEN, token);
    }

    private setRefreshToken(token: string): void {
        localStorage.setItem(this.REFRESH_TOKEN, token);
    }

    isLoggedIn(): boolean {
        return !!this.getAccessToken();
    }
}
