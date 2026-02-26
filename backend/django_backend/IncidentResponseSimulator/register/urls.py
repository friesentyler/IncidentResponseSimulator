from django.urls import path
from IncidentResponseSimulator.register import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name="register")
]
