import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-register-page',
  imports: [NavbarComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  cardTitle: string = 'Create a new account';
  cardText: string = 'Enter your email below to create a new account';
}
