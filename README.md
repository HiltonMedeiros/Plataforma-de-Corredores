# 🏃 Bayeux Movimenta - Plataforma de Desafios

Bem-vindo ao **Bayeux Movimenta**! Uma plataforma integrada de desafios de caminhada e corrida para a comunidade de Bayeux, com suporte a integração com aplicativos de GPS e validação administrativa.

## 🚀 Características

- ✅ **Autenticação Segura**: Login/Registro com validação de dados
- 📄 **Validação de Residência**: Upload de comprovante com análise administrativa
- 🏆 **Gamificação**: Sistema de metas e conquistas (medalhas digitais)
- 📊 **Dashboard do Usuário**: Acompanhamento de progresso em tempo real
- 👨‍💼 **Painel Administrativo**: Gestão de etapas, auditoria de atividades, relatórios
- 🔗 **Integração GPS**: Suporte a Strava, Garmin, Nike Run Club
- 📱 **Responsivo**: Design mobile-first com Tailwind CSS
- 🎯 **API REST**: Backend robusto com Django REST Framework

## 📋 Requisitos

- Python 3.10+
- Node.js 18+
- PostgreSQL 12+ (ou SQLite para desenvolvimento)
- npm ou yarn

## 🔧 Instalação

### Backend

```bash
# 1. Acessar pasta backend
cd backend

# 2. Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Criar arquivo .env
cp .env.example .env
# Editar .env com suas credenciais

# 5. Executar migrações
python manage.py makemigrations
python manage.py migrate

# 6. Criar superusuário
python manage.py createsuperuser

# 7. Coletar arquivos estáticos
python manage.py collectstatic --noinput

# 8. Iniciar servidor
python manage.py runserver
```

**O backend rodará em:** `http://localhost:8000`

### Frontend

```bash
# 1. Acessar pasta frontend
cd frontend

# 2. Instalar dependências
npm install

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

**O frontend rodará em:** `http://localhost:5173`

## 🗄️ Banco de Dados

### PostgreSQL (Recomendado para Produção)

```bash
# Criar banco de dados
createdb bayeuxmove

# Criar usuário (opcional)
createuser bayeux_user -P
```

Adicione no `.env`:
```
DB_NAME=bayeuxmove
DB_USER=bayeux_user
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
```

### SQLite (Desenvolvimento)

Adicione no `.env`:
```
USE_SQLITE=True
```

## 📱 Estrutura do Projeto

```
Plataforma-de-Corredores/
├── backend/
│   ├── BayeuxApp/
│   │   ├── models.py           # Modelos do banco
│   │   ├── views.py            # ViewSets REST
│   │   ├── serializers.py      # Serializers
│   │   ├── urls.py             # Rotas da API
│   │   └── admin.py            # Painel administrativo
│   ├── Bayeuxmove/
│   │   ├── settings.py         # Configurações Django
│   │   ├── urls.py             # URLs principais
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LoginPage.jsx        # Tela de Login
    │   │   ├── RegistroPage.jsx     # Tela de Registro
    │   │   └── DashboardPage.jsx    # Dashboard
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── services/
    │   │   └── api.js               # Chamadas HTTP
    │   ├── context/
    │   │   └── AuthContext.jsx      # Contexto de autenticação
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🔑 Endpoints da API

### Autenticação
- `POST /api/auth/login/` - Login com token
- `POST /api/auth/registro/` - Registrar novo usuário

### Perfil
- `GET /api/perfil/meu_perfil/` - Obter meu perfil
- `POST /api/perfil/` - Criar perfil
- `PUT /api/perfil/` - Atualizar perfil

### Etapas
- `GET /api/etapas/` - Listar etapas
- `GET /api/etapas/{id}/` - Detalhes da etapa
- `GET /api/etapas/{id}/metas/` - Metas da etapa

### Inscrições
- `GET /api/inscricoes/minhas_inscricoes/` - Minhas inscrições
- `POST /api/inscricoes/` - Inscrever em etapa

### Atividades
- `GET /api/atividades/minhas_atividades/` - Minhas atividades
- `POST /api/atividades/` - Lançar atividade manual
- `GET /api/atividades/pendentes_auditoria/` - [ADMIN] Atividades pendentes

### Dashboard Admin
- `GET /api/dashboard/resumo_geral/` - Resumo geral
- `GET /api/dashboard/participacao_por_bairro/` - Estatísticas por bairro
- `GET /api/dashboard/progresso_etapas/` - Progresso das etapas

## 👤 Fluxo de Usuário

### 1. Novo Usuário
1. Acessa `/registro`
2. Preenche dados básicos (nome, email, senha)
3. Preenche dados pessoais (CPF, bairro, etc)
4. Faz upload de comprovante de residência
5. Aceita termos (responsabilidade + LGPD)
6. Conta criada com comprovante em análise

### 2. Usuário Autenticado
1. Acessa `/dashboard`
2. Visualiza etapas disponíveis
3. Se inscreve em etapa
4. Registra atividades (manual ou GPS)
5. Atividades são auditadas
6. Conquista medalhas ao atingir metas
7. Acompanha progresso em tempo real

### 3. Administrador
1. Acessa `/admin/`
2. Valida comprovantes de residência
3. Aprova/Rejeita atividades
4. Cria novas etapas
5. Visualiza relatórios e estatísticas

## 🛡️ Segurança

- Senhas criptografadas com PBKDF2
- Autenticação por Token
- CORS configurado
- Validação de CPF
- Upload restrito de arquivos
- Admin-only endpoints protegidos

## 📧 Configuração de Email

Para recuperação de senha, configure no `.env`:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=sua_senha_de_app
```

## 🚀 Deploy

### Produção com Gunicorn

```bash
pip install gunicorn
gunicorn Bayeuxmove.wsgi:application --bind 0.0.0.0:8000
```

### Variáveis de Ambiente Produção

```env
DEBUG=False
SECRET_KEY=sua_chave_secreta_segura
ALLOWED_HOSTS=seu_dominio.com,www.seu_dominio.com
DATABASE_URL=postgresql://user:password@host/dbname
```

## 📝 Licença

Este projeto é licenciado sob a Licença MIT.

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou reportar bugs, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para a comunidade de Bayeux**