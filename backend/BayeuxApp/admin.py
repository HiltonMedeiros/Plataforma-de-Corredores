from django.contrib import admin
from django.utils.html import format_html
from .models import Bairro, Perfil, Etapa, Atividade, ConquistaMandala, MetaConfig

# PAINEL DO ADMINISTRADOR PARA GERENCIAMENTO DAS ATIVIDADES E AUDITORIA

@admin.register(Atividade)
class AtividadeAdmin(admin.ModelAdmin):
    
    list_display = ('thumb_print', 'user', 'distancia', 'data_atividade', 'status_validacao', 'status_ocr', 'auditado_por')
    list_filter = ('status_validacao', 'etapa', 'user__perfil__bairro')
    search_fields = ('user__username', 'user__perfil__cpf')
    
    actions = ['aprovar_atividades', 'rejeitar_atividades']

    
    def thumb_print(self, obj):
        if obj.foto_atividade_url:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" />', obj.foto_atividade_url.url)
        return "Sem print"
    thumb_print.short_description = 'Print'

    def save_model(self, request, obj, form, change):
        
        if change and 'status_validacao' in form.changed_data:
            obj.auditado_por = request.user
            from django.utils import timezone
            obj.data_validacao = timezone.now()
        super().save_model(request, obj, form, change)

    def aprovar_atividades(self, request, queryset):
        queryset.update(status_validacao='APROVADO', auditado_por=request.user)
    aprovar_atividades.short_description = "Aprovar selecionadas"

    def rejeitar_atividades(self, request, queryset):
        queryset.update(status_validacao='REJEITADO', auditado_por=request.user)
    rejeitar_atividades.short_description = "Rejeitar selecionadas"

    
    # No seu arquivo BayeuxApp/admin.py

    @admin.display(description="Status OCR")
    def status_ocr(self, obj):
        # Exemplo de lógica para exibir o status com cor
        cor = "green" if obj.status_validacao == 'APROVADO' else "orange"
        
        # O segredo é passar o valor após a string HTML
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            cor, 
            obj.status_validacao
        )

@admin.register(MetaConfig)
class MetaConfigAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'etapa', 'distancia_objetivo', 'cor_exibicao')
    
    def cor_exibicao(self, obj):
        return format_html(
            '<div style="width: 30px; height: 20px; background-color: {}; border-radius: 3px; border: 1px solid #000;"></div>',
            obj.cor_hex
        )
    cor_exibicao.short_description = 'Cor'

# Registros
admin.site.register(Bairro)
admin.site.register(Perfil)
admin.site.register(Etapa)
admin.site.register(ConquistaMandala)