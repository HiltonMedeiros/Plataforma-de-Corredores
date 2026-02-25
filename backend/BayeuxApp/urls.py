from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RankingAPIView, DashboardUsuarioAPIView

urlpatterns = [
    #http://127.0.0.1:8000/api/login/
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    #http://127.0.0.1:8000/api/token/refresh/
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    #http://127.0.0.1:8000/api/ranking/
    path('api/ranking/', RankingAPIView.as_view(), name='api-ranking'),
    #http://127.0.0.1:8000/api/dashboard/
    path('api/dashboard/', DashboardUsuarioAPIView.as_view(), name='api-dashboard'),
]