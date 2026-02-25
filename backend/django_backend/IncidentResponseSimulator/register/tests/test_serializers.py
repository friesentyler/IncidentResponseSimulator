from django.test import TestCase
from django.contrib.auth.models import User
from IncidentResponseSimulator.register.serializers import RegisterSerializer

class RegisterSerializerTest(TestCase):
    def setUp(self):
        self.user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123"
        }

    def test_serializer_with_valid_data(self):
        serializer = RegisterSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.username, self.user_data["username"])
        self.assertEqual(user.email, self.user_data["email"])
        self.assertTrue(user.check_password(self.user_data["password"]))

    def test_serializer_with_missing_fields(self):
        data = {"username": "testuser"}
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    def test_serializer_with_duplicate_username(self):
        User.objects.create_user(**self.user_data)
        serializer = RegisterSerializer(data=self.user_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("username", serializer.errors)

    def test_serializer_password_is_write_only(self):
        serializer = RegisterSerializer(data=self.user_data)
        serializer.is_valid()
        user = serializer.save()
        
        # Check that 'password' is not in the serialized data
        self.assertNotIn("password", serializer.data)
