from django.contrib import admin
from django import forms
from tinymce.widgets import TinyMCE
from .models import ScenarioModel, Quiz, Question, AnswerChoice, ScenarioCredential

class ScenarioModelForm(forms.ModelForm):
    class Meta:
        model = ScenarioModel
        fields = '__all__'
        widgets = {
            'scenario_description': TinyMCE(attrs={'cols': 80, 'rows': 30}),
        }

@admin.register(ScenarioModel)
class ScenarioModelAdmin(admin.ModelAdmin):
    form = ScenarioModelForm
admin.site.register(ScenarioCredential)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(AnswerChoice)

