from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator

# 1. Local
class Bairro(models.Model):
    nome = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nome

# 2. Cidadão
class Perfil(models.Model):
    SEXO_CHOICES = [('MASCULINO', 'Masculino'), ('FEMININO', 'Feminino'), ('OUTRO', 'Outro')]
    PROVEDOR_CHOICES = [('NENHUM', 'Nenhum'), ('STRAVA', 'Strava'), ('GARMIN', 'Garmin'), ('NIKE', 'Nike Run Club')]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    sexo = models.CharField(max_length=15, choices=SEXO_CHOICES)
    data_nascimento = models.DateField()
    cpf = models.CharField(max_length=14, unique=True)
    telefone = models.CharField(max_length=20)
    bairro = models.ForeignKey(Bairro, on_delete=models.PROTECT)
    provedor_gps = models.CharField(max_length=20, choices=PROVEDOR_CHOICES, default='NENHUM')
    
    termo_responsabilidade = models.BooleanField(default=False)
    aceite_lgpd = models.BooleanField(default=False)
    status_conta = models.CharField(max_length=20, default='ATIVO')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.bairro.nome})"

# 3. Etapas
class Etapa(models.Model):
    STATUS_ETAPA = [('PLANEJADO', 'Planejado'), ('EM_ANDAMENTO', 'Em Andamento'), ('FINALIZADO', 'Finalizado')]
    MODALIDADE = [('CAMINHADA', 'Caminhada'), ('CORRIDA', 'Corrida'), ('AMBOS', 'Ambos')]

    name = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    modalidade = models.CharField(max_length=20, choices=MODALIDADE)
    status = models.CharField(max_length=20, choices=STATUS_ETAPA, default='PLANEJADO')

    def __str__(self):
        return self.name

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
        return f"{self.etapa.name} - {self.titulo} ({self.distancia_objetivo}km)"

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