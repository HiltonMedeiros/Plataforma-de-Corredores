from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Bairro, Perfil, ValidacaoResidencia, Etapa, 
    MetaConfig, Inscricao, Atividade, ConquistaMandala
)


# ==================== USUÁRIOS ====================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)


class UserRegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    # Perfil / validação de residência
    sexo = serializers.ChoiceField(choices=Perfil.SEXO_CHOICES, write_only=True)
    data_nascimento = serializers.DateField(write_only=True)
    cpf = serializers.CharField(write_only=True)
    telefone = serializers.CharField(write_only=True)
    bairro = serializers.PrimaryKeyRelatedField(queryset=Bairro.objects.all(), write_only=True)
    termo_responsabilidade = serializers.BooleanField(write_only=True)
    aceite_lgpd = serializers.BooleanField(write_only=True)
    comprovante = serializers.FileField(required=False, write_only=True)

    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'sexo',
            'data_nascimento',
            'cpf',
            'telefone',
            'bairro',
            'termo_responsabilidade',
            'aceite_lgpd',
            'comprovante',
        )

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'As senhas não correspondem.'})
        return data

    def create(self, validated_data):
        comprovante = validated_data.pop('comprovante', None)
        perfil_data = {
            'sexo': validated_data.pop('sexo'),
            'data_nascimento': validated_data.pop('data_nascimento'),
            'cpf': validated_data.pop('cpf'),
            'telefone': validated_data.pop('telefone'),
            'bairro': validated_data.pop('bairro'),
            'termo_responsabilidade': validated_data.pop('termo_responsabilidade'),
            'aceite_lgpd': validated_data.pop('aceite_lgpd'),
        }

        validated_data.pop('password_confirm')

        # Use email as username when none is provided
        if not validated_data.get('username'):
            validated_data['username'] = validated_data.get('email')

        user = User.objects.create_user(**validated_data)

        # Cria perfil
        Perfil.objects.create(user=user, **perfil_data)

        # Cria validação de residência se houver comprovante
        if comprovante:
            ValidacaoResidencia.objects.create(user=user, comprovante=comprovante)

        return user


# ==================== BAIRROS ====================
class BairroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bairro
        fields = ('id', 'nome')
        read_only_fields = ('id',)


# ==================== PERFIL ====================
class PerfilSerializer(serializers.ModelSerializer):
    bairro_nome = serializers.CharField(source='bairro.nome', read_only=True)
    usuario_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Perfil
        fields = (
            'id', 'user', 'usuario_username', 'sexo', 'data_nascimento', 
            'cpf', 'telefone', 'bairro', 'bairro_nome', 'provedor_gps',
            'termo_responsabilidade', 'aceite_lgpd', 'status_conta', 'criado_em'
        )
        read_only_fields = ('id', 'criado_em', 'usuario_username', 'bairro_nome')


class PerfilCriarSerializer(serializers.ModelSerializer):
    """Serializer para criar perfil do usuário durante o registro."""
    class Meta:
        model = Perfil
        fields = (
            'user', 'sexo', 'data_nascimento', 'cpf', 'telefone', 
            'bairro', 'termo_responsabilidade', 'aceite_lgpd'
        )

    def validate_cpf(self, value):
        """Valida formato do CPF XXX.XXX.XXX-XX"""
        import re
        if not re.match(r'^\d{3}\.\d{3}\.\d{3}-\d{2}$', value):
            raise serializers.ValidationError('CPF deve estar no formato XXX.XXX.XXX-XX')
        return value

    def validate_telefone(self, value):
        """Valida formato do telefone (XX) XXXXX-XXXX"""
        import re
        if not re.match(r'^[\(\)0-9\s-]+$', value):
            raise serializers.ValidationError('Telefone inválido')
        return value

    def create(self, validated_data):
        """Associa automaticamente o `user` autenticado ao criar o perfil."""
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            raise serializers.ValidationError({'user': 'Usuário não autenticado.'})
        validated_data['user'] = user
        return super().create(validated_data)


# ==================== VALIDAÇÃO DE RESIDÊNCIA ====================
class ValidacaoResidenciaSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='user.username', read_only=True)
    auditado_por_nome = serializers.CharField(source='auditado_por.username', read_only=True)

    class Meta:
        model = ValidacaoResidencia
        fields = (
            'id', 'user', 'usuario_username', 'comprovante', 'status',
            'auditado_por', 'auditado_por_nome', 'data_validacao', 
            'observacao', 'criado_em'
        )
        read_only_fields = ('id', 'criado_em', 'usuario_username', 'auditado_por_nome')


