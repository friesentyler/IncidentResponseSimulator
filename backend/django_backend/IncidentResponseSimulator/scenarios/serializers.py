from rest_framework import serializers
from .models import ScenarioModel


class ScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScenarioModel
        fields = ['id', 'scenario_name', 'scenario_description', 'scenario_status']
        read_only_fields = ['id', 'scenario_name', 'scenario_description']

    def validate_scenario_status(self, value):
        """
        Enforce state machine transitions for the client.
        Allowed for client: loading, resetting.
        Prerequisites:
        - loading: must be currently inactive.
        - resetting: must be currently active.
        """
        allowed_client_states = ['loading', 'resetting']
        server_only_states = ['active', 'inactive']

        if value in server_only_states:
            raise serializers.ValidationError(
                f"Clients cannot manually set status to '{value}'."
            )

        # Skip prerequisite check for new objects (though we use GET_OR_CREATE,
        # it's good practice for general serializer use).
        if self.instance:
            current_status = self.instance.scenario_status

            if value == 'loading' and current_status != 'inactive':
                raise serializers.ValidationError(
                    f"Cannot start 'loading' while in '{current_status}' state."
                )

            if value == 'resetting' and current_status != 'active':
                raise serializers.ValidationError(
                    f"Cannot start 'resetting' while in '{current_status}' state."
                )

        return value
