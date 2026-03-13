import os

from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db.models import Sum, Count, Q
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils import timezone
from django.conf import settings
from datetime import timedelta

from .models import (
    Bairro, Perfil, ValidacaoResidencia, Etapa, 
    MetaConfig, Inscricao, Atividade, ConquistaMandala
)
from .serializers import (
    UserSerializer, UserRegistroSerializer, BairroSerializer, PerfilSerializer,
    PerfilCriarSerializer, ValidacaoResidenciaSerializer, ValidacaoResidenciaCriarSerializer,
    EtapaSerializer, MetaConfigSerializer,
    InscricaoSerializer, AtividadeSerializer, ConquistaMandalaSerializer
)


# ==================== AUTENTICAÇÃO ====================
class RegistroViewSet(viewsets.ModelViewSet):
    """ViewSet para registrar novos usuários."""
    serializer_class = UserRegistroSerializer
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Criar um token para autenticação
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'mensagem': 'Usuário registrado com sucesso!'
        }, status=status.HTTP_201_CREATED)


class PasswordResetAPIView(APIView):
    """Endpoint para solicitar redefinição de senha via email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Segurança: não revelar se o email existe
            return Response({'detail': 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'})

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-senha?uid={uid}&token={token}"

        send_mail(
            subject='Redefinição de senha - Bayeux Move',
            message=f"Olá {user.get_full_name() or user.username},\n\nPara redefinir sua senha, acesse: {reset_link}\n\nCaso não tenha solicitado, ignore esta mensagem.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )

        return Response({'detail': 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'})


# ==================== BAIRROS ====================
class BairroViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para listar bairros."""
    queryset = Bairro.objects.all()
    serializer_class = BairroSerializer
    permission_classes = [permissions.AllowAny]


# ==================== PERFIL ====================
class PerfilViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar perfis de usuários."""
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        return Perfil.objects.filter(user=user)

    def get_serializer_class(self):
        """Retorna o serializer apropriado baseado na ação."""
        if self.action == 'create':
            return PerfilCriarSerializer
        return PerfilSerializer

    def get_object(self):
        return self.get_queryset().first()

    @action(detail=False, methods=['get'])
    def meu_perfil(self, request):
        """Retorna o perfil do usuário autenticado."""
        try:
            perfil = Perfil.objects.get(user=request.user)
            serializer = PerfilSerializer(perfil)
            return Response(serializer.data)
        except Perfil.DoesNotExist:
            return Response(
                {'erro': 'Perfil não encontrado. Complete seu cadastro.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def perform_create(self, serializer):
        """Assegura que o perfil criado será associado ao usuário autenticado."""
        serializer.save(user=self.request.user)


# ==================== VALIDAÇÃO DE RESIDÊNCIA ====================
class ValidacaoResidenciaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar validações de residência."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ValidacaoResidencia.objects.all()
        return ValidacaoResidencia.objects.filter(user=user)

    def get_serializer_class(self):
        """Retorna o serializer apropriado baseado na ação."""
        if self.action == 'create':
            return ValidacaoResidenciaCriarSerializer
        return ValidacaoResidenciaSerializer

    def create(self, request, *args, **kwargs):
        """Criar uma validação de residência."""
        validacao, created = ValidacaoResidencia.objects.get_or_create(
            user=request.user,
            defaults={'comprovante': request.FILES.get('comprovante')}
        )
        
        if not created:
            validacao.comprovante = request.FILES.get('comprovante')
            validacao.status = 'PENDENTE'
            validacao.save()
        
        serializer = ValidacaoResidenciaSerializer(validacao)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def aprovar(self, request):
        """Aprovar validação de residência - Admin only."""
        validacao_id = request.data.get('validacao_id')
        observacao = request.data.get('observacao', '')
        
        try:
            validacao = ValidacaoResidencia.objects.get(id=validacao_id)
            validacao.status = 'APROVADO'
            validacao.auditado_por = request.user
            validacao.data_validacao = timezone.now()
            validacao.observacao = observacao
            validacao.save()
            
            serializer = self.get_serializer(validacao)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidacaoResidencia.DoesNotExist:
            return Response(
                {'erro': 'Validação não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def rejeitar(self, request):
        """Rejeitar validação de residência - Admin only."""
        validacao_id = request.data.get('validacao_id')
        observacao = request.data.get('observacao', 'Comprovante inválido')
        
        try:
            validacao = ValidacaoResidencia.objects.get(id=validacao_id)
            validacao.status = 'REJEITADO'
            validacao.auditado_por = request.user
            validacao.data_validacao = timezone.now()
            validacao.observacao = observacao
            validacao.save()
            
            serializer = self.get_serializer(validacao)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidacaoResidencia.DoesNotExist:
            return Response(
                {'erro': 'Validação não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )


# ==================== ETAPAS ====================
class EtapaViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar etapas."""
    queryset = Etapa.objects.all()
    serializer_class = EtapaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['get'])
    def metas(self, request, pk=None):
        """Retorna todas as metas de uma etapa."""
        etapa = self.get_object()
        metas = etapa.metas.all()
        serializer = MetaConfigSerializer(metas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def inscritos(self, request, pk=None):
        """Retorna quantidade de inscritos em uma etapa."""
        etapa = self.get_object()
        total = etapa.inscricoes.filter(status='ATIVA').count()
        return Response({'total_inscritos': total})


# ==================== METAS ====================
class MetaConfigViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar metas de etapas."""
    queryset = MetaConfig.objects.all()
    serializer_class = MetaConfigSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ==================== INSCRIÇÕES ====================
class InscricaoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar inscrições em etapas."""
    serializer_class = InscricaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Inscricao.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        """Inscrever usuário em uma etapa."""
        etapa_id = request.data.get('etapa')
        
        try:
            etapa = Etapa.objects.get(id=etapa_id)
            inscricao, created = Inscricao.objects.get_or_create(
                user=request.user,
                etapa=etapa,
                defaults={'status': 'ATIVA'}
            )
            
            if not created and inscricao.status == 'CANCELADA':
                inscricao.status = 'ATIVA'
                inscricao.save()
            
            serializer = self.get_serializer(inscricao)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Etapa.DoesNotExist:
            return Response(
                {'erro': 'Etapa não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def minhas_inscricoes(self, request):
        """Retorna todas as inscrições do usuário autenticado."""
        inscricoes = self.get_queryset().filter(status='ATIVA')
        serializer = self.get_serializer(inscricoes, many=True)
        return Response(serializer.data)


# ==================== ATIVIDADES ====================
class AtividadeViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar atividades."""
    serializer_class = AtividadeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Atividade.objects.all()
        return Atividade.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        """Criar uma nova atividade."""
        request.data._mutable = True
        request.data['user'] = request.user.id
        request.data._mutable = False
        
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def minhas_atividades(self, request):
        """Retorna todas as atividades do usuário autenticado."""
        atividades = Atividade.objects.filter(user=request.user).order_by('-data_atividade')
        serializer = self.get_serializer(atividades, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pendentes_auditoria(self, request):
        """Retorna atividades pendentes de auditoria - Admin only."""
        if not request.user.is_staff:
            return Response(
                {'erro': 'Permissão negada'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        atividades = Atividade.objects.filter(status_validacao='PENDENTE').order_by('-criado_em')
        serializer = self.get_serializer(atividades, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def aprovar(self, request):
        """Aprovar uma atividade - Admin only."""
        atividade_id = request.data.get('atividade_id')
        observacao = request.data.get('observacao', '')
        
        try:
            atividade = Atividade.objects.get(id=atividade_id)
            atividade.status_validacao = 'APROVADO'
            atividade.auditado_por = request.user
            atividade.data_validacao = timezone.now()
            atividade.observacao_auditoria = observacao
            atividade.save()
            
            # Verificar se o usuário conquistou alguma meta
            distancia_total = Atividade.objects.filter(
                user=atividade.user,
                etapa=atividade.etapa,
                status_validacao='APROVADO'
            ).aggregate(total=Sum('distancia'))['total'] or 0
            
            for meta in atividade.etapa.metas.all():
                conquistada = ConquistaMandala.objects.filter(
                    user=atividade.user,
                    meta=meta
                ).exists()
                
                if not conquistada and distancia_total >= meta.distancia_objetivo:
                    ConquistaMandala.objects.create(
                        user=atividade.user,
                        meta=meta
                    )
            
            serializer = self.get_serializer(atividade)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Atividade.DoesNotExist:
            return Response(
                {'erro': 'Atividade não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def rejeitar(self, request):
        """Rejeitar uma atividade - Admin only."""
        atividade_id = request.data.get('atividade_id')
        observacao = request.data.get('observacao', 'Comprovante inválido')
        
        try:
            atividade = Atividade.objects.get(id=atividade_id)
            atividade.status_validacao = 'REJEITADO'
            atividade.auditado_por = request.user
            atividade.data_validacao = timezone.now()
            atividade.observacao_auditoria = observacao
            atividade.save()
            
            serializer = self.get_serializer(atividade)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Atividade.DoesNotExist:
            return Response(
                {'erro': 'Atividade não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )


# ==================== CONQUISTAS ====================
class ConquistaMandalaViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar conquistas."""
    serializer_class = ConquistaMandalaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ConquistaMandala.objects.filter(user=user).order_by('-data_conquista')

    @action(detail=False, methods=['get'])
    def minhas_conquistas(self, request):
        """Retorna todas as conquistas do usuário autenticado."""
        conquistas = self.get_queryset()
        serializer = self.get_serializer(conquistas, many=True)
        return Response(serializer.data)


# ==================== DASHBOARD/ANALYTICS ====================
class DashboardViewSet(viewsets.ViewSet):
    """ViewSet para dados do dashboard administrativo."""
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def resumo_geral(self, request):
        """Retorna resumo geral para o admin."""
        total_usuarios = User.objects.count()
        total_inscritos = Inscricao.objects.filter(status='ATIVA').count()
        total_atividades_pendentes = Atividade.objects.filter(status_validacao='PENDENTE').count()
        total_atividades_aprovadas = Atividade.objects.filter(status_validacao='APROVADO').count()
        total_validacoes_pendentes = ValidacaoResidencia.objects.filter(status='PENDENTE').count()

        return Response({
            'total_usuarios': total_usuarios,
            'total_inscritos': total_inscritos,
            'total_atividades_pendentes': total_atividades_pendentes,
            'total_atividades_aprovadas': total_atividades_aprovadas,
            'total_validacoes_pendentes': total_validacoes_pendentes,
        })

    @action(detail=False, methods=['get'])
    def participacao_por_bairro(self, request):
        """Retorna distribuição de participação por bairro."""
        bairros = Bairro.objects.annotate(
            total_inscritos=Count('usuarios__user__inscricoes', 
                                filter=Q(usuarios__user__inscricoes__status='ATIVA')),
            total_atividades_aprovadas=Count('usuarios__perfil__user__atividades',
                                            filter=Q(usuarios__perfil__user__atividades__status_validacao='APROVADO'))
        ).values('id', 'nome', 'total_inscritos', 'total_atividades_aprovadas')
        
        return Response(list(bairros))

    @action(detail=False, methods=['get'])
    def progresso_etapas(self, request):
        """Retorna progresso de todas as etapas."""
        etapas = Etapa.objects.all()
        data = []
        
        for etapa in etapas:
            total_participantes = etapa.inscricoes.filter(status='ATIVA').count()
            atividades_aprovadas = etapa.atividades.filter(status_validacao='APROVADO').count()
            
            data.append({
                'id': etapa.id,
                'nome': etapa.nome,
                'status': etapa.status,
                'total_participantes': total_participantes,
                'atividades_aprovadas': atividades_aprovadas,
                'data_inicio': etapa.data_inicio,
                'data_fim': etapa.data_fim,
            })
        
        return Response(data)
