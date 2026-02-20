from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum, Q

#DEFINIÇÃO DOS MODELOS DE DADOS PARA O PROJETO

# 1. Tabela de Bairros para integridade do Ranking
class Bairro(models.Model):
    nome = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nome

# 2. Extensão do Usuário (Perfil)
class Perfil(models.Model):
    SEXO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
        ('O', 'Outro'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    cpf = models.CharField(max_length=14, unique=True)
    whatsapp = models.CharField(max_length=20)
    data_nascimento = models.DateField()
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES)
    bairro = models.ForeignKey(Bairro, on_delete=models.PROTECT)
    aceite_lgpd = models.BooleanField(default=False)
    termo_responsabilidade = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.bairro.nome}"

# 3. Gestão de Etapas e Metas Mensais
class Etapa(models.Model):
    MODALIDADE_CHOICES = [
        ('CORRIDA', 'Corrida'),
        ('CAMINHADA', 'Caminhada'),
        ('AMBOS', 'Ambos'),
    ]
    
    nome = models.CharField(max_length=100) # Ex: Março em Movimento
    inicio = models.DateTimeField()
    fim = models.DateTimeField()
    modalidade = models.CharField(max_length=10, choices=MODALIDADE_CHOICES)
    
    # Metas de Distância Acumulada
    meta_bronze = models.DecimalField(max_digits=6, decimal_places=2, default=5.0)
    meta_prata = models.DecimalField(max_digits=6, decimal_places=2, default=10.0)
    meta_ouro = models.DecimalField(max_digits=6, decimal_places=2, default=21.0)
    meta_diamante = models.DecimalField(max_digits=6, decimal_places=2, default=42.0)

    def __str__(self):
        return self.nome

# 4. Registro de Atividades e Auditoria
class Atividade(models.Model):
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('APROVADO', 'Aprovado'),
        ('REJEITADO', 'Rejeitado'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='atividades')
    etapa = models.ForeignKey(Etapa, on_delete=models.CASCADE)
    distancia = models.DecimalField(max_digits=6, decimal_places=2)
    tempo_total = models.DurationField()
    data_atividade = models.DateField()
    print_comprovante = models.ImageField(upload_to='comprovantes/%Y/%m/')
    
    # Auditoria
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDENTE')
    auditado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='auditorias')
    data_validacao = models.DateTimeField(null=True, blank=True)
    obs_interna = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.distancia}km ({self.status})"

# 5. Histórico de Conquistas (Medalhas)
class Conquista(models.Model):
    NIVEL_CHOICES = [
        ('BRONZE', 'Bronze'),
        ('PRATA', 'Prata'),
        ('OURO', 'Ouro'),
        ('DIAMANTE', 'Diamante'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    etapa = models.ForeignKey(Etapa, on_delete=models.CASCADE)
    nivel = models.CharField(max_length=10, choices=NIVEL_CHOICES)
    data_conquista = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'etapa', 'nivel') # Impede ganhar a mesma medalha 2x na mesma etapa