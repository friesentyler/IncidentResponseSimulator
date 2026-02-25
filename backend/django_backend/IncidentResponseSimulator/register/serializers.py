import re
from rest_framework import serializers
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=12)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate_password(self, value):
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$', value):
            raise serializers.ValidationError(
                "Password must contain uppercase, lowercase, number, and special character."
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
                username=validated_data["username"],
                email=validated_data["email"],
                password=validated_data["password"]
               )
        return user
