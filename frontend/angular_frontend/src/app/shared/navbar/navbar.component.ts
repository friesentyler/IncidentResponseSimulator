import { Component, inject } from '@angular/core';
import { NgOptimizedImage, AsyncPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [NgOptimizedImage, RouterLink, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn$ = this.authService.loginStatus$;

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
