# Arquitetura do Projeto — Mavellium CMS

## Visão Geral

O **Mavellium CMS** (tegbe-dashboard) é uma plataforma CMS multi-tenant para gestão de conteúdo web de múltiplas empresas e filiais. O sistema permite que administradores gerenciem empresas, filiais e usuários, enquanto usuários regulares gerenciam o conteúdo de suas filiais — incluindo páginas, componentes, blog, formulários e personalização visual.

A arquitetura segue o modelo **multi-tenant com hierarquia organizacional**:

```
Empresa (Company)
  └── Filial (SubCompany)
       ├── Páginas
       ├── Componentes
       ├── Blog (Posts, Categorias, Tags)
       ├── Formulários
       └── Tema Visual
```

---

## Stack Tecnológica

### Frontend

| Tecnologia        | Versão  | Uso                              |
| ----------------- | ------- | -------------------------------- |
| Next.js           | 16.0.7  | Framework principal (App Router) |
| React             | 19.2.0  | Biblioteca UI                    |
| TypeScript        | 5       | Linguagem                        |
| Tailwind CSS      | 4       | Estilização                      |
| TipTap            | 3.21.0  | Editor rich text (WYSIWYG)       |
| Framer Motion     | 12.23.0 | Animações                        |
| Recharts          | 3.6.0   | Gráficos e visualizações         |
| Lucide React      | 0.554.0 | Ícones                           |
| Iconify           | 6.0.2   | Ícones adicionais                |

### Backend

| Tecnologia     | Versão | Uso                          |
| -------------- | ------ | ---------------------------- |
| Next.js API    | 16.0.7 | API Routes (REST)            |
| Prisma         | 7.0.0  | ORM                          |
| PostgreSQL     | —      | Banco de dados (Neon)        |
| jsonwebtoken   | 9.0.3  | Autenticação JWT             |
| bcryptjs       | 3.0.3  | Hash de senhas               |
| Sharp          | —      | Processamento de imagens     |
| FFmpeg         | 0.12.15| Processamento de vídeo       |

### Armazenamento de Arquivos

| Serviço      | Uso                          |
| ------------ | ---------------------------- |
| Bunny CDN    | CDN principal para imagens   |
| Vercel Blob  | Armazenamento alternativo    |
| FTP          | Upload direto de arquivos    |

### Ferramentas de Desenvolvimento

| Ferramenta | Uso                       |
| ---------- | ------------------------- |
| ESLint 9   | Linting                   |
| tsx        | Execução de scripts TS    |
| PostCSS    | Processamento CSS         |

---

## Estrutura de Pastas

```
tegbe-dashboard/
├── prisma/                     # Schema e migrações do banco
│   ├── schema.prisma           # Modelo de dados
│   ├── migrations/             # Migrações SQL
│   └── backup.ts               # Script de backup
├── public/                     # Assets estáticos
├── docs/                       # Documentação
├── src/
│   ├── app/                    # Next.js App Router (rotas e API)
│   │   ├── layout.tsx          # Layout raiz (providers globais)
│   │   ├── page.tsx            # Dashboard principal (role-based)
│   │   ├── globals.css         # Estilos globais + variáveis CSS
│   │   ├── login/              # Página de login
│   │   ├── admin/              # Rotas administrativas
│   │   ├── dashboard/[id]/     # Dashboard do usuário por filial
│   │   ├── tegbe/              # Seção TegBE
│   │   ├── tegpro/             # Seção TegPro
│   │   ├── api/                # API REST routes
│   │   └── generated/          # Prisma Client gerado
│   ├── components/             # Componentes React (47 pastas)
│   ├── contexts/               # Context providers (Auth, Site)
│   ├── hooks/                  # Custom hooks
│   ├── layout/                 # Templates de layout de seções
│   ├── lib/                    # Utilitários (auth, prisma, theme, etc.)
│   └── types/                  # Definições TypeScript
├── middleware.ts               # Middleware raiz (pathname header)
├── next.config.ts              # Configuração Next.js
├── prisma.config.ts            # Configuração Prisma
├── tsconfig.json               # Configuração TypeScript
└── package.json                # Dependências e scripts
```

