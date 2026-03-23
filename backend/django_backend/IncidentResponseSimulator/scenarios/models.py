from django.db import models

class ScenarioCredential(models.Model):
    scenario_credentials = models.FileField(upload_to='scenario_credentials/', blank=True)

    def __str__(self):
        return f"Credentials for {self.scenario_credentials}"

class ScenarioModel(models.Model):
    """
    Stores info related to the available scenarios that users can spin up.
    """
    scenario_name = models.CharField(max_length=255, blank=True, null=True)
    scenario_description = models.CharField(max_length=1000, blank=True, null=True)
    scenario_status = models.CharField(
        max_length=20,
        default='inactive',
        choices=[
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('loading', 'Loading'),
            ('resetting', 'Resetting'),
        ]
    )
    scenario_credentials = models.ForeignKey(ScenarioCredential, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        verbose_name = 'Scenario'
        verbose_name_plural = 'Scenarios'

    def __str__(self):
        return f"{self.scenario_name} - {self.scenario_status}"


class Quiz(models.Model):
    scenario = models.OneToOneField(ScenarioModel, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Quiz for {self.scenario.scenario_name}"


class Question(models.Model):
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('select_all', 'Select All'),
    ]
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='multiple_choice')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.quiz.title} - Q: {self.text[:50]}"


class AnswerChoice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    rationale = models.TextField(blank=True, null=True, help_text="Rationale for why this answer is correct.")

    def __str__(self):
        return self.text[:50]