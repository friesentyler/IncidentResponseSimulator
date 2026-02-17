import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-login-page',
    imports: [RouterLink, ReactiveFormsModule],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
    private fb = inject(FormBuilder);

    cardTitle: string = 'Login to your account';
    cardText: string = 'Enter your email below to login to your account. If you don\'t have an account yet';
    submitted = false;

    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

    onSubmit() {
        this.submitted = true;
        if (this.loginForm.valid) {
            console.log('Login Attempt!', this.loginForm.value);
            // TODO: Implement actual login logic
        }
    }
}