### Detalhamento dos Diretórios

**`src/components/`** — 47 componentes organizados por funcionalidade, cada um em sua própria pasta com `index.tsx`:

- **UI Base:** `Button`, `Card`, `Input`, `TextArea`, `Switch`, `Loading`, `EmptyState`
- **Formulários:** `ColorPicker`, `IconSelector`, `ImageUpload`, `VideoUpload`
- **Editores:** `RichTextEditor` (TipTap), `AdvancedJsonEditor`, `PostEditor`, `CardEditor`, `EntityEditor`
- **Dados:** `DataTable`, `DataFilter`, `RepeatableList`, `EditableList`
- **Dashboard:** `AdminDashboard`, `UserDashboard`, `Chart`, `MetricCard`, `KpiCard`
- **Layout:** `Sidebar`, `ConditionalSidebar`, `MainWrapper`, `CollapsibleSection`
- **Gestão:** `Manage/` (ManageLayout, SearchSortBar, ItemHeader, FixedActionBar, DeleteConfirmationModal)
- **Tema:** `ThemeClientUpdater`, `ThemePropertyInput`, `ColorPropertyInput`
- **Admin:** `Admin/MenuBuilder`

**`src/hooks/`** — 3 custom hooks:

- `useJsonManagement` — CRUD genérico para objetos JSON com upload de arquivos
- `useListManagement` — Gestão de listas com busca, ordenação e limites por plano
- `useListState` — Estado avançado de listas com validação e drag-and-drop

**`src/contexts/`** — 2 Context providers:

- `AuthContext` — Estado de autenticação (user, login, logout)
- `SiteContext` — Seleção de filial/site atual

**`src/lib/`** — 7 utilitários:

- `auth.ts` — Funções JWT e bcrypt
- `prisma.ts` — Singleton do Prisma Client
- `theme-server.ts` — Carregamento de tema server-side
- `analytics.ts` — Integração Google Analytics
- `generative.ts` — Utilitários de geração de conteúdo com IA
- `colorUtils.ts` — Manipulação de cores
- `colors.ts` — Constantes de paleta de cores

**`src/layout/`** — 11 templates de layout para seções de páginas:

- `Cards`, `FooterTheme`, `HeadlineTheme`, `HeroClientLayout`, `HeroImagesClientLayout`, `HeroTextsClientLayout`, `DualShowcaseClientLayout`, `SuccessCasesClientLayout`, `LeadsClientLayout`, `FormsDashboardLayout`, `VisualFormBuilderLayout`

**`src/types/`** — 2 arquivos de tipos:

- `index.ts` — Props de componentes, tipos de analytics, métricas
- `config.ts` — `SiteConfig`, `MenuItem`, `GlobalConfigType`

---

## Arquitetura de Rotas

O projeto utiliza o **Next.js App Router** com a seguinte estrutura:

### Rotas de Página

```
/                           → Dashboard (ADMIN ou USER, baseado na role)
/login                      → Página de login
/admin/usuarios             → Gestão de usuários (ADMIN)
/admin/empresas             → Gestão de empresas (ADMIN)
/admin/subempresas          → Gestão de filiais (ADMIN)
/admin/paginas              → Gestão de páginas (ADMIN)
/dashboard/[id]/            → Dashboard da filial (USER)
/dashboard/[id]/home/*      → Seções da página inicial (12 rotas)
/dashboard/[id]/marketing/* → Seções de marketing (11 rotas)
/dashboard/[id]/sobre/*     → Seções sobre (13 rotas)
/dashboard/[id]/ecommerce/* → Seções e-commerce (11 rotas)
/dashboard/[id]/cursos/*    → Seções de cursos (11 rotas)
/dashboard/[id]/blog/*      → Gestão do blog
/dashboard/[id]/global/*    → Header e footer
/tegbe/personalizacao       → Personalização TegBE
/tegpro/personalizacao      → Personalização TegPro
```

### Rotas de API (REST)

