from django.shortcuts import render, redirect
from django.db.models import Sum, Q
from django.contrib.auth.decorators import login_required
from .models import Bairro, Atividade, Etapa
import pytesseract # Biblioteca de OCR
from PIL import Image # Processamento de Imagem
import re # Para buscar números no texto extraído

# --- VIEW 1: RANKING ---
def ranking_bairros_view(request):
    # A query agora vive dentro da função para ser atualizada a cada refresh
    ranking = Bairro.objects.annotate(
        total_km=Sum('perfil__user__atividades__distancia', 
                     filter=Q(atividades__status='APROVADO'))
    ).order_by('-total_km')
    
    return render(request, 'ranking.html', {'ranking': ranking})


# --- VIEW 2: PROCESSAMENTO DE OCR ---
@login_required
def enviar_atividade(request):
    if request.method == 'POST' and request.FILES.get('print_comprovante'):
        arquivo_imagem = request.FILES['print_comprovante']
        
        try:
            # 1. Tentativa de OCR
            img = Image.open(arquivo_imagem)
            texto = pytesseract.image_to_string(img, lang='por')
            
            # 2. Busca pela distância usando Regex (mais robusto)
            padrao = re.findall(r'(\d+[.,]\d+)\s*(?:km|KM)', texto)
            distancia_detectada = float(padrao[0].replace(',', '.')) if padrao else None

            # 3. Criação da atividade com tratamento de erro
            if distancia_detectada:
                # Caso Sucesso: OCR encontrou o dado
                Atividade.objects.create(
                    user=request.user,
                    distancia=distancia_detectada,
                    print_comprovante=arquivo_imagem,
                    status='PENDENTE',
                    obs_interna="✅ OCR processado com sucesso."
                )
            else:
                # Caso Falha: OCR não entendeu a imagem
                # Salvamos com distância 0 e marcamos para atenção especial
                Atividade.objects.create(
                    user=request.user,
                    distancia=0.0,
                    print_comprovante=arquivo_imagem,
                    status='PENDENTE',
                    obs_interna="⚠️ ALERTA: OCR falhou na leitura automática."
                )
                # Opcional: Enviar mensagem para o usuário avisando que será revisado manualmente
            
            return redirect('dashboard_usuario')

        except Exception as e:
            # Caso de erro crítico (arquivo corrompido, etc)
            return render(request, 'upload_atividade.html', {'erro': 'Erro ao processar imagem.'})

    return render(request, 'upload_atividade.html')