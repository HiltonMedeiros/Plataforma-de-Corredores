from django.apps import AppConfig


class BayeuxappConfig(AppConfig):
    name = 'BayeuxApp'

def ready(self):
    import BayeuxApp.signals