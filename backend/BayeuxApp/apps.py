from django.apps import AppConfig

class BayeuxappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'BayeuxApp'

    def ready(self):
        import BayeuxApp.signals  