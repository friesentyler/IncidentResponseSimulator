from django.db import models


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

    class Meta:
        verbose_name = 'Scenario'