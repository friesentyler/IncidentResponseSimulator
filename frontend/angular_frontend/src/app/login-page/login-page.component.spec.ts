import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
    let component: LoginPageComponent;
    let fixture: ComponentFixture<LoginPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginPageComponent],
            providers: [provideRouter([])],
        })
            .compileComponents();

        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // test valid email and password combo and that the error messages don't appear
    it('should not error out on valid email and valid password', () => {
        const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
        const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

        emailField.value = 'john.doe@example.com';
        emailField.dispatchEvent(new Event('input'));

        passwordField.value = 'password123';
        passwordField.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
        button.click();

        fixture.detectChanges();

        const emailReq = fixture.debugElement.nativeElement.querySelector('#email-req');
        const emailFormatReq = fixture.debugElement.nativeElement.querySelector('#email-format-req');
        const passwordReq = fixture.debugElement.nativeElement.querySelector('#password-req');

        expect(emailReq).toBeNull();
        expect(emailFormatReq).toBeNull();
        expect(passwordReq).toBeNull();
    })

    it('should error out on empty email', () => {
        const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
        emailField.value = '';
        emailField.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
        button.click();

        fixture.detectChanges();

        const emailReq = fixture.debugElement.nativeElement.querySelector('#email-req');
        expect(emailReq).toBeTruthy();
    })

    it('should error out on invalid email format', () => {
        const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
        emailField.value = 'invalid-email';
        emailField.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
        button.click();

        fixture.detectChanges();

        const emailFormatReq = fixture.debugElement.nativeElement.querySelector('#email-format-req');
        expect(emailFormatReq).toBeTruthy();
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

    it('should error out on invalid email and empty password', () => {
        const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
        const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

        emailField.value = 'invalid';
        emailField.dispatchEvent(new Event('input'));

        passwordField.value = '';
        passwordField.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
        button.click();

        fixture.detectChanges();

        const emailFormatReq = fixture.debugElement.nativeElement.querySelector('#email-format-req');
        const passwordReq = fixture.debugElement.nativeElement.querySelector('#password-req');

        expect(emailFormatReq).toBeTruthy();
        expect(passwordReq).toBeTruthy();
    })

    // test that register link exists and has correct routerLink
    it('should have a link to the register page', () => {
        const registerLink: HTMLAnchorElement = fixture.debugElement.nativeElement.querySelector('.register-link');
        expect(registerLink.getAttribute('routerLink')).toBe('/register');
    })

    // test that login button works
    it('should submit form properly on click login button', () => {
        spyOn(component, 'onSubmit');

        const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
        const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

        emailField.value = 'user@example.com';
        emailField.dispatchEvent(new Event('input'));
        passwordField.value = 'securePassword';
        passwordField.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
        button.click();

        expect(component.onSubmit).toHaveBeenCalled();
    })
});
