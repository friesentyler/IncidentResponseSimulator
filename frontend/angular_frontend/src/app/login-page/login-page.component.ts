import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login-page',
    imports: [RouterLink, ReactiveFormsModule],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    cardTitle: string = 'Login to your account';
    cardText: string = 'Enter your username below to login to your account. If you don\'t have an account yet';
    submitted = false;
    loginError: string | null = null;
    loginSuccess = false;

    loginForm: FormGroup = this.fb.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required]]
    });

    onSubmit() {
        this.submitted = true;
        this.loginError = null;
        if (this.loginForm.valid) {
            this.authService.login(this.loginForm.value).subscribe({
                next: () => {
                    this.loginSuccess = true;
                    setTimeout(() => {
                        this.router.navigate(['/dashboard']);
                    }, 1000);
                },
                error: (err) => {
                    console.error('Login failed', err);
                    this.loginError = 'Invalid username or password';
                }
            });
        }
    }
}
