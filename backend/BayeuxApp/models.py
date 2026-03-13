from django.db import models
from django.contrib.auth.models import User, AbstractUser
from django.core.validators import FileExtensionValidator, RegexValidator
from django.utils import timezone

# ==================== 1. LOCAL ====================
class Bairro(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bairros'
        verbose_name = 'Bairro'
        verbose_name_plural = 'Bairros'

    def __str__(self):
        return self.nome


# ==================== 2. PERFIL DO USUÁRIO ====================
class Perfil(models.Model):
    SEXO_CHOICES = [
        ('MASCULINO', 'Masculino'),
        ('FEMININO', 'Feminino'),
        ('OUTRO', 'Outro')
    ]
    PROVEDOR_CHOICES = [
        ('NENHUM', 'Nenhum'),
        ('STRAVA', 'Strava'),
        ('GARMIN', 'Garmin'),
        ('NIKE', 'Nike Run Club')
    ]
    STATUS_CHOICES = [
        ('ATIVO', 'Ativo'),
        ('INATIVO', 'Inativo'),
        ('BLOQUEADO', 'Bloqueado')
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    sexo = models.CharField(max_length=15, choices=SEXO_CHOICES)
    data_nascimento = models.DateField()
    cpf = models.CharField(
        max_length=14, 
        unique=True,
        validators=[RegexValidator(r'^\d{3}\.\d{3}\.\d{3}-\d{2}$', 'CPF inválido')]
    )
    telefone = models.CharField(max_length=20)
    bairro = models.ForeignKey(Bairro, on_delete=models.PROTECT, related_name='usuarios')
    provedor_gps = models.CharField(max_length=20, choices=PROVEDOR_CHOICES, default='NENHUM')
    
    # Termos e Políticas
    termo_responsabilidade = models.BooleanField(default=False)
    aceite_lgpd = models.BooleanField(default=False)
    
    # Status da Conta
    status_conta = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ATIVO')
    
    # Datas
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'perfis'
        verbose_name = 'Perfil'
        verbose_name_plural = 'Perfis'

    def __str__(self):
        return f"{self.user.username} ({self.bairro.nome})"


# ==================== 3. VALIDAÇÃO DE RESIDÊNCIA ====================
class ValidacaoResidencia(models.Model):
    STATUS_VALIDACAO = [
        ('PENDENTE', 'Pendente'),
        ('APROVADO', 'Aprovado'),
        ('REJEITADO', 'Rejeitado')
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='validacao_residencia')
    comprovante = models.FileField(
        upload_to='comprovantes_residencia/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])]
    )
    status = models.CharField(max_length=15, choices=STATUS_VALIDACAO, default='PENDENTE')
    
    # Auditoria
    auditado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='residencias_auditadas')
    data_validacao = models.DateTimeField(null=True, blank=True)
    observacao = models.TextField(blank=True, null=True)
    
    # Datas
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'validacoes_residencia'
        verbose_name = 'Validação de Residência'
        verbose_name_plural = 'Validações de Residência'

    def __str__(self):
        return f"{self.user.username} - {self.status}"


# ==================== 4. ETAPAS ====================
class Etapa(models.Model):
    STATUS_ETAPA = [
        ('PLANEJADO', 'Planejado'),
        ('EM_ANDAMENTO', 'Em Andamento'),
        ('FINALIZADO', 'Finalizado')
    ]
    MODALIDADE = [
        ('CAMINHADA', 'Caminhada'),
        ('CORRIDA', 'Corrida'),
        ('AMBOS', 'Ambos')
    ]

    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    data_inicio = models.DateTimeField()
    data_fim = models.DateTimeField()
    modalidade = models.CharField(max_length=20, choices=MODALIDADE)
    status = models.CharField(max_length=20, choices=STATUS_ETAPA, default='PLANEJADO')
    
    # Campos adicionais
    imagem = models.ImageField(upload_to='etapas/%Y/%m/%d/', null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'etapas'
        verbose_name = 'Etapa'
        verbose_name_plural = 'Etapas'
        ordering = ['-data_inicio']

    def __str__(self):
        return self.nome


# ==================== 5. METAS DE ETAPAS ====================
class MetaConfig(models.Model):
    etapa = models.ForeignKey(Etapa, on_delete=models.CASCADE, related_name='metas')
    titulo = models.CharField(max_length=50)  # Ex: Bronze, Prata, Ouro, Diamante
    distancia_objetivo = models.DecimalField(max_digits=10, decimal_places=2)
    cor_hex = models.CharField(max_length=7, default='#3498db', help_text="Ex: #FFD700")
    icone_medalha = models.ImageField(upload_to='medalhas/', null=True, blank=True)
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'metas_config'
        verbose_name = 'Meta'
        verbose_name_plural = 'Metas'
        ordering = ['distancia_objetivo']
        unique_together = ('etapa', 'titulo')

    def __str__(self):
        return f"{self.etapa.nome} - {self.titulo} ({self.distancia_objetivo}km)"


# ==================== 6. INSCRIÇÃO EM ETAPAS ====================
class Inscricao(models.Model):
    STATUS_INSCRICAO = [
        ('ATIVA', 'Ativa'),
        ('CANCELADA', 'Cancelada'),
        ('CONCLUIDA', 'Concluída')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inscricoes')
    etapa = models.ForeignKey(Etapa, on_delete=models.CASCADE, related_name='inscricoes')
    status = models.CharField(max_length=15, choices=STATUS_INSCRICAO, default='ATIVA')
    
    data_inscricao = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inscricoes'
        verbose_name = 'Inscrição'
        verbose_name_plural = 'Inscrições'
        unique_together = ('user', 'etapa')
        ordering = ['-data_inscricao']

    def __str__(self):
        return f"{self.user.username} - {self.etapa.nome}"


# ==================== 7. ATIVIDADES ====================
class Atividade(models.Model):
    REGISTRO_CHOICES = [
        ('GPS', 'GPS'),
        ('MANUAL', 'Manual')
    ]
    VALIDACAO_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('APROVADO', 'Aprovado'),
        ('REJEITADO', 'Rejeitado')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='atividades')
    etapa = models.ForeignKey(Etapa, on_delete=models.CASCADE, related_name='atividades')
    distancia = models.DecimalField(max_digits=10, decimal_places=2)
    tempo_total = models.TimeField()
    data_atividade = models.DateField()
    tipo_registro = models.CharField(max_length=10, choices=REGISTRO_CHOICES)
    comprovante = models.ImageField(
        upload_to='comprovantes_atividades/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])]
    )
    
    # Auditoria
    status_validacao = models.CharField(max_length=15, choices=VALIDACAO_CHOICES, default='PENDENTE')
    auditado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='atividades_auditadas')
    data_validacao = models.DateTimeField(null=True, blank=True)
    observacao_auditoria = models.TextField(blank=True, null=True)
    
    # Datas
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'atividades'
        verbose_name = 'Atividade'
        verbose_name_plural = 'Atividades'
        ordering = ['-data_atividade']

    def __str__(self):
        return f"{self.user.username} - {self.distancia}km em {self.data_atividade}"


# ==================== 8. CONQUISTAS MANDALA ====================
class ConquistaMandala(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conquistas')
    meta = models.ForeignKey(MetaConfig, on_delete=models.CASCADE, related_name='conquistas')
    data_conquista = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'conquistas_mandala'
        verbose_name = 'Conquista'
        verbose_name_plural = 'Conquistas'
        unique_together = ('user', 'meta')  # Garante que o usuário ganha a medalha só uma vez
        ordering = ['-data_conquista']

    def __str__(self):
        return f"{self.user.username} - {self.meta.titulo}"