```
POST   /api/auth/login                        → Login
POST   /api/auth/logout                       → Logout
POST   /api/auth/change-password-first-access → Troca de senha obrigatória

GET|POST    /api/users                        → Listar | Criar usuário
GET|PUT|DEL /api/users/[id]                   → Obter | Atualizar | Deletar

GET|POST    /api/companies                    → Listar | Criar empresa
GET|PUT|DEL /api/companies/[id]               → Obter | Atualizar | Deletar

GET|POST    /api/sub-companies                → Listar | Criar filial
GET|PUT|DEL /api/sub-companies/[id]           → Obter | Atualizar | Deletar

GET|POST    /api/components                   → Listar | Criar componente
POST        /api/components/submit            → Submeter dados de componente
GET|PUT|DEL /api/components/[id]              → Obter | Atualizar | Deletar

GET|POST    /api/pages                        → Listar | Criar página
GET|PUT|DEL /api/pages/[id]                   → Obter | Atualizar | Deletar

GET         /api/analytics/[subCompanyId]     → Dados do Google Analytics

GET|POST    /api/[subtype]/blog/posts         → Posts do blog
GET|POST    /api/[subtype]/blog/categories    → Categorias do blog
GET|POST    /api/[subtype]/blog/tags          → Tags do blog
GET|PUT|DEL /api/[subtype]/blog/posts/[id]    → CRUD de post individual
GET|PUT|DEL /api/[subtype]/blog/categories/[id]
GET|PUT|DEL /api/[subtype]/blog/tags/[id]

POST        /api/[subtype]/form/[type]        → Submissão de formulários
GET         /api/[subtype]/json/[type]        → Dados JSON formatados
GET         /api/[subtype]/raw-json/[type]    → JSON cru
GET         /api/[subtype]/[type]             → Endpoint genérico
```

> O parâmetro `[subtype]` identifica a filial (SubCompany) nas rotas dinâmicas.

---

## Camadas da Aplicação

```
┌─────────────────────────────────────────────────┐
│                   CLIENTE                        │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │Components│  │  Hooks   │  │   Contexts   │  │
│  │  (UI)    │  │ (Lógica) │  │  (Estado)    │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │           │
│       └──────────────┴───────────────┘           │
│                      │                           │
│                fetch("/api/...")                  │
├──────────────────────┼───────────────────────────┤
│                   SERVIDOR                       │
│                      │                           │
│  ┌───────────┐  ┌────┴─────┐  ┌──────────────┐  │
│  │ Middleware │  │API Routes│  │Server Comps  │  │
│  │ (Auth)    │  │ (REST)   │  │(Pages/Layout)│  │
│  └───────────┘  └────┬─────┘  └──────┬───────┘  │
│                      │               │           │
│                      └───────┬───────┘           │
│                              │                   │
│                     ┌────────┴────────┐          │
│                     │    Prisma ORM   │          │
│                     │   (src/lib/)    │          │
│                     └────────┬────────┘          │
│                              │                   │
├──────────────────────────────┼───────────────────┤
│                              │                   │
│                     ┌────────┴────────┐          │
│                     │   PostgreSQL    │          │
│                     │    (Neon)       │          │
│                     └─────────────────┘          │
└─────────────────────────────────────────────────┘
```

### Separação de Responsabilidades

| Camada         | Diretório         | Responsabilidade                                    |
| -------------- | ----------------- | --------------------------------------------------- |
| UI             | `src/components/` | Componentes visuais reutilizáveis                   |
| Lógica Cliente | `src/hooks/`      | Lógica de estado e operações CRUD no cliente        |
| Estado Global  | `src/contexts/`   | Autenticação e seleção de site                      |
| Layouts        | `src/layout/`     | Templates de seções de páginas                      |
| Páginas        | `src/app/`        | Server Components, rotas e layouts                  |
| API            | `src/app/api/`    | Endpoints REST (Route Handlers)                     |
| Dados          | `src/lib/`        | Prisma, auth, theme, analytics                      |
| Tipos          | `src/types/`      | Interfaces e tipos TypeScript                       |
| Schema         | `prisma/`         | Modelo de dados e migrações                         |

---

## Sistema de Autenticação

A autenticação é **custom**, implementada com JWT e bcryptjs (sem NextAuth):

### Fluxo de Login

```
┌─────────┐     POST /api/auth/login      ┌─────────────┐
│LoginForm │ ──────────────────────────── → │ API Route   │
│(cliente) │                                │ (servidor)  │
└─────────┘                                └──────┬──────┘
                                                   │
                                           Verifica email/senha
                                           com bcryptjs (12 rounds)
                                                   │
                                           Gera JWT (24h expiração)
                                                   │
                                           Set cookies:
                                           • token (httpOnly, secure)
                                           • user_data (acessível)
                                                   │
                                                   ▼
┌─────────────┐     Lê cookies            ┌──────────────┐
│ AuthContext  │ ◄──────────────────────── │   Browser    │
│ (useAuth)   │                            │   Cookies    │
└─────────────┘                            └──────────────┘
```

### Componentes do Sistema

| Arquivo                                            | Função                              |
| -------------------------------------------------- | ----------------------------------- |
| `src/lib/auth.ts`                                  | `generateToken`, `verifyToken`, `hashPassword`, `comparePassword` |
| `src/app/api/auth/login/route.ts`                  | Endpoint de login                   |
| `src/app/api/auth/logout/route.ts`                 | Limpa cookies                       |
| `src/app/api/auth/change-password-first-access/route.ts` | Troca de senha obrigatória    |
| `src/contexts/AuthContext.tsx`                      | Estado de autenticação no cliente   |
| `src/components/ForcePasswordModal/index.tsx`       | Modal de troca de senha forçada     |

### Proteção de Rotas (Middleware)

O arquivo `src/middleware.ts` protege todas as rotas exceto `/login`:

- Sem token → redireciona para `/login`
- Com token acessando `/login` → redireciona para `/`
- Demais rotas → permite acesso se token presente

### Segurança

- Senha com hash bcryptjs (12 salt rounds)
- Token JWT com secret em variável de ambiente
- Cookie `token` com flags `httpOnly`, `secure` (produção), `sameSite: lax`
- Campo `forcePasswordChange` para forçar troca no primeiro acesso
- Campo `isActive` para desativar usuários

---

## Multi-Tenant

O sistema implementa multi-tenancy com **isolamento por filial (SubCompany)**:

### Modelo de Dados

```
┌──────────────┐
│   Company    │  Empresa Matriz
│   (Empresa)  │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│  SubCompany  │  Filial
│   (Filial)   │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────────────────────────────┐
│  Pages │ Components │ FormData │ Blog │  Dados isolados por filial
└──────────────────────────────────────┘
```

### Hierarquia

- **Company** — Entidade raiz (ex: "Grupo XYZ")
- **SubCompany** — Filial com configuração própria:
  - `theme` (JSON) — Cores e estilo visual
  - `menuItems` (JSON) — Itens de menu da filial
  - `logo_img` — Logo próprio
  - `blogEnabled` — Habilita/desabilita blog
  - `ga_id` — ID do Google Analytics
- **User** — Vinculado à Company (não à SubCompany)

### Isolamento de Dados

Cada SubCompany possui seus próprios:
- Componentes e dados de componentes
- Páginas e formulários
- Posts, categorias e tags de blog
- Tema visual e configuração de menu

### Seleção de Tenant no Cliente

O `SiteContext` (`src/contexts/SiteContext.tsx`) gerencia a seleção:

1. Carrega filiais do endpoint `/api/sub-companies`
2. Filtra filiais pela `companyId` do usuário logado
3. Detecta filial atual pela URL (`/dashboard/[id]`)
4. Persiste seleção no `localStorage`
5. Para ADMIN, exibe todas as filiais

---

## Sistema de Permissões

### Roles

| Role    | Acesso                                                    |
| ------- | --------------------------------------------------------- |
| `ADMIN` | Sistema completo: empresas, filiais, usuários, páginas    |
| `USER`  | Apenas filiais da sua empresa: conteúdo, blog, tema       |

### Dashboard Diferenciado

```typescript
// src/app/page.tsx
if (user.role === "ADMIN") → <AdminDashboard />
if (user.role === "USER")  → <UserDashboard />
```

- **AdminDashboard** — Visão geral do sistema, gestão de entidades
- **UserDashboard** — Analytics e conteúdo das filiais da empresa

### Menu Dinâmico

O `Sidebar` (`src/components/Sidebar/index.tsx`) renderiza menus diferentes:

- **ADMIN**: Menu fixo com links para gestão (Usuários, Empresas, Filiais)
- **USER**: Menu dinâmico carregado do campo `menuItems` (JSON) da SubCompany selecionada

---

## Fluxo de Dados

### Requisição Típica (Página Server Component)

```
Browser → Middleware (verifica token) → Server Component (page.tsx)
  → Prisma query direto no servidor → PostgreSQL
  → Renderiza HTML → Envia ao browser
```

### Requisição Típica (Cliente → API)

```
Componente (fetch) → API Route Handler (/api/...)
  → Prisma query → PostgreSQL
  → JSON Response → Componente atualiza estado
```

### Fluxo de Autenticação Completo

```
1. POST /api/auth/login (email, senha)
2. Verifica credenciais no banco
3. Gera JWT, define cookies
4. AuthContext lê cookie user_data
5. Middleware valida token em cada navegação
6. SiteContext carrega filiais do usuário
7. Páginas renderizam conteúdo filtrado por role/filial
```

### Fluxo de Tema

```
1. Request chega no servidor
2. getThemeFromRequest() (src/lib/theme-server.ts) busca tema da filial
3. generateThemeCSS() gera variáveis CSS
4. Root layout aplica CSS inline no <html>
5. ThemeClientUpdater atualiza cores dinamicamente no cliente
6. Componentes usam classes utilitárias (.bg-primary, .text-secondary)
```

---

## Providers Globais

A árvore de providers definida em `src/app/layout.tsx`:

```
<html style={themeCSS}>
  <AuthProvider>              ← Estado de autenticação
    <SiteProvider>            ← Seleção de filial/tenant
      <ForcePasswordModal />  ← Modal de troca de senha obrigatória
      <ThemeClientUpdater />  ← Atualização dinâmica de tema
      <ConditionalSidebar />  ← Sidebar condicional (oculta no login)
      <MainWrapper>           ← Wrapper com classes de layout
        {children}            ← Conteúdo da página
      </MainWrapper>
    </SiteProvider>
  </AuthProvider>
</html>
```

| Provider              | Arquivo                                      | Função                                           |
| --------------------- | -------------------------------------------- | ------------------------------------------------ |
| `AuthProvider`        | `src/contexts/AuthContext.tsx`                | Gerencia user, login(), logout()                 |
| `SiteProvider`        | `src/contexts/SiteContext.tsx`                | Gerencia sites[], currentSite, setSite()         |
| `ThemeClientUpdater`  | `src/components/ThemeClientUpdater/index.tsx` | Aplica variáveis CSS de tema no cliente          |
| `ConditionalSidebar`  | `src/components/ConditionalSidebar/index.tsx` | Renderiza sidebar quando não está em /login      |
| `MainWrapper`         | `src/components/MainWrapper/index.tsx`        | Aplica classes CSS condicionais ao conteúdo      |

---

## Modelo de Dados (Prisma)

### Entidades Principais

```
┌────────────┐     ┌──────────────┐     ┌────────────┐
│   Company   │────│  SubCompany   │────│    Page     │
│             │ 1:N│               │ 1:N│             │
└──────┬──────┘    └──────┬────────┘    └─────────────┘
       │ 1:N              │ 1:N
       ▼                  ▼
┌────────────┐     ┌──────────────┐
│    User     │    │  Component    │
│             │    │               │
└─────────────┘    └──────┬────────┘
                          │ 1:N
                          ▼
                   ┌──────────────┐
                   │ComponentData │
                   └──────────────┘

┌──────────────┐     ┌──────────────┐
│  SubCompany   │────│   FormData    │  Constraint: unique(type, subtype, subCompanyId)
│               │ 1:N│               │
└──────┬────────┘    └──────────────┘
       │ 1:N
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   BlogPost    │────│ BlogCategory  │    │   BlogTag     │
│               │ N:1│               │    │               │
└──────┬────────┘    └──────────────┘    └───────┬───────┘
       │ N:M (via BlogPostTag)                    │
       └──────────────────────────────────────────┘
```

### Enums

- **Role**: `ADMIN`, `USER`
- **BlogPostStatus**: `DRAFT`, `PUBLISHED`, `ARCHIVED`

### Campos JSON Notáveis

- `SubCompany.theme` — Configuração de cores do tema
- `SubCompany.menuItems` — Estrutura de menu da filial
- `Page.formData` — Dados de formulário da página
- `Component.config` — Configuração do componente
- `ComponentData.data` — Dados coletados do componente
- `FormData.values` — Valores do formulário

---

## Convenções do Projeto

### Organização de Código

- **Um componente por pasta** — Cada componente em sua pasta com `index.tsx`
- **Aliases de importação** — `@/*` mapeia para `src/*`
- **Server Components por padrão** — Client Components marcados explicitamente com `"use client"`
- **API RESTful** — Convenção `GET/POST` em `route.ts`, `GET/PUT/DELETE` em `[id]/route.ts`

### Nomenclatura

- **Rotas em português** — `/admin/usuarios`, `/admin/empresas`, `/admin/subempresas`
- **Código em inglês** — Variáveis, funções e tipos em inglês
- **Mensagens de erro em português** — Respostas da API em PT-BR

### Padrões de Estado

- **Context API** para estado global (sem Redux/Zustand)
- **useState** para estado local de componentes
- **Custom hooks** para lógica reutilizável de CRUD

### Estilização

- **Tailwind CSS** com classes utilitárias
- **Variáveis CSS** para tema dinâmico (`--color-primary`, `--color-secondary`, etc.)
- **Classes customizadas** mapeadas para variáveis (`.bg-primary`, `.text-secondary`)

---

## Boas Práticas Identificadas

1. **Singleton do Prisma** — `src/lib/prisma.ts` evita múltiplas conexões em desenvolvimento
2. **Cookies httpOnly** — Token JWT armazenado com flag httpOnly para proteção contra XSS
3. **Cookie SameSite: lax** — Proteção contra CSRF
4. **Hash bcrypt com 12 rounds** — Segurança adequada para senhas
5. **Server Components** — Páginas renderizadas no servidor, reduzindo JavaScript no cliente
6. **Standalone output** — Build otimizado para deploy sem dependência de node_modules
7. **Tema server-side** — Tema carregado no servidor para evitar flash de conteúdo sem estilo
8. **Separação de concerns** — Contexts, hooks, lib e components em diretórios distintos
9. **Prisma Client gerado em `src/`** — Output do Prisma dentro do source para melhor DX
10. **Force dynamic** — Root layout com `force-dynamic` para garantir dados atualizados

---

## Possíveis Melhorias

### Segurança

- **Validação com Zod** — Substituir validações manuais nos API routes por schemas Zod para maior segurança e tipagem
- **Rate limiting** — Adicionar rate limiting no endpoint de login para prevenir ataques de força bruta
- **Verificação de role nos API routes** — Atualmente a proteção é apenas por middleware (presença de token). Adicionar verificação de role (`ADMIN`/`USER`) dentro dos endpoints críticos
- **CSRF tokens** — Considerar tokens CSRF para operações de mutação

### Arquitetura

- **Service layer** — Extrair lógica de negócios dos API routes para uma camada de serviços dedicada (`src/services/`), facilitando testes e reuso
- **Middleware de autorização** — Criar middleware específico para verificar permissões por rota, centralizando a lógica de acesso
- **Error handling centralizado** — Criar um handler de erros reutilizável para API routes, padronizando respostas de erro

### Qualidade

- **Testes** — Adicionar testes unitários (hooks, lib) e de integração (API routes)
- **Logging estruturado** — Implementar logging para rastrear erros e operações em produção
- **Documentação de API** — Gerar documentação automática dos endpoints (ex: Swagger/OpenAPI)

---

## Scripts NPM

| Comando           | Ação                                       |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Inicia servidor de desenvolvimento (porta 3000) |
| `npm run build`   | Build de produção (standalone)             |
| `npm start`       | Inicia servidor de produção                |
| `npm run lint`    | Executa ESLint                             |
| `npm run backup`  | Executa script de backup do Prisma         |
