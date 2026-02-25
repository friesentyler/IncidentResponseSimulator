from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from unittest.mock import patch, MagicMock
from rest_framework import status
from rest_framework.test import APIClient
from .models import UserProfile
import stripe


class StripeIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        self.create_subscription_url = reverse('create_subscription')
        self.subscription_status_url = reverse('subscription_status')
        # Prevent "No API key provided" errors in tests since settings.py pulls from .env which may not be loaded
        stripe.api_key = 'sk_test_dummy'

    @patch('IncidentResponseSimulator.payments.views.stripe.Customer.modify')
    @patch('IncidentResponseSimulator.payments.views.stripe.PaymentMethod.attach')
    @patch('IncidentResponseSimulator.payments.views.stripe.Customer.create')
    @patch('IncidentResponseSimulator.payments.views.stripe.Price.list')
    @patch('IncidentResponseSimulator.payments.views.stripe.Subscription.create')
    def test_create_subscription_success(self, mock_sub_create, mock_price_list, mock_customer_create, mock_pm_attach, mock_cust_modify):
        # Mock Stripe Customer
        mock_customer = MagicMock()
        mock_customer.id = 'cus_test123'
        mock_customer_create.return_value = mock_customer

        # Mock Stripe Price List
        mock_price = MagicMock()
        mock_price.id = 'price_test123'
        
        # Ensure prices.data exists and has our mock_price
        mock_price_list_response = MagicMock()
        mock_price_list_response.data = [mock_price]
        mock_price_list.return_value = mock_price_list_response

        # Mock Stripe Subscription
        mock_subscription = MagicMock()
        mock_subscription.id = 'sub_test123'
        mock_subscription.status = 'active'
        mock_subscription.pending_setup_intent.client_secret = 'pi_secret_test123'
        mock_sub_create.return_value = mock_subscription

        data = {'payment_method_id': 'pm_test123'}
        response = self.client.post(self.create_subscription_url, data, format='json')

        if response.status_code != 201:
            print("ERROR RESPONSE:", response.data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['subscription_id'], 'sub_test123')
        self.assertEqual(response.data['status'], 'active')

        # Verify UserProfile was updated
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.stripe_customer_id, 'cus_test123')
        self.assertEqual(self.user.profile.stripe_subscription_id, 'sub_test123')
        self.assertEqual(self.user.profile.subscription_status, 'active')

    def test_subscription_status_endpoint(self):
        # Pre-populate profile
        profile = self.user.profile
        profile.stripe_subscription_id = 'sub_test456'
        profile.subscription_status = 'active'
        profile.save()

        response = self.client.get(self.subscription_status_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subscription_status'], 'active')
        self.assertEqual(response.data['stripe_subscription_id'], 'sub_test456')
