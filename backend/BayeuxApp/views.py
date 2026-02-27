from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .serializers import RegisterSerializer
from .models import Bairro
from .serializers import RankingBairroSerializer
from django.db.models import Sum

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,) # Qualquer pessoa pode se cadastrar
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "mensagem": "Usuário cadastrado com sucesso!",
                "cpf": user.username,
                "status": "PENDENTE_DADOS"
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RankingAPIView(APIView):
    # Remova restrições de permissão para teste (aberto ao público)
    permission_classes = [] 
    authentication_classes = []

    def get(self, request):
        try:
            bairros = Bairro.objects.all()
            serializer = RankingBairroSerializer(bairros, many=True)
            # Uma forma mais segura de ordenar caso total_km seja None
            dados = sorted(serializer.data, key=lambda x: x.get('total_km', 0), reverse=True)
            return Response(dados)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class DashboardUsuarioAPIView(APIView):
    permission_classes = [IsAuthenticated] # Só usuários logados vêem seu dashboard

    def get(self, request):
        user = request.user
        # Soma total de KM do usuário na etapa ativa
        total_km = Atividade.objects.filter(
            user=user, 
            status_validacao='APROVADO'
        ).aggregate(Sum('distancia'))['distancia__sum'] or 0

        # Busca todas as metas para mostrar o progresso
        metas = MetaConfig.objects.all()
        serializer_metas = MetaStatusSerializer(metas, many=True, context={'request': request})

        return Response({
            "nome": user.username,
            "distancia_total": float(total_km),
            "metas": serializer_metas.data
        })