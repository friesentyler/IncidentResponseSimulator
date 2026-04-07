import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const http = inject(HttpClient);

    if (!authService.isLoggedIn()) {
        return router.parseUrl('/login');
    }

    // User is logged in — now check if their subscription is active
    return http.get<any>(`${environment.apiUrl}payments/subscription-status/`).pipe(
        map(res => {
            if (res.subscription_status === 'active' || res.subscription_status === 'trialing') {
                return true;
            }
            // Subscription not active — force to payment page
            return router.parseUrl('/payment');
        }),
        catchError(() => {
            // If the check fails, redirect to payment as a safe default
            return of(router.parseUrl('/payment'));
        })
    );
};
