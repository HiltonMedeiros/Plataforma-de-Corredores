from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Perfil, Atividade, ConquistaMandala, MetaConfig
from django.db.models import Sum

# 1: Criar Perfil automaticamente ao criar User
@receiver(post_save, sender=User)
def criar_perfil_usuario(sender, instance, created, **kwargs):
    if created:
        # O 'username' fornecido no cadastro será o CPF
        Perfil.objects.create(
            user=instance, 
            cpf=instance.username, # Aqui fazemos a mágica
            status_conta='PENDENTE_DADOS'
        )

# 2: Verificar Medalhas ao aprovar uma Atividade
@receiver(post_save, sender=Atividade)
def verificar_conquistas(sender, instance, **kwargs):
    if instance.status_validacao == 'APROVADO':
        user = instance.user
        etapa = instance.etapa
        
        # Soma o total de KM aprovados do usuário NESTA etapa
        total_km = Atividade.objects.filter(
            user=user, 
            etapa=etapa, 
            status_validacao='APROVADO'
        ).aggregate(Sum('distancia'))['distancia__sum'] or 0

        # Busca metas da etapa que o usuário ainda não conquistou
        metas_disponiveis = MetaConfig.objects.filter(
            etapa=etapa, 
            distancia_objetivo__lte=total_km
        ).exclude(conquistamandala__user=user)

        # Registra a conquista para cada meta alcançada
        for meta in metas_disponiveis:
            ConquistaMandala.objects.get_or_create(user=user, meta=meta)