from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views
from .export_utils import (
    exportar_inscritos_csv,
    exportar_atividades_csv,
    exportar_por_bairro_csv,
    exportar_relatorio_pdf,
)

try:
    from .export_utils import exportar_completo_excel
except ImportError:
    exportar_completo_excel = None

# Criar router para ViewSets
router = DefaultRouter()
router.register(r'auth/registro', views.RegistroViewSet, basename='registro')
router.register(r'bairros', views.BairroViewSet, basename='bairro')
router.register(r'perfil', views.PerfilViewSet, basename='perfil')
router.register(r'validacao-residencia', views.ValidacaoResidenciaViewSet, basename='validacao-residencia')
router.register(r'etapas', views.EtapaViewSet, basename='etapa')
router.register(r'metas', views.MetaConfigViewSet, basename='meta')
router.register(r'inscricoes', views.InscricaoViewSet, basename='inscricao')
router.register(r'atividades', views.AtividadeViewSet, basename='atividade')
router.register(r'conquistas', views.ConquistaMandalaViewSet, basename='conquista')
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')

urlpatterns = [
    # Rotas do router
    path('', include(router.urls)),
    
    # Autenticação por Token
    path('auth/login/', obtain_auth_token, name='api_token_auth'),
    path('auth/password-reset/', views.PasswordResetAPIView.as_view(), name='api_password_reset'),
    
    # Exportar Relatórios
    path('export/inscritos-csv/', exportar_inscritos_csv, name='export_inscritos_csv'),
    path('export/atividades-csv/', exportar_atividades_csv, name='export_atividades_csv'),
    path('export/bairros-csv/', exportar_por_bairro_csv, name='export_bairros_csv'),
    path('export/relatorio-pdf/', exportar_relatorio_pdf, name='export_relatorio_pdf'),
]

# Adicionar rota de Excel se openpyxl estiver instalado
if exportar_completo_excel:
    urlpatterns.append(
        path('export/relatorio-excel/', exportar_completo_excel, name='export_relatorio_excel'),
    )

