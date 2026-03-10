from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'scenarios', views.ScenarioViewSet, basename='scenarios')

urlpatterns = [
    path('', include(router.urls)),
    path('quiz/<int:scenario_id>/', views.QuizDetailView.as_view(), name='quiz-detail'),
]

