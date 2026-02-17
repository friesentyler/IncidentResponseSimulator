import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.css'
})
export class PaymentPageComponent implements OnInit, OnDestroy {
  @ViewChild('cardElement') cardElementRef!: ElementRef;

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;
  cardError: string | null = null;
  loading = false;
  success = false;

  // WARNING: Replace with your actual Stripe Publishable Key from https://dashboard.stripe.com/test/apikeys
  // Without a valid key, Stripe Elements will not mount correctly.
  private readonly STRIPE_PUBLISHABLE_KEY = 'pk_test_placeholder_key';

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

    this.loading = false;

    if (error) {
      this.cardError = error.message ?? 'An unknown error occurred';
    } else {
      this.success = true;
      console.log('Payment Method Created:', paymentMethod);
      // TODO: Send paymentMethod.id to your server to complete the payment
    }
  }
}
