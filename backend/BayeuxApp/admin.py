from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Bairro, Perfil, ValidacaoResidencia, Etapa,
    MetaConfig, Inscricao, Atividade, ConquistaMandala
)

# ==================== CONFIGURAÇÕES DE EXIBIÇÃO ====================

@admin.register(Bairro)
class BairroAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'criado_em')
    search_fields = ('nome',)
    ordering = ('nome',)


@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('user', 'cpf', 'bairro', 'status_conta', 'criado_em')
    list_filter = ('status_conta', 'sexo', 'bairro', 'criado_em')
    search_fields = ('user__username', 'cpf', 'telefone')
    readonly_fields = ('criado_em', 'atualizado_em')


@admin.register(ValidacaoResidencia)
class ValidacaoResidenciaAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'criado_em', 'data_validacao')
    list_filter = ('status', 'criado_em')
    search_fields = ('user__username',)
    readonly_fields = ('criado_em', 'atualizado_em')
    
    fieldsets = (
        ('Usuário', {
            'fields': ('user',)
        }),
        ('Arquivo', {
            'fields': ('comprovante',)
        }),
        ('Validação', {
            'fields': ('status', 'auditado_por', 'data_validacao', 'observacao')
        }),
        ('Datas', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Etapa)
class EtapaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'status', 'modalidade', 'data_inicio', 'data_fim')
    list_filter = ('status', 'modalidade', 'data_inicio')
    search_fields = ('nome',)
    readonly_fields = ('criado_em', 'atualizado_em')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'descricao', 'modalidade')
        }),
        ('Datas', {
            'fields': ('data_inicio', 'data_fim', 'status')
        }),
        ('Mídia', {
            'fields': ('imagem',)
        }),
        ('Timestamps', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MetaConfig)
class MetaConfigAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'etapa', 'distancia_objetivo', 'cor_hex')
    list_filter = ('etapa', 'criado_em')
    search_fields = ('titulo', 'etapa__nome')
    readonly_fields = ('criado_em', 'atualizado_em')


@admin.register(Inscricao)
class InscricaoAdmin(admin.ModelAdmin):
    list_display = ('user', 'etapa', 'status', 'data_inscricao')
    list_filter = ('status', 'etapa', 'data_inscricao')
    search_fields = ('user__username', 'etapa__nome')
    readonly_fields = ('data_inscricao',)


@admin.register(Atividade)
class AtividadeAdmin(admin.ModelAdmin):
    list_display = ('user', 'etapa', 'distancia', 'status_validacao', 'data_atividade', 'criado_em')
    list_filter = ('status_validacao', 'tipo_registro', 'etapa', 'criado_em')
    search_fields = ('user__username', 'etapa__nome')
    readonly_fields = ('criado_em', 'atualizado_em', 'thumb_comprovante')
    
    actions = ['aprovar_atividades', 'rejeitar_atividades']
    
    fieldsets = (
        ('Usuário e Etapa', {
            'fields': ('user', 'etapa')
        }),
        ('Dados da Atividade', {
            'fields': ('distancia', 'tempo_total', 'data_atividade', 'tipo_registro', 'comprovante', 'thumb_comprovante')
        }),
        ('Validação', {
            'fields': ('status_validacao', 'auditado_por', 'data_validacao', 'observacao_auditoria')
        }),
        ('Timestamps', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )

    def thumb_comprovante(self, obj):
        if obj.comprovante:
            return format_html(
                '<img src="{}" style="width: 200px; height: auto; border-radius: 5px;" />',
                obj.comprovante.url
            )
        return "Sem comprovante"
    thumb_comprovante.short_description = 'Prévia do Comprovante'

    def save_model(self, request, obj, form, change):
        if change and 'status_validacao' in form.changed_data:
            obj.auditado_por = request.user
            from django.utils import timezone
            obj.data_validacao = timezone.now()
        super().save_model(request, obj, form, change)

    def aprovar_atividades(self, request, queryset):
        from django.utils import timezone
        queryset.update(status_validacao='APROVADO', auditado_por=request.user, data_validacao=timezone.now())
    aprovar_atividades.short_description = "✓ Aprovar selecionadas"

    def rejeitar_atividades(self, request, queryset):
        from django.utils import timezone
        queryset.update(status_validacao='REJEITADO', auditado_por=request.user, data_validacao=timezone.now())
    rejeitar_atividades.short_description = "✗ Rejeitar selecionadas"


@admin.register(ConquistaMandala)
class ConquistaMandalaAdmin(admin.ModelAdmin):
    list_display = ('user', 'meta', 'data_conquista')
    list_filter = ('meta__etapa', 'data_conquista')
    search_fields = ('user__username', 'meta__titulo')
    readonly_fields = ('data_conquista',)


# Customização do Admin Site
admin.site.site_header = "Bayeux Movimenta - Painel Administrativo"
admin.site.site_title = "Bayeux"
admin.site.index_title = "Bem-vindo ao painel administrativo"