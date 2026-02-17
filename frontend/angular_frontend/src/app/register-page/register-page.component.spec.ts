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
  // test invalid email but valid password email should have error message password is fine
  // test valid email but invalid password that error messages appear
  // test invalid email and invalid password and that error messages appear
  // test that login button works
  // test that register button works
  it('should submit form properly on click register button', () => {
    spyOn(component, 'onSubmit');
    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('.nb-button.blue');
    button.click();
    expect(component.onSubmit).toHaveBeenCalled()
  })
});
