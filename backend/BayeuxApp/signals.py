from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum
from .models import Atividade, MetaConfig, ConquistaMandala

@receiver(post_save, sender=Atividade)
def verificar_conquistas(sender, instance, **kwargs):
    # Só age se a atividade for aprovada
    if instance.status_validacao == 'APROVADO':
        user = instance.user
        etapa = instance.etapa
        
        # 1. Soma o total de KM aprovados do usuário nesta etapa
        total_km = Atividade.objects.filter(
            user=user, 
            etapa=etapa, 
            status_validacao='APROVADO'
        ).aggregate(Sum('distancia'))['distancia__sum'] or 0

        # 2. Busca metas que ele atingiu mas ainda não tem a conquista registrada
        metas_atingidas = MetaConfig.objects.filter(
            etapa=etapa,
            distancia_objetivo__lte=total_km
        )

        for meta in metas_atingidas:
            # Cria a conquista se ela não existir (unique_together evita duplicatas no banco)
            ConquistaMandala.objects.get_or_create(user=user, meta=meta)