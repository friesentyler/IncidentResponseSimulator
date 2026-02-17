import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  cardTitle: string = 'Create a new account';
  cardText: string = 'Enter your email below to create a new account. If you already have an account';
  submitted = false;

  registrationForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]]
  });

  onSubmit() {
    this.submitted = true;
    if (this.registrationForm.valid) {
      console.log('Form Submitted!', this.registrationForm.value);
      // TODO: Implement actual registration logic
      // Navigating to payment page after successful (simulated) registration
      this.router.navigate(['/payment']);
    }
  }
}
