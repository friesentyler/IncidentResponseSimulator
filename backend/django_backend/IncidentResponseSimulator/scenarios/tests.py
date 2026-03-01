from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.exceptions import ValidationError
from .models import ScenarioModel
from .serializers import ScenarioSerializer
from .views import ScenarioViewSet
import time
from unittest.mock import patch
import requests

class ScenarioModelTest(TestCase):
    def test_scenario_creation_and_str(self):
        scenario = ScenarioModel.objects.create(
            scenario_name="Test Scenario",
            scenario_description="Test Description",
            scenario_status="inactive"
        )
        self.assertEqual(str(scenario), "Test Scenario - inactive")
        self.assertEqual(scenario.scenario_status, "inactive")

class ScenarioSerializerTest(TestCase):
    def setUp(self):
        self.scenario = ScenarioModel.objects.create(
            scenario_name="Gatekeeper",
            scenario_description="Validation Test",
            scenario_status="inactive"
        )

    def test_serializer_read_only_fields(self):
        # Name and description should be read-only
        data = {
            "scenario_name": "Hacked Name",
            "scenario_status": "loading"
        }
        serializer = ScenarioSerializer(instance=self.scenario, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        serializer.save()
        self.scenario.refresh_from_db()
        self.assertEqual(self.scenario.scenario_name, "Gatekeeper") # Stayed same
        self.assertEqual(self.scenario.scenario_status, "loading") # Updated

    def test_invalid_state_transition_for_client(self):
        # Clients cannot set 'active' directly
        serializer = ScenarioSerializer(instance=self.scenario, data={"scenario_status": "active"}, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('scenario_status', serializer.errors)

    def test_prerequisite_validation_failure(self):
        # Cannot go from 'inactive' to 'resetting'
        serializer = ScenarioSerializer(instance=self.scenario, data={"scenario_status": "resetting"}, partial=True)
        self.assertFalse(serializer.is_valid())
        
        # Swith to active (simulating server side)
        self.scenario.scenario_status = 'active'
        self.scenario.save()
        
        # Now cannot go from 'active' to 'loading'
        serializer = ScenarioSerializer(instance=self.scenario, data={"scenario_status": "loading"}, partial=True)
        self.assertFalse(serializer.is_valid())

class ScenarioAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='tester', password='password123')
        self.scenario = ScenarioModel.objects.create(
            scenario_name="API Scenario",
            scenario_description="API Test",
            scenario_status="inactive"
        )
        self.list_url = reverse('scenarios-list')
        self.detail_url = reverse('scenarios-detail', kwargs={'pk': self.scenario.id})

    def test_unauthenticated_access_denied(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_list_and_detail(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_launch_scenario_api(self):
        self.client.force_authenticate(user=self.user)
        # 1. Trigger loading
        response = self.client.patch(self.detail_url, {"scenario_status": "loading"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['scenario_status'], 'loading')
        
        # 2. Verify it actually changed in DB
        self.scenario.refresh_from_db()
        self.assertEqual(self.scenario.scenario_status, 'loading')
        
        # 3. Successive check for background thread (simulated in tests might be tricky,
        # but the logic in ViewSet uses threading.Thread which runs alongside tests)
        # Note: In Django TestCase, everything is wrapped in a transaction which can sometimes
        # interfere with background threads seeing changes.

    @patch('IncidentResponseSimulator.scenarios.views.requests.post')
    def test_run_vm_operation_start(self, mock_post):
        """Test the background VM operation for starting a scenario."""
        # Setup the mock response
        mock_response = patch('requests.models.Response').start()
        mock_response.json.return_value = {"status": "success", "stdout": "Test output"}
        mock_post.return_value = mock_response

        viewset = ScenarioViewSet()
        
        # Call it synchronously for testing
        viewset._run_vm_operation(self.scenario.id, 'loading')

        # Verify Execution Service was called correctly
        mock_post.assert_called_once_with(
            f"{settings.EXECUTION_SERVICE_URL}/run-scenario",
            json={"scenario_id": str(self.scenario.id), "action": "start"},
            timeout=45
        )

        # Verify DB was updated
        self.scenario.refresh_from_db()
        self.assertEqual(self.scenario.scenario_status, 'active')

    @patch('IncidentResponseSimulator.scenarios.views.requests.post')
    def test_run_vm_operation_stop(self, mock_post):
        """Test the background VM operation for stopping a scenario."""
        # Set initial state to active
        self.scenario.scenario_status = 'active'
        self.scenario.save()

        # Setup the mock response
        mock_response = patch('requests.models.Response').start()
        mock_response.json.return_value = {"status": "success", "stdout": "Teardown output"}
        mock_post.return_value = mock_response

        viewset = ScenarioViewSet()
        
        # Call it synchronously for testing
        viewset._run_vm_operation(self.scenario.id, 'resetting')

        # Verify Execution Service was called correctly
        mock_post.assert_called_once_with(
            f"{settings.EXECUTION_SERVICE_URL}/run-scenario",
            json={"scenario_id": str(self.scenario.id), "action": "stop"},
            timeout=45
        )

        # Verify DB was updated
        self.scenario.refresh_from_db()
        self.assertEqual(self.scenario.scenario_status, 'inactive')

