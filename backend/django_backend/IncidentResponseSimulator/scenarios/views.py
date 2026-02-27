from django.shortcuts import render
from rest_framework import viewsets
from .models import ScenarioModel
from .serializers import ScenarioSerializer


class ScenarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ScenarioModel.objects.all()
    serializer_class = ScenarioSerializer