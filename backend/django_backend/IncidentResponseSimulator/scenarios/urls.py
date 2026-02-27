from django.urls import path
from . import views

urlpatterns = [
    path('scenarios/', views.ScenarioViewSet.as_view({'get': 'list'}), name='scenarios'),
]
