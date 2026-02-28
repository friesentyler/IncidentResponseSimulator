import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';
import { of } from 'rxjs';

describe('authGuard', () => {
    let mockAuthService: jasmine.SpyObj<AuthService>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(() => {
        mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
        mockRouter = jasmine.createSpyObj('Router', ['parseUrl']);

        mockRouter.parseUrl.and.returnValue('/login' as any);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: Router, useValue: mockRouter }
            ]
        });
    });

    const runGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        TestBed.runInInjectionContext(() => authGuard(route, state));

    it('should allow navigation if user is logged in', () => {
        mockAuthService.isLoggedIn.and.returnValue(true);

        // Create dummy route and state
        const route = {} as ActivatedRouteSnapshot;
        const state = {} as RouterStateSnapshot;

        const result = runGuard(route, state);
        expect(result).toBeTrue();
    });

    it('should redirect to login if user is not logged in', () => {
        mockAuthService.isLoggedIn.and.returnValue(false);

        const route = {} as ActivatedRouteSnapshot;
        const state = {} as RouterStateSnapshot;

        const result = runGuard(route, state);

        expect(mockRouter.parseUrl).toHaveBeenCalledWith('/login');
        expect(result as any).toEqual('/login');
    });
});
