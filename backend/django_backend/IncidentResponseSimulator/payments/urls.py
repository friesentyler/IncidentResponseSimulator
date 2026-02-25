from django.urls import path
from . import views

urlpatterns = [
    path('create-subscription/', views.create_subscription, name='create_subscription'),
    path('subscription-status/', views.subscription_status, name='subscription_status'),
    path('webhook/', views.stripe_webhook, name='stripe_webhook'),
]
