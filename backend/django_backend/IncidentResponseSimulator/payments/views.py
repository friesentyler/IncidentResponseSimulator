import json
import stripe
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import CreateSubscriptionSerializer, SubscriptionStatusSerializer
from .models import UserProfile

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    """
    Creates a Stripe Customer and Subscription for the authenticated user.
    Expects { "payment_method_id": "pm_..." } from the frontend.
    """
    serializer = CreateSubscriptionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    payment_method_id = serializer.validated_data['payment_method_id']
    user = request.user
    profile = user.profile

    try:
        # Create or retrieve Stripe Customer
        if profile.stripe_customer_id:
            customer = stripe.Customer.retrieve(profile.stripe_customer_id)
        else:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.username,
                payment_method=payment_method_id,
                invoice_settings={'default_payment_method': payment_method_id},
            )
            profile.stripe_customer_id = customer.id
            profile.save()

        # Attach payment method if customer already existed
        if profile.stripe_customer_id:
            stripe.PaymentMethod.attach(payment_method_id, customer=customer.id)
            stripe.Customer.modify(
                customer.id,
                invoice_settings={'default_payment_method': payment_method_id},
            )

        # Look up the active price for the product
        prices = stripe.Price.list(product=settings.STRIPE_PRODUCT_ID, active=True, limit=1)
        if not prices.data:
            return Response(
                {'error': 'No active price found for this product.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        price_id = prices.data[0].id

        # Create the subscription
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{'price': price_id}],
            expand=['pending_setup_intent'],
        )

        # Save subscription info to UserProfile
        profile.stripe_subscription_id = subscription.id
        profile.subscription_status = subscription.status
        profile.save()

        return Response({
            'subscription_id': subscription.id,
            'status': subscription.status,
            'client_secret': subscription.pending_setup_intent.client_secret
            if subscription.pending_setup_intent
            else None,
        }, status=status.HTTP_201_CREATED)

    except stripe.error.CardError as e:
        return Response({'error': str(e.user_message)}, status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def subscription_status(request):
    """Returns the current user's subscription status."""
    profile = request.user.profile
    serializer = SubscriptionStatusSerializer({
        'subscription_status': profile.subscription_status,
        'stripe_subscription_id': profile.stripe_subscription_id,
    })
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Handles incoming Stripe webhook events to keep subscription status in sync.
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)

    if webhook_secret and sig_header:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # In development without webhook secret, parse the event directly
        event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)

    # Handle subscription lifecycle events
    event_type = event['type']
    data_object = event['data']['object']

    if event_type in ('customer.subscription.updated', 'customer.subscription.deleted'):
        _sync_subscription_status(data_object)
    elif event_type == 'invoice.payment_failed':
        subscription_id = data_object.get('subscription')
        if subscription_id:
            sub = stripe.Subscription.retrieve(subscription_id)
            _sync_subscription_status(sub)

    return Response({'status': 'ok'})


def _sync_subscription_status(subscription_obj):
    """Helper to sync a Stripe subscription object to the local UserProfile."""
    try:
        profile = UserProfile.objects.get(stripe_subscription_id=subscription_obj['id'])
        profile.subscription_status = subscription_obj['status']
        profile.save()
    except UserProfile.DoesNotExist:
        pass
