from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class RegisterViewTest(APITestCase):
    def setUp(self):
        self.register_url = reverse("register")
        self.user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123"
        }

    def test_register_user_success(self):
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, "testuser")

    def test_register_user_fail_missing_data(self):
        data = {"username": "testuser"}
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)

    def test_register_user_fail_duplicate_username(self):
        User.objects.create_user(**self.user_data)
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 1)
