from django.contrib import admin
from django.utils.html import format_html
from .models import Bairro, Perfil, Etapa, Atividade, Conquista

#PAINEL DO ADMINISTRADOR PARA GERENCIAMENTO DAS ATIVIDADES E AUDITORIA

@admin.register(Atividade)
class AtividadeAdmin(admin.ModelAdmin):
    # O que aparece na lista de treinos
    list_display = ('thumb_print', 'user', 'distancia', 'data_atividade', 'status', 'auditado_por')
    list_filter = ('status', 'etapa', 'user__perfil__bairro')
    search_fields = ('user__username', 'user__perfil__cpf')
    
    # Permite aprovar/rejeitar vários de uma vez na lista
    actions = ['aprovar_atividades', 'rejeitar_atividades']

    # Exibe a miniatura do print na lista para o auditor não precisar abrir um por um
    def thumb_print(self, obj):
        if obj.print_comprovante:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />', obj.print_comprovante.url)
        return "Sem print"
    thumb_print.short_description = 'Print'

    def save_model(self, request, obj, form, change):
        # Registra automaticamente quem está auditando a atividade
        if change and 'status' in form.changed_data:
            obj.auditado_por = request.user
            from django.utils import timezone
            obj.data_validacao = timezone.now()
        super().save_model(request, obj, form, change)

    def aprovar_atividades(self, request, queryset):
        queryset.update(status='APROVADO', auditado_por=request.user)
    aprovar_atividades.short_description = "Aprovar atividades selecionadas"

    def rejeitar_atividades(self, request, queryset):
        queryset.update(status='REJEITADO', auditado_por=request.user)
    rejeitar_atividades.short_description = "Rejeitar atividades selecionadas"

    def status_ocr(self, obj):
        if "ALERTA" in obj.obs_interna:
            return format_html('<span style="color: red; font-weight: bold;">⚠️ Erro de Leitura</span>')
        return format_html('<span style="color: green;">✅ OK</span>')
    
    status_ocr.short_description = 'Leitura Automática'

# Registros simples para os outros modelos
admin.site.register(Bairro)
admin.site.register(Perfil)
admin.site.register(Etapa)
admin.site.register(Conquista)