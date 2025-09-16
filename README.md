Repositório do Arcabouço Pedagógico MAPEAR

Configuração de Login Social (Google) e Banco Gratuito

1) Backend (Node + Express + Prisma)
- Variáveis de ambiente requeridas:
  - PORT=3000
  - DATABASE_URL=mysql://usuario:senha@host:3306/banco
  - GOOGLE_CLIENT_ID=seu_client_id_do_google
  - JWT_SECRET=uma_chave_aleatoria_com_32+ caracteres

- Banco gratuito sugerido: PlanetScale (MySQL)
  - Crie uma conta
  - Crie um database
  - Gere uma Connection String compatível com Prisma (MySQL)
  - Aponte DATABASE_URL para essa string

- Prisma
  - Rode: npm run prisma:generate

- Execução local
  - npm install
  - npm run dev (requer que DATABASE_URL, GOOGLE_CLIENT_ID e JWT_SECRET estejam setados)

2) Google OAuth (Google Identity Services)
- Acesse Google Cloud Console e crie um projeto
- Habilite OAuth consent screen (externo), adicione escopo de email
- Crie uma credencial Web para Google Identity Services (Client ID)
- Em OAuth, inclua os domínios/origins do seu frontend (ex.: http://localhost:8080 e seu domínio GitHub Pages)
- Copie o Client ID para:
  - variável de ambiente GOOGLE_CLIENT_ID (backend, para validação)
  - arquivo frontend config.js (googleClientId)

3) Frontend
- Arquivos adicionados:
  - config.js: define apiBaseUrl e googleClientId
  - auth.js: abre modal, renderiza botão Google, salva JWT no localStorage
- Páginas atualizadas:
  - index.html, conteudo.html, cursoMapear.html, mapear.html: inclusão dos scripts e gating
- Gating:
  - Links para Jogos/Curso/Artefatos exigem login
  - Em cursoMapear.html e mapear.html, se não autenticado, o modal é exibido ao carregar

4) Produção
- Suba o backend (Railway, Render, Fly.io etc.)
- Atualize config.js:
  - apiBaseUrl: URL pública do backend
  - googleClientId: Client ID do projeto Google
- Configure envs do backend (DATABASE_URL, GOOGLE_CLIENT_ID, JWT_SECRET)

5) Como usar no frontend
- Após login, o JWT é salvo e enviado em Authorization: Bearer para as rotas protegidas
- window.MAPEAR_AUTH expõe:
  - isLoggedIn(), getToken(), attachAuthHeader(opts), requireLogin(), logout()
