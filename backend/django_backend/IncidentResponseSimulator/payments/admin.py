import logging
from django.contrib import admin
from .models import UserProfile

logger = logging.getLogger(__name__)
print("Payments admin.py loaded")

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'stripe_customer_id', 'stripe_subscription_id', 'subscription_status')
    search_fields = ('user__username', 'user__email', 'stripe_customer_id')
