import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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

  cardTitle: string = 'Create a new account';
  cardText: string = 'Enter your details below to create a new account. If you already have an account';
  submitted = false;

  registrationForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]]
  });

  onSubmit() {
    this.submitted = true;
    if (this.registrationForm.valid) {
      this.http.post(`${environment.apiUrl}register/`, this.registrationForm.value)
        .subscribe({
          next: (response) => {
            this.router.navigate(['/payment']);
          },
          error: (error) => {
            console.error('Registration failed', error);
          }
        });
    }
  }
}
