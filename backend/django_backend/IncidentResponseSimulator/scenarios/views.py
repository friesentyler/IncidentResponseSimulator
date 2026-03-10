import threading
import requests
import time
import logging

from django.shortcuts import render, get_object_or_404
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ScenarioModel, Quiz, Question, AnswerChoice
from .serializers import ScenarioSerializer, QuizSerializer

class QuizDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, scenario_id):
        scenario = get_object_or_404(ScenarioModel, id=scenario_id)
        quiz = get_object_or_404(Quiz, scenario=scenario)
        serializer = QuizSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, scenario_id):
        scenario = get_object_or_404(ScenarioModel, id=scenario_id)
        quiz = get_object_or_404(Quiz, scenario=scenario)
        
        user_answers = request.data.get('answers', {})
        questions = quiz.questions.all()
        
        if len(user_answers) != questions.count():
            return Response({"error": "All questions must be answered."}, status=status.HTTP_400_BAD_REQUEST)

        score = 0
        total_questions = questions.count()
        results = {}

        for question in questions:
            q_id_str = str(question.id)
            if q_id_str not in user_answers:
                return Response({"error": f"Missing answer for question {question.id}"}, status=status.HTTP_400_BAD_REQUEST)

            submitted_choice_ids = user_answers[q_id_str]
            if not isinstance(submitted_choice_ids, list):
                submitted_choice_ids = [submitted_choice_ids]
            
            correct_choices = question.choices.filter(is_correct=True)
            correct_choice_ids = set(c.id for c in correct_choices)
            submitted_set = set(submitted_choice_ids)

            if submitted_set == correct_choice_ids:
                score += 1
            else:
                correct_info = []
                for c in correct_choices:
                    correct_info.append({
                        "id": c.id,
                        "text": c.text,
                        "rationale": c.rationale
                    })
                results[q_id_str] = {
                    "correct": False,
                    "correct_choices": correct_info
                }

        return Response({
            "score": score,
            "total": total_questions,
            "results": results
        }, status=status.HTTP_200_OK)

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
        Simulates a long-running VM operation in the background by calling
        the execution-service microservice.
        """

        try:
            # Determine the final state based on the transition
            # loading -> active
            # resetting -> inactive
            final_status = 'active' if target_status == 'loading' else 'inactive'
            
            logger.info(f"Background thread starting for scenario {scenario_id}: {target_status} -> {final_status}")
            
            # Determine action based on target status
            action = 'start' if target_status == 'loading' else 'stop'

            # Make the HTTP request to the Flask execution service
            execution_url = f"{settings.EXECUTION_SERVICE_URL}/run-scenario"
            logger.info(f"Sending POST request to execution service at {execution_url} with action '{action}'...")
            
            response = requests.post(
                execution_url, 
                json={
                    "scenario_id": str(scenario_id),
                    "action": action
                },
                timeout=45 # Provide a timeout slightly longer than the longest script (30s)
            )

            response.raise_for_status() # Raise HTTP errors
            response_data = response.json()
            
            if response_data.get('status') == 'success':
                # Log the script output directly to the Django console
                script_output = response_data.get('stdout', '')
                if script_output:
                    logger.info(f"\n--- Script Output for Scenario {scenario_id} ({action}) ---\n{script_output}\n-----------------------------------------")

                # Update the database. We use .filter().update() to avoid 
                # conflicts with other threads/processes if possible.
                ScenarioModel.objects.filter(id=scenario_id).update(scenario_status=final_status)
                logger.info(f"Background thread finished for scenario {scenario_id}. Final status: {final_status}")
            else:
                 logger.error(f"Execution service failed: {response_data}")
                 ScenarioModel.objects.filter(id=scenario_id).update(scenario_status='inactive')

        except requests.exceptions.RequestException as e:
            logger.error(f"HTTP Error calling execution service for scenario {scenario_id}: {str(e)}")
            ScenarioModel.objects.filter(id=scenario_id).update(scenario_status='inactive')

        except Exception as e:
            logger.error(f"Error in background VM operation for scenario {scenario_id}: {str(e)}")
            # If it fails, maybe revert to a safe state
            ScenarioModel.objects.filter(id=scenario_id).update(scenario_status='inactive')