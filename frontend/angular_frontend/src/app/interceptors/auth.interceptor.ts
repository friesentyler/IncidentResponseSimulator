import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getAccessToken();

    let authReq = req;
    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // If unauthorized and we have a token, it might be expired
            if (error.status === 401 && !req.url.includes('/token/')) {
                return handle401Error(authReq, next, authService, router);
            }
            return throwError(() => error);
        })
    );
};

function handle401Error(
    request: HttpRequest<any>,
    next: HttpHandlerFn,
    authService: AuthService,
    router: Router
): Observable<HttpEvent<any>> {
    return authService.refreshToken().pipe(
        switchMap((response) => {
            // Retry the original request with the new token
            const newAuthReq = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${response.access}`
                }
            });
            return next(newAuthReq);
        }),
        catchError((refreshError) => {
            // Refresh failed, logout and redirect
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
        })
    );
}
