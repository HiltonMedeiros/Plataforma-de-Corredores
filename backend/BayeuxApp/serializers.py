from rest_framework import serializers
from .models import Bairro, MetaConfig
from django.db.models import Sum, Q
from .models import MetaConfig, ConquistaMandala

#preparar o Ranking de Bairros
class RankingBairroSerializer(serializers.ModelSerializer):
    total_km = serializers.SerializerMethodField()

    class Meta:
        model = Bairro
        fields = ['id', 'nome', 'total_km']

    def get_total_km(self, obj):
        # Soma os km aprovados dos usuários deste bairro
        total = obj.perfil_set.aggregate(
            soma=Sum('user__atividades__distancia', 
                     filter=Q(user__atividades__status_validacao='APROVADO'))
        )['soma']
        return float(total) if total else 0.0
    
#Dashboard do Usuário    
class MetaStatusSerializer(serializers.ModelSerializer):
    conquistada = serializers.SerializerMethodField()

    class Meta:
        model = MetaConfig
        fields = ['id', 'titulo', 'distancia_objetivo', 'cor_hex', 'icone_medalha', 'conquistada']

    def get_conquistada(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return ConquistaMandala.objects.filter(user=user, meta=obj).exists()
        return False