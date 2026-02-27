from rest_framework import serializers
from .models import ScenarioModel


class ScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScenarioModel
        fields = ['id', 'scenario_name', 'scenario_description', 'scenario_status']
