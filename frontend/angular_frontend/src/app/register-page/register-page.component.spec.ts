import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  let component: RegisterPageComponent;
  let fixture: ComponentFixture<RegisterPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  // test valid username, email and password validation combo and that the error messages and DOM elements don't appear
  it('should not error out on valid username, email and valid password', () => {
    const usernameField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#username');
    const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
    const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

    usernameField.value = 'testuser';
    usernameField.dispatchEvent(new Event('input'));
    emailField.value = 'example@gmail.com';
    emailField.dispatchEvent(new Event('input'));
    // one upper case, lowercase, special character, number, and min length of 12
    passwordField.value = '1rR$ksdlfajSA2453$';
    passwordField.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
    button.click();
    fixture.detectChanges();

    const usernameReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#username-req');
    const emailReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#email-req');
    const emailFormatReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#email-format-req');
    const passwordReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#password-req');
    const passwordLenReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#password-len-req');
    const passwordComplexityReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#password-complexity-req');

    expect(usernameReq).toBeNull();
    expect(emailReq).toBeNull();
    expect(emailFormatReq).toBeNull();
    expect(passwordReq).toBeNull();
    expect(passwordLenReq).toBeNull();
    expect(passwordComplexityReq).toBeNull();
  })

  // test invalid email but valid password and username
  it('should error out on invalid email and valid password/username', () => {
    const usernameField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#username');
    const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
    const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

    usernameField.value = 'testuser';
    usernameField.dispatchEvent(new Event('input'));
    emailField.value = '';
    emailField.dispatchEvent(new Event('input'));
    passwordField.value = '1rR$ksdlfajSA2453$';
    passwordField.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
    button.click();

    fixture.detectChanges();

    const emailReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#email-req');
    const emailFormatReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#email-format-req');

    expect(emailReq).toBeTruthy();
    expect(emailFormatReq).toBeNull();

    const usernameReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#username-req');
    expect(usernameReq).toBeNull();
  })

  // test missing username triggers error
  it('should error out on missing username', () => {
    const usernameField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#username');
    usernameField.value = '';
    usernameField.dispatchEvent(new Event('input'));

    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
    button.click();
    fixture.detectChanges();

    const usernameReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#username-req');
    expect(usernameReq).toBeTruthy();
  })

  // test valid email/username but invalid password that error messages appear
  it('should error out on valid email/username and invalid password', () => {
    const usernameField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#username');
    const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
    const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

    usernameField.value = 'testuser';
    usernameField.dispatchEvent(new Event('input'));
    emailField.value = 'example@gmail.com';
    emailField.dispatchEvent(new Event('input'));
    passwordField.value = '';
    passwordField.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
    button.click();

    fixture.detectChanges();

    const passwordRequired: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#password-req');
    expect(passwordRequired).toBeTruthy();
  })

  // test that login link exists and has correct routerLink
  it('should have a link to the login page', () => {
    const loginLink: HTMLAnchorElement = fixture.debugElement.nativeElement.querySelector('.login-link');
    expect(loginLink.getAttribute('routerLink')).toBe('/login');
  })

  // test that register button works
  it('should submit form properly on click register button', () => {
    spyOn(component, 'onSubmit');

    const usernameField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#username');
    const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
    const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

    usernameField.value = 'testuser';
    usernameField.dispatchEvent(new Event('input'));
    emailField.value = 'test@example.com';
    emailField.dispatchEvent(new Event('input'));
    passwordField.value = 'StrongPass123!';
    passwordField.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
    button.click();
    expect(component.onSubmit).toHaveBeenCalled();
  })

  it('should display register error message when registerError is set', () => {
    component.registerError = 'Username already exists';
    fixture.detectChanges();

    const errorMsg = fixture.debugElement.nativeElement.querySelector('.error-message.global-error');
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.textContent).toContain('Username already exists');
  })

  it('should not display register error message when registerError is null', () => {
    component.registerError = null;
    fixture.detectChanges();

    const errorMsg = fixture.debugElement.nativeElement.querySelector('.error-message.global-error');
    expect(errorMsg).toBeNull();
  })
});
