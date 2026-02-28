from django.shortcuts import render
from rest_framework import viewsets
from .models import ScenarioModel
from .serializers import ScenarioSerializer
from rest_framework.permissions import IsAuthenticated


import threading
import time
import logging

logger = logging.getLogger(__name__)

class ScenarioViewSet(viewsets.ModelViewSet):
    queryset = ScenarioModel.objects.all()
    serializer_class = ScenarioSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        """
        Overrides the default update logic to trigger background tasks
        when the status changes to 'loading' or 'resetting'.
        """
        instance = serializer.save()

        if instance.scenario_status in ['loading', 'resetting']:
            logger.info(f"Triggering background task for scenario {instance.id} (Status: {instance.scenario_status})")
            # Start a background thread so the HTTP response is returned immediately
            thread = threading.Thread(target=self._run_vm_operation, args=(instance.id, instance.scenario_status))
            thread.daemon = True # Ensure the thread doesn't block server shutdown
            thread.start()

    def _run_vm_operation(self, scenario_id, target_status):
        """
        Simulates a long-running VM operation in the background.
        """
        try:
            # Determine the final state based on the transition
            # loading -> active
            # resetting -> inactive
            final_status = 'active' if target_status == 'loading' else 'inactive'
            
            logger.info(f"Background thread starting for scenario {scenario_id}: {target_status} -> {final_status}")
            
            # Simulate the 90-second spin-up/tear-down
            # For testing purposes, we might want to keep this shorter, 
            # but I'll set it to 10 seconds for a visible but quick demonstration.
            time.sleep(10) 

            # Update the database. We use .filter().update() to avoid 
            # conflicts with other threads/processes if possible.
            ScenarioModel.objects.filter(id=scenario_id).update(scenario_status=final_status)
            
            logger.info(f"Background thread finished for scenario {scenario_id}. Final status: {final_status}")
            
        except Exception as e:
            logger.error(f"Error in background VM operation for scenario {scenario_id}: {str(e)}")
            # If it fails, maybe revert to a safe state
            ScenarioModel.objects.filter(id=scenario_id).update(scenario_status='inactive')