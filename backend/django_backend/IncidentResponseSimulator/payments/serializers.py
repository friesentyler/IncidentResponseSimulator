from rest_framework import serializers


class CreateSubscriptionSerializer(serializers.Serializer):
    """Validates the payment_method_id sent from the frontend."""
    payment_method_id = serializers.CharField(required=True)


class SubscriptionStatusSerializer(serializers.Serializer):
    """Serializes the user's subscription status."""
    subscription_status = serializers.CharField()
    stripe_subscription_id = serializers.CharField(allow_null=True)
