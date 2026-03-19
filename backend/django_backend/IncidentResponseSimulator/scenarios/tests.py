from django.test import TestCase, override_settings
from django.conf import settings
from django.urls import reverse
from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.exceptions import ValidationError
from .models import ScenarioModel, Quiz, Question, AnswerChoice, ScenarioCredential
from .serializers import ScenarioSerializer
from .views import ScenarioViewSet
from django.core.files.base import ContentFile
from rest_framework.test import APIRequestFactory
import time
from unittest.mock import patch
import requests
from django.urls import clear_url_caches
from importlib import import_module
import sys

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
        self.test_creds = []

    def tearDown(self):
        # Manually delete only the files created during this test to keep the directory clean
        for cred in self.test_creds:
            if cred.scenario_credentials and cred.scenario_credentials.name:
                cred.scenario_credentials.delete(save=False)

    def test_unauthenticated_access_denied(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_list_and_detail(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_serializer_includes_download_url_when_active(self):
        cred = ScenarioCredential.objects.create(
            scenario_credentials=ContentFile(b"test", name="test.txt")
        )
        self.test_creds.append(cred)
        self.scenario.scenario_credentials = cred
        self.scenario.scenario_status = 'active'
        self.scenario.save()

        factory = APIRequestFactory()
        request = factory.get('/')
        serializer = ScenarioSerializer(self.scenario, context={'request': request})
        
        self.assertIsNotNone(serializer.data['download_url'])
        self.assertIn('test', serializer.data['download_url'])
        self.assertTrue(serializer.data['download_url'].endswith('.txt'))

        self.scenario.scenario_status = 'inactive'
        self.scenario.save()
        serializer = ScenarioSerializer(self.scenario, context={'request': request})
        self.assertIsNone(serializer.data['download_url'])
 
    @override_settings(DEBUG=True)
    def test_media_file_is_accessible(self):
        """Verify that the media file can be retrieved via the download_url."""
        self.client.force_authenticate(user=self.user)
        
        # 1. Create a credential file
        content = b"fake-credential-content"
        cred = ScenarioCredential.objects.create(
            scenario_credentials=ContentFile(content, name="secret.txt")
        )
        self.test_creds.append(cred)
        self.scenario.scenario_credentials = cred
        self.scenario.scenario_status = 'active'
        self.scenario.save()
 
        # 2. Get the download URL from the API
        urlconf = settings.ROOT_URLCONF
        if urlconf in sys.modules:
            import importlib
            importlib.reload(sys.modules[urlconf])
        clear_url_caches()
 
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        download_url = response.data['download_url']
        self.assertIsNotNone(download_url)
 
        # 3. Access the file using the test client
        # We need to strip the protocol and host to use self.client.get
        path = download_url.replace('http://testserver', '')
        file_response = self.client.get(path)
        
        self.assertEqual(file_response.status_code, status.HTTP_200_OK)
        self.assertEqual(b"".join(file_response.streaming_content), content)

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


class QuizModelTest(TestCase):
    def setUp(self):
        self.scenario = ScenarioModel.objects.create(
            scenario_name="Quiz Scenario",
            scenario_description="Testing quizzes",
            scenario_status="inactive"
        )
        self.quiz = Quiz.objects.create(
            scenario=self.scenario,
            title="Test Quiz",
            description="A test quiz"
        )
        self.question = Question.objects.create(
            quiz=self.quiz,
            text="What is 2+2?",
            question_type="multiple_choice",
            order=1
        )
        self.correct_choice = AnswerChoice.objects.create(
            question=self.question,
            text="4",
            is_correct=True,
            rationale="Basic arithmetic."
        )
        self.wrong_choice = AnswerChoice.objects.create(
            question=self.question,
            text="5",
            is_correct=False
        )

    def test_quiz_str(self):
        self.assertEqual(str(self.quiz), "Quiz for Quiz Scenario")

    def test_question_str(self):
        self.assertEqual(str(self.question), "Test Quiz - Q: What is 2+2?")

    def test_answer_choice_str(self):
        self.assertEqual(str(self.correct_choice), "4")

    def test_question_ordering(self):
        q2 = Question.objects.create(quiz=self.quiz, text="Second?", order=0)
        questions = list(self.quiz.questions.all())
        self.assertEqual(questions[0], q2)  # order=0 first
        self.assertEqual(questions[1], self.question)  # order=1 second


class QuizAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='quiztester', password='pass123')
        self.scenario = ScenarioModel.objects.create(
            scenario_name="API Quiz Scenario",
            scenario_description="Quiz API Test",
            scenario_status="inactive"
        )
        self.quiz = Quiz.objects.create(
            scenario=self.scenario,
            title="API Quiz",
            description="Testing the API"
        )
        self.q1 = Question.objects.create(
            quiz=self.quiz, text="Q1?", question_type="multiple_choice", order=1
        )
        self.q1_correct = AnswerChoice.objects.create(
            question=self.q1, text="Correct", is_correct=True, rationale="Because it is."
        )
        self.q1_wrong = AnswerChoice.objects.create(
            question=self.q1, text="Wrong", is_correct=False
        )
        self.q2 = Question.objects.create(
            quiz=self.quiz, text="Q2?", question_type="select_all", order=2
        )
        self.q2_c1 = AnswerChoice.objects.create(
            question=self.q2, text="A", is_correct=True, rationale="A is correct."
        )
        self.q2_c2 = AnswerChoice.objects.create(
            question=self.q2, text="B", is_correct=True, rationale="B is also correct."
        )
        self.q2_c3 = AnswerChoice.objects.create(
            question=self.q2, text="C", is_correct=False
        )
        self.quiz_url = reverse('quiz-detail', kwargs={'scenario_id': self.scenario.id})

    def test_get_quiz_unauthenticated(self):
        response = self.client.get(self.quiz_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_quiz_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.quiz_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'API Quiz')
        self.assertEqual(len(response.data['questions']), 2)
        # Verify choices are present and don't leak is_correct
        q1_data = response.data['questions'][0]
        self.assertEqual(len(q1_data['choices']), 2)
        self.assertNotIn('is_correct', q1_data['choices'][0])

    def test_get_quiz_404_no_quiz(self):
        scenario_no_quiz = ScenarioModel.objects.create(
            scenario_name="No Quiz", scenario_description="None", scenario_status="inactive"
        )
        url = reverse('quiz-detail', kwargs={'scenario_id': scenario_no_quiz.id})
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_submit_all_correct(self):
        self.client.force_authenticate(user=self.user)
        answers = {
            str(self.q1.id): [self.q1_correct.id],
            str(self.q2.id): [self.q2_c1.id, self.q2_c2.id],
        }
        response = self.client.post(self.quiz_url, {'answers': answers}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['score'], 2)
        self.assertEqual(response.data['total'], 2)
        self.assertEqual(response.data['results'], {})

    def test_submit_some_incorrect(self):
        self.client.force_authenticate(user=self.user)
        answers = {
            str(self.q1.id): [self.q1_wrong.id],  # Wrong
            str(self.q2.id): [self.q2_c1.id, self.q2_c2.id],  # Correct
        }
        response = self.client.post(self.quiz_url, {'answers': answers}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['score'], 1)
        self.assertEqual(response.data['total'], 2)
        # Check that incorrect result includes rationale
        q1_result = response.data['results'][str(self.q1.id)]
        self.assertFalse(q1_result['correct'])
        self.assertEqual(len(q1_result['correct_choices']), 1)
        self.assertEqual(q1_result['correct_choices'][0]['rationale'], "Because it is.")

    def test_submit_missing_answers(self):
        self.client.force_authenticate(user=self.user)
        answers = {
            str(self.q1.id): [self.q1_correct.id],
            # Missing q2
        }
        response = self.client.post(self.quiz_url, {'answers': answers}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_submit_normalizes_non_list_answer(self):
        """Single answer sent as int instead of list should be normalized."""
        self.client.force_authenticate(user=self.user)
        answers = {
            str(self.q1.id): self.q1_correct.id,  # int, not list
            str(self.q2.id): [self.q2_c1.id, self.q2_c2.id],
        }
        response = self.client.post(self.quiz_url, {'answers': answers}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['score'], 2)
