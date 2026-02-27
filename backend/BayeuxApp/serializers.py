import re
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Bairro, MetaConfig
from django.db.models import Sum, Q
from .models import MetaConfig, ConquistaMandala, Perfil

#REGRISTRO DE USUÁRIO COM LIMPEZA DE CPF E VALIDAÇÃO DE UNICIDADE 
class RegisterSerializer(serializers.ModelSerializer):
    # Campos extras que não existem no User padrão, mas queremos coletar
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ('username', 'password')
        extra_kwargs = {
            'username': {'required': True},
        }

    def validate_username(self, value):
        """
        Aqui acontece a limpeza: Se o usuário digitar '123.456.789-01',
        o sistema limpa para '12345678901'.
        """
        # Remove tudo que não for número
        cpf_limpo = re.sub(r'[^0-9]', '', value)

        # Valida se tem 11 dígitos
        if len(cpf_limpo) != 11:
            raise serializers.ValidationError("O CPF deve conter exatamente 11 números.")
        
        # Verifica se já existe um usuário com esse CPF (username)
        if User.objects.filter(username=cpf_limpo).exists():
            raise serializers.ValidationError("Este CPF já está cadastrado.")

        return cpf_limpo

    def create(self, validated_data):
        """
        Cria o User com o username limpo e a senha criptografada.
        O Signal que criamos antes cuidará de criar o Perfil automaticamente.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

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