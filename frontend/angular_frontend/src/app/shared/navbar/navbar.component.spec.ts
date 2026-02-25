import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { BehaviorSubject } from 'rxjs';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        AuthService
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show Register link when not logged in', () => {
    // Default state: not logged in
    const registerLink = fixture.debugElement.nativeElement.querySelector('a[routerLink="/register"]');
    const logoutLink = fixture.debugElement.nativeElement.querySelector('a.nb-navbar-link');
    expect(registerLink).toBeTruthy();
    // "Logout" text should not be present
    const allLinks = fixture.debugElement.nativeElement.querySelectorAll('a.nb-navbar-link');
    const logoutText = Array.from(allLinks).find((el: any) => el.textContent.trim() === 'Logout');
    expect(logoutText).toBeUndefined();
  });

  it('should show Logout link when logged in', () => {
    // Simulate logged in state
    (authService as any).loginStatus.next(true);
    fixture.detectChanges();

    const allLinks = fixture.debugElement.nativeElement.querySelectorAll('a.nb-navbar-link');
    const logoutLink = Array.from(allLinks).find((el: any) => el.textContent.trim() === 'Logout');
    expect(logoutLink).toBeTruthy();

    // Register link should not be present
    const registerLink = fixture.debugElement.nativeElement.querySelector('a[routerLink="/register"]');
    expect(registerLink).toBeNull();
  });

  it('should call AuthService.logout when Logout is clicked', () => {
    spyOn(authService, 'logout');
    (authService as any).loginStatus.next(true);
    fixture.detectChanges();

    const allLinks = fixture.debugElement.nativeElement.querySelectorAll('a.nb-navbar-link');
    const logoutLink: HTMLAnchorElement = Array.from(allLinks).find((el: any) => el.textContent.trim() === 'Logout') as HTMLAnchorElement;
    logoutLink.click();

    expect(authService.logout).toHaveBeenCalled();
  });
});
