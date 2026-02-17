import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  let component: RegisterPageComponent;
  let fixture: ComponentFixture<RegisterPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [provideRouter([])],
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  // test valid email and password validation combo and that the error messages and DOM elements don't appear
  it('should not error out on valid email and valid password', () => {
    const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
    const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');
    emailField.value = 'example@gmail.com';
    emailField.dispatchEvent(new Event('input'));
    // one upper case, lowercase, special character, number, and min length of 12
    passwordField.value = '1rR$ksdlfajSA2453$';
    passwordField.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
    button.click();
    fixture.detectChanges();

    const emailReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#email-req');
    const emailFormatReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#email-format-req');
    const passwordReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#password-req');
    const passwordLenReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#password-len-req');
    const passwordComplexityReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#password-complexity-req');
    expect(emailReq).toBeNull();
    expect(emailFormatReq).toBeNull();
    expect(passwordReq).toBeNull();
    expect(passwordLenReq).toBeNull();
    expect(passwordComplexityReq).toBeNull();
  })

  // test invalid email but valid password email should have error message password is fine
  it('should error out on invalid email and valid password', () => {
    const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
    const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

    // Use .value and dispatch input event
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

    // Note: Angular Validators.email DOES NOT trigger if the field is empty.
    // So only emailReq (required) will be truthy, emailFormatReq will be null.
    expect(emailReq).toBeTruthy();
    expect(emailFormatReq).toBeNull();

    const passwordReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#password-req');
    expect(passwordReq).toBeNull();
  })

  // test valid email but invalid password that error messages appear
  it('should error out on valid email and invalid password', () => {
    const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
    const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

    // Use .value and dispatch input event
    emailField.value = 'example@gmail.com';
    emailField.dispatchEvent(new Event('input'));

    passwordField.value = '';
    passwordField.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
    button.click();

    fixture.detectChanges();

    const passwordRequired: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#password-req');
    const passwordLenReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#password-len-req');
    const passwordComplexityReq: HTMLDivElement = fixture.debugElement.nativeElement.querySelector('#password-complexity-req');

    expect(passwordRequired).toBeTruthy();
    expect(passwordLenReq).toBeNull();
    expect(passwordComplexityReq).toBeNull();
  })

  // test invalid email and invalid password and that error messages appear
  it('should error out on invalid email and invalid password', () => {
    const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
    const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');

    emailField.value = 'not-an-email';
    emailField.dispatchEvent(new Event('input'));

    passwordField.value = '123';
    passwordField.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
    button.click();

    fixture.detectChanges();

    const emailFormatReq = fixture.debugElement.nativeElement.querySelector('#email-format-req');
    const passwordLenReq = fixture.debugElement.nativeElement.querySelector('#password-len-req');

    expect(emailFormatReq).toBeTruthy();
    expect(passwordLenReq).toBeTruthy();
  })

  // test that login link exists and has correct routerLink
  it('should have a link to the login page', () => {
    const loginLink: HTMLAnchorElement = fixture.debugElement.nativeElement.querySelector('.login-link');
    expect(loginLink.getAttribute('routerLink')).toBe('/login');
  })

  // test that register button works
  it('should submit form properly on click register button', () => {
    spyOn(component, 'onSubmit');

    // Set valid inputs so the submit logic actually runs
    const emailField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#email');
    const passwordField: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#password');
    emailField.value = 'test@example.com';
    emailField.dispatchEvent(new Event('input'));
    passwordField.value = 'StrongPass123!';
    passwordField.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
    button.click();
    expect(component.onSubmit).toHaveBeenCalled();
  })
});
