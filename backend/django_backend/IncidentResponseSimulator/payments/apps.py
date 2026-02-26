from django.apps import AppConfig


class PaymentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'IncidentResponseSimulator.payments'
    verbose_name = 'Payments'

    def ready(self):
        import IncidentResponseSimulator.payments.signals  # noqa: F401
