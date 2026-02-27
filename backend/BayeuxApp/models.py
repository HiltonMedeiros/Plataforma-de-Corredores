from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator

# 1. Local
class Bairro(models.Model):
    nome = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nome

# 2. Cidadão (Perfil do Atleta)
class Perfil(models.Model):
    SEXO_CHOICES = [('MASCULINO', 'Masculino'), ('FEMININO', 'Feminino'), ('OUTRO', 'Outro')]
    PROVEDOR_CHOICES = [('NENHUM', 'Nenhum'), ('STRAVA', 'Strava'), ('GARMIN', 'Garmin'), ('NIKE', 'Nike Run Club')]
    
    # Novos estados para o seu fluxo de aprovação
    STATUS_CONTA = [
        ('PENDENTE_DADOS', 'Pendente de Dados'),
        ('AGUARDANDO_VALIDACAO', 'Aguardando Validação de Residência'),
        ('ATIVO', 'Ativo'),
        ('REJEITADO', 'Rejeitado'),
        ('BLOQUEADO', 'Bloqueado'),
    ]
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    
    # Adicionamos null=True e blank=True para permitir o cadastro em etapas
    sexo = models.CharField(max_length=15, choices=SEXO_CHOICES, null=True, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    bairro = models.ForeignKey(Bairro, on_delete=models.PROTECT, null=True, blank=True)
    
    # Campo para o upload do comprovante
    comprovante_residencia = models.FileField(
        upload_to='comprovantes_residencia/%Y/%m/', 
        null=True, 
        blank=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])]
    )
    
    provedor_gps = models.CharField(max_length=20, choices=PROVEDOR_CHOICES, default='NENHUM')
    termo_responsabilidade = models.BooleanField(default=False)
    aceite_lgpd = models.BooleanField(default=False)
    
    # Status inicial agora é 'PENDENTE_DADOS'
    status_conta = models.CharField(
        max_length=25, 
        choices=STATUS_CONTA, 
        default='PENDENTE_DADOS'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.status_conta}"
    
# 3. Etapas (Unificada: Dados de Período + Referência de Mês)
class Etapa(models.Model):
    STATUS_ETAPA = [('PLANEJADO', 'Planejado'), ('EM_ANDAMENTO', 'Em Andamento'), ('FINALIZADO', 'Finalizado')]
    MODALIDADE = [('CAMINHADA', 'Caminhada'), ('CORRIDA', 'Corrida'), ('AMBOS', 'Ambos')]

    nome = models.CharField(max_length=255) # Ex: Desafio de Verão / Janeiro 2026
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    modalidade = models.CharField(max_length=20, choices=MODALIDADE)
    status = models.CharField(max_length=20, choices=STATUS_ETAPA, default='PLANEJADO')
    
    # Campos para organização do Dashboard
    mes_referencia = models.IntegerField(help_text="1 para Janeiro, 2 para Fevereiro...")
    ano_referencia = models.IntegerField(default=2026)
    ativa = models.BooleanField(default=True)

    def __str__(self):
        return self.nome

# 4. Metas(BRONZE, PRATA OU OURO)
class MetaConfig(models.Model):
    etapa = models.ForeignKey(Etapa, on_delete=models.CASCADE, related_name='metas')
    titulo = models.CharField(max_length=50) # Ex: Bronze, Prata...
    distancia_objetivo = models.DecimalField(max_digits=10, decimal_places=2)
    cor_hex = models.CharField(max_length=7, default='#3498db', help_text="Ex: #FFD700")
    icone_medalha = models.ImageField(upload_to='medalhas/', null=True, blank=True)

    class Meta:
        ordering = ['distancia_objetivo']

    def __str__(self):
        # Mude de self.etapa.name para self.etapa.nome
        return f"{self.etapa.nome} - {self.titulo} ({self.distancia_objetivo}km)"

# 5. Atividades
class Atividade(models.Model):
    REGISTRO_CHOICES = [('GPS', 'GPS'), ('MANUAL', 'Manual')]
    VALIDACAO_CHOICES = [('PENDENTE', 'Pendente'), ('APROVADO', 'Aprovado'), ('REJEITADO', 'Rejeitado')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='atividades')
    etapa = models.ForeignKey(Etapa, on_delete=models.CASCADE)
    distancia = models.DecimalField(max_digits=10, decimal_places=2)
    tempo_total = models.TimeField()
    data_atividade = models.DateField()
    tipo_registro = models.CharField(max_length=10, choices=REGISTRO_CHOICES)
    foto_atividade_url = models.ImageField(upload_to='comprovantes/%Y/%m/%d/')
    
    # Auditoria
    status_validacao = models.CharField(max_length=10, choices=VALIDACAO_CHOICES, default='PENDENTE')
    auditado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='atividades_auditadas')
    data_validacao = models.DateTimeField(null=True, blank=True)
    observacao_auditoria = models.TextField(blank=True, null=True)

# 6. Conquistas Alcançadas
class ConquistaMandala(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    meta = models.ForeignKey(MetaConfig, on_delete=models.CASCADE)
    data_conquista = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'meta') # Garante que o usuário ganha a medalha só uma vez