import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [NavbarComponent, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  cardTitle: string = 'Create a new account';
  cardText: string = 'Enter your email below to create a new account. If you already have an account';
}