class ValidacaoResidenciaCriarSerializer(serializers.ModelSerializer):
    """Serializer para submeter comprovante de residência durante o registro."""
    class Meta:
        model = ValidacaoResidencia
        fields = ('user', 'comprovante')

    def validate_comprovante(self, value):
        """Valida tamanho e tipo do arquivo."""
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError('Arquivo não pode exceder 5MB')
        
        allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png']
        file_name = value.name.lower()
        if not any(file_name.endswith(ext) for ext in allowed_extensions):
            raise serializers.ValidationError('Apenas PDF, JPG, JPEG e PNG são permitidos')
        
        return value


# ==================== ETAPAS ====================
class EtapaSerializer(serializers.ModelSerializer):
    total_inscritos = serializers.SerializerMethodField()
    total_atividades_aprovadas = serializers.SerializerMethodField()

    class Meta:
        model = Etapa
        fields = (
            'id', 'nome', 'descricao', 'data_inicio', 'data_fim',
            'modalidade', 'status', 'imagem', 'total_inscritos',
            'total_atividades_aprovadas', 'criado_em'
        )
        read_only_fields = ('id', 'criado_em')

    def get_total_inscritos(self, obj):
        return obj.inscricoes.filter(status='ATIVA').count()

    def get_total_atividades_aprovadas(self, obj):
        return obj.atividades.filter(status_validacao='APROVADO').count()


# ==================== METAS ====================
class MetaConfigSerializer(serializers.ModelSerializer):
    etapa_nome = serializers.CharField(source='etapa.nome', read_only=True)
    total_conquistadores = serializers.SerializerMethodField()

    class Meta:
        model = MetaConfig
        fields = (
            'id', 'etapa', 'etapa_nome', 'titulo', 'distancia_objetivo',
            'cor_hex', 'icone_medalha', 'total_conquistadores', 'criado_em'
        )
        read_only_fields = ('id', 'criado_em', 'etapa_nome')

    def get_total_conquistadores(self, obj):
        return obj.conquistas.count()


# ==================== INSCRIÇÕES ====================
class InscricaoSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='user.username', read_only=True)
    etapa_nome = serializers.CharField(source='etapa.nome', read_only=True)

    class Meta:
        model = Inscricao
        fields = (
            'id', 'user', 'usuario_username', 'etapa', 'etapa_nome',
            'status', 'data_inscricao'
        )
        read_only_fields = ('id', 'data_inscricao', 'usuario_username', 'etapa_nome')


# ==================== ATIVIDADES ====================
class AtividadeSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='user.username', read_only=True)
    etapa_nome = serializers.CharField(source='etapa.nome', read_only=True)
    auditado_por_nome = serializers.CharField(source='auditado_por.username', read_only=True)

    class Meta:
        model = Atividade
        fields = (
            'id', 'user', 'usuario_username', 'etapa', 'etapa_nome',
            'distancia', 'tempo_total', 'data_atividade', 'tipo_registro',
            'comprovante', 'status_validacao', 'auditado_por', 
            'auditado_por_nome', 'data_validacao', 'observacao_auditoria', 'criado_em'
        )
        read_only_fields = ('id', 'criado_em', 'usuario_username', 'etapa_nome', 'auditado_por_nome')


# ==================== CONQUISTAS ====================
class ConquistaMandalaSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='user.username', read_only=True)
    meta_titulo = serializers.CharField(source='meta.titulo', read_only=True)
    meta_cor = serializers.CharField(source='meta.cor_hex', read_only=True)
    meta_icone = serializers.ImageField(source='meta.icone_medalha', read_only=True)
    etapa_nome = serializers.CharField(source='meta.etapa.nome', read_only=True)

    class Meta:
        model = ConquistaMandala
        fields = (
            'id', 'user', 'usuario_username', 'meta', 'meta_titulo',
            'meta_cor', 'meta_icone', 'etapa_nome', 'data_conquista'
        )
        read_only_fields = ('id', 'data_conquista', 'usuario_username', 'meta_titulo', 'meta_cor', 'meta_icone', 'etapa_nome')


# ==================== DASHBOARD ====================
class ProgressoEtapaSerializer(serializers.Serializer):
    """Serializer para mostrar progresso de um usuário em uma etapa."""
    etapa_id = serializers.IntegerField()
    etapa_nome = serializers.CharField()
    distancia_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    metas = MetaConfigSerializer(many=True)
    conquistas = ConquistaMandalaSerializer(many=True)
    proxima_meta = serializers.SerializerMethodField()

    def get_proxima_meta(self, obj):
        # Retorna a próxima meta não conquistada
        metas_conquistadas = [c.meta.id for c in obj.get('conquistas', [])]
        for meta in obj.get('metas', []):
            if meta.id not in metas_conquistadas:
                return {
                    'id': meta.id,
                    'titulo': meta.titulo,
                    'distancia_objetivo': meta.distancia_objetivo,
                    'progresso_percentual': (obj['distancia_total'] / meta.distancia_objetivo) * 100 if meta.distancia_objetivo > 0 else 0
                }
        return None
