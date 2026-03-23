from django.contrib import admin
from .models import ScenarioModel, Quiz, Question, AnswerChoice, ScenarioCredential

admin.site.register(ScenarioModel)
admin.site.register(ScenarioCredential)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(AnswerChoice)

