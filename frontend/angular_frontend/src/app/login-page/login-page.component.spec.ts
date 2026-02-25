import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginPageComponent', () => {
    let component: LoginPageComponent;
    let fixture: ComponentFixture<LoginPageComponent>;
    let authService: AuthService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginPageComponent],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                AuthService
            ],
        })
            .compileComponents();

        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // test valid username and password combo and that the error messages don't appear
    it('should not error out on valid username and valid password', () => {
        const usernameField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#username');
        const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

        usernameField.value = 'john.doe';
        usernameField.dispatchEvent(new Event('input'));

        passwordField.value = 'password123';
        passwordField.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
        button.click();

        fixture.detectChanges();

        const usernameReq = fixture.debugElement.nativeElement.querySelector('#username-req');
        const passwordReq = fixture.debugElement.nativeElement.querySelector('#password-req');

        expect(usernameReq).toBeNull();
        expect(passwordReq).toBeNull();
    })

    it('should error out on empty username', () => {
        const usernameField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#username');
        usernameField.value = '';
        usernameField.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
        button.click();

        fixture.detectChanges();

        const usernameReq = fixture.debugElement.nativeElement.querySelector('#username-req');
        expect(usernameReq).toBeTruthy();
    })

    it('should error out on empty password', () => {
        const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');
        passwordField.value = '';
        passwordField.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
        button.click();

        fixture.detectChanges();

        const passwordReq = fixture.debugElement.nativeElement.querySelector('#password-req');
        expect(passwordReq).toBeTruthy();
    })

    // test that register link exists and has correct routerLink
    it('should have a link to the register page', () => {
        const registerLink: HTMLAnchorElement = fixture.debugElement.nativeElement.querySelector('.register-link');
        expect(registerLink.getAttribute('routerLink')).toBe('/register');
    })

    // test that login button calls AuthService.login
    it('should call AuthService.login on submit', () => {
        spyOn(authService, 'login').and.returnValue(of({ access: 'abc', refresh: 'def' }));

        const usernameField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#username');
        const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

        usernameField.value = 'user123';
        usernameField.dispatchEvent(new Event('input'));
        passwordField.value = 'securePassword';
        passwordField.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
        button.click();

        expect(authService.login).toHaveBeenCalled();
    })

    it('should display error message on login failure', () => {
        spyOn(authService, 'login').and.returnValue(throwError(() => new Error('Login failed')));

        const usernameField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#username');
        const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

        usernameField.value = 'user123';
        usernameField.dispatchEvent(new Event('input'));
        passwordField.value = 'wrongPassword';
        passwordField.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
        button.click();

        fixture.detectChanges();

        const errorMsg = fixture.debugElement.nativeElement.querySelector('.error-message.global-error');
        expect(errorMsg).toBeTruthy();
        expect(errorMsg.textContent).toContain('Invalid username or password');
    })

    it('should show success message after successful login', () => {
        spyOn(authService, 'login').and.returnValue(of({ access: 'abc', refresh: 'def' }));

        const usernameField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#username');
        const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

        usernameField.value = 'user123';
        usernameField.dispatchEvent(new Event('input'));
        passwordField.value = 'securePassword';
        passwordField.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
        button.click();

        fixture.detectChanges();

        const successMsg = fixture.debugElement.nativeElement.querySelector('.success-message');
        expect(successMsg).toBeTruthy();
        expect(successMsg.textContent).toContain('Welcome back!');

        // Form should be hidden
        const form = fixture.debugElement.nativeElement.querySelector('form');
        expect(form).toBeNull();
    })
});
