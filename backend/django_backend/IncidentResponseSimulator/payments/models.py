from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    Extends the built-in User model with Stripe subscription data.
    Auto-created via a post_save signal when a User is created.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    subscription_status = models.CharField(
        max_length=20,
        default='inactive',
        choices=[
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('past_due', 'Past Due'),
            ('canceled', 'Canceled'),
            ('trialing', 'Trialing'),
        ]
    )

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username} - {self.subscription_status}"
