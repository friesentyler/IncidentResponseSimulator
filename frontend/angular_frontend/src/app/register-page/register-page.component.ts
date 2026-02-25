import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-register-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  cardTitle: string = 'Create a new account';
  cardText: string = 'Enter your details below to create a new account. If you already have an account';
  submitted = false;
  registerError: string | null = null;

  registrationForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]]
  });

  onSubmit() {
    this.submitted = true;
    this.registerError = null;
    if (this.registrationForm.valid) {
      const { username, password } = this.registrationForm.value;
      this.http.post(`${environment.apiUrl}register/`, this.registrationForm.value).pipe(
        switchMap(() => this.authService.login({ username, password }))
      ).subscribe({
        next: () => {
          this.router.navigate(['/payment']);
        },
        error: (error) => {
          console.error('Registration failed', error);
          if (error.error?.username) {
            this.registerError = 'Username already exists';
          } else {
            this.registerError = 'Registration failed. Please try again.';
          }
        }
      });
    }
  }
}
