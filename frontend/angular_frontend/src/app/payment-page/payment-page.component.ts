import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.css'
})
export class PaymentPageComponent implements OnInit, OnDestroy {
  @ViewChild('cardElement') cardElementRef!: ElementRef;
  private http = inject(HttpClient);
  private router = inject(Router);

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;
  cardError: string | null = null;
  loading = false;
  success = false;

  planPrice = 19.99;
  planName = 'Incident Response Simulator Subscription';

  // Stripe Publishable Key is sourced from src/environments/environment.ts
  private readonly STRIPE_PUBLISHABLE_KEY = environment.stripePublishableKey;

  async ngOnInit() {
    this.stripe = await loadStripe(this.STRIPE_PUBLISHABLE_KEY);
    if (this.stripe) {
      this.elements = this.stripe.elements();
      this.card = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#000',
            '::placeholder': {
              color: '#d4d4d4',
            },
          },
        },
      });
      this.card.mount(this.cardElementRef.nativeElement);

      this.card.on('change', (event) => {
        this.cardError = event.error ? event.error.message : null;
      });
    }
  }

  ngOnDestroy() {
    if (this.card) {
      this.card.destroy();
    }
  }

  async handlePayment(event: Event) {
    event.preventDefault();

    if (!this.stripe || !this.card) return;

    this.loading = true;
    const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.card,
    });

    if (error) {
      this.cardError = error.message ?? 'An unknown error occurred';
      this.loading = false;
    } else {
      console.log('Payment Method Created:', paymentMethod);
      this.http.post(`${environment.apiUrl}payments/create-subscription/`, {
        payment_method_id: paymentMethod.id
      }).subscribe({
        next: (res) => {
          this.success = true;
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error: (err) => {
          console.error('Subscription creation failed', err);
          this.cardError = err.error?.error || 'Failed to create subscription. Please try again.';
          this.loading = false;
        }
      });
    }
  }
}
