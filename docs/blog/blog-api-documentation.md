# Documentação da API de Blog

## Visão Geral

Esta documentação descreve todos os endpoints da API de blog do sistema CMS.

## Estrutura das Rotas

```
/api/[subtype]/blog/
├── posts/           # Gestão de posts
├── categories/      # Gestão de categorias  
└── tags/           # Gestão de tags
```

O `[subtype]` é o ID da subempresa (tenant) que identifica qual instância do blog está sendo acessada.

---

## Endpoints Internos (Gestão)

### Posts

#### `GET /api/[subtype]/blog/posts`

Lista todos os posts com paginação e filtros.

**Parâmetros de Query:**
- `page` (opcional): Número da página. Default: `1`
- `limit` (opcional): Posts por página. Default: `12`
- `subCompanyId` (opcional): ID da subempresa para filtrar
- `categoryId` (opcional): ID da categoria para filtrar
- `status` (opcional): Status do post (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
- `featured` (opcional): Posts em destaque (`true`/`false`)

**Exemplo:**
```bash
GET /api/cmmr9ch24000138vm13bdentg/blog/posts?page=1&limit=12&status=PUBLISHED
```

**Resposta:**
```json
{
  "posts": [
    {
      "id": "post_id",
      "title": "Título do Post",
      "subtitle": "Subtítulo",
      "slug": "titulo-do-post",
      "image": "https://exemplo.com/imagem.avif",
      "body": "Conteúdo completo do post...",
      "excerpt": "Resumo do post",
      "status": "PUBLISHED",
      "featured": false,
      "readingTime": 5,
      "authorId": "author_id",
      "author": { "id": "author_id", "name": "Autor" },
      "authorName": "Nome do Autor",
      "seoTitle": "Título SEO",
      "seoDescription": "Descrição SEO",
      "seoKeywords": "palavras,chave",
      "subCompanyId": "subcompany_id",
      "subCompany": { "id": "subcompany_id", "name": "Nome" },
      "categoryId": "category_id",
      "category": { "id": "category_id", "name": "Categoria" },
      "tags": [
        { "tag": { "id": "tag_id", "name": "Tag", "slug": "tag" } }
      ],
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### `POST /api/[subtype]/blog/posts`

Cria um novo post.

**Body (FormData):**
- `title` (obrigatório): Título do post
- `subtitle` (opcional): Subtítulo
- `body` (obrigatório): Conteúdo do post
- `excerpt` (opcional): Resumo
- `status` (opcional): Status. Default: `DRAFT`
- `featured` (opcional): Destaque. Default: `false`
- `categoryId` (opcional): ID da categoria
- `subCompanyId` (obrigatório): ID da subempresa
- `authorId` (opcional): ID do autor
- `authorName` (opcional): Nome do autor
- `seoTitle` (opcional): Título SEO
- `seoDescription` (opcional): Descrição SEO
- `seoKeywords` (opcional): Palavras-chave SEO
- `tagIds` (opcional): Array de IDs de tags em formato JSON
- `file:image` (opcional): Arquivo de imagem
- `image` (opcional): URL da imagem (se já tiver)

**Exemplo:**
```bash
curl -X POST /api/cmmr9ch24000138vm13bdentg/blog/posts \
  -F "title=Meu Novo Post" \
  -F "body=Conteúdo do post..." \
  -F "subCompanyId=cmmr9ch24000138vm13bdentg" \
  -F "status=PUBLISHED" \
  -F "tagIds=[\"tag1\", \"tag2\"]"
```

#### `GET /api/[subtype]/blog/posts/[id]`

Obtém um post específico.

#### `PUT /api/[subtype]/blog/posts/[id]`

Atualiza um post existente. Mesmos parâmetros do POST.

#### `DELETE /api/[subtype]/blog/posts/[id]`

Exclui um post permanentemente.

---

### Categorias

#### `GET /api/[subtype]/blog/categories`

Lista todas as categorias.

**Resposta:**
```json
[
  {
    "id": "category_id",
    "name": "Tecnologia",
    "slug": "tecnologia",
    "description": "Posts sobre tecnologia",
    "image": "https://exemplo.com/categoria.avif",
    "seoTitle": "Tecnologia Blog",
    "seoDescription": "Descrição SEO",
    "seoKeywords": "tecnologia,tech,programação",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### `POST /api/[subtype]/blog/categories`

Cria uma nova categoria.

**Body (FormData):**
- `name` (obrigatório): Nome da categoria
- `description` (opcional): Descrição
- `image` (opcional): URL da imagem
- `seoTitle` (opcional): Título SEO
- `seoDescription` (opcional): Descrição SEO
- `seoKeywords` (opcional): Palavras-chave SEO

#### `GET /api/[subtype]/blog/categories/[id]`

Obtém uma categoria específica.

#### `PUT /api/[subtype]/blog/categories/[id]`

Atualiza uma categoria existente.

#### `DELETE /api/[subtype]/blog/categories/[id]`

Exclui uma categoria permanentemente.

---

### Tags

#### `GET /api/[subtype]/blog/tags`

Lista todas as tags.

**Resposta:**
```json
[
  {
    "id": "tag_id",
    "name": "React",
    "slug": "react",
    "description": "Posts sobre React",
    "image": "https://exemplo.com/tag.avif",
    "seoTitle": "React Blog",
    "seoDescription": "Descrição SEO",
    "seoKeywords": "react,javascript,frontend",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### `POST /api/[subtype]/blog/tags`

Cria uma nova tag.

**Body (FormData):**
- `name` (obrigatório): Nome da tag
- `description` (opcional): Descrição
- `image` (opcional): URL da imagem
- `seoTitle` (opcional): Título SEO
- `seoDescription` (opcional): Descrição SEO
- `seoKeywords` (opcional): Palavras-chave SEO

#### `GET /api/[subtype]/blog/tags/[id]`

Obtém uma tag específica.

#### `PUT /api/[subtype]/blog/tags/[id]`

Atualiza uma tag existente.

#### `DELETE /api/[subtype]/blog/tags/[id]`

Exclui uma tag permanentemente.

---

## Status dos Posts

- `DRAFT`: Rascunho (não publicado)
- `PUBLISHED`: Publicado (visível publicamente)
- `ARCHIVED`: Arquivado (não listado, mas mantido)

## Upload de Imagens

As imagens são automaticamente convertidas para formato AVIF e otimizadas:

- **Formato de saída**: AVIF (qualidade 80%)
- **Tamanho recomendado**: 800x600px para posts
- **Armazenamento**: Bunny CDN
- **URL base**: `https://{pull-zone}/{path}`

## Tratamento de Erros

### Status HTTP Comuns

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Bad Request (parâmetros inválidos)
- `404`: Not Found (recurso não encontrado)
- `500`: Internal Server Error

### Formato de Erro

```json
{
  "error": "Mensagem descritiva do erro"
}
```

## Exemplos de Integração

### JavaScript/TypeScript

```javascript
// Buscar posts (requer autenticação)
async function getPosts(subcompanyId, page = 1) {
  const response = await fetch(
    `/api/${subcompanyId}/blog/posts?page=${page}&limit=12`
  );
  const data = await response.json();
  return data;
}

// Buscar posts por categoria
async function getPostsByCategory(subcompanyId, categoryId) {
  const response = await fetch(
    `/api/${subcompanyId}/blog/posts?categoryId=${categoryId}`
  );
  return response.json();
}
```

### PHP

```php
function getBlogPosts($subcompanyId, $page = 1) {
  $url = "https://seu-dominio.com/api/{$subcompanyId}/blog/posts?page={$page}";
  $response = file_get_contents($url);
  return json_decode($response, true);
}
```

### Python

```python
import requests

def get_blog_posts(subcompany_id, page=1):
    url = f"https://seu-dominio.com/api/{subcompany_id}/blog/posts"
    params = {'page': page, 'limit': 12}
    response = requests.get(url, params=params)
    return response.json()
```

## Rate Limiting

- **API Interna**: Sem limitação (acesso administrativo)

## Cache

- **API Interna**: `cache: 'no-store'` (sempre atualizado)

## Segurança

- **API Interna**: Requer autenticação do sistema
- **Validação**: Todos os dados de entrada são validados
- **Sanitização**: Conteúdo HTML é sanitizado contra XSS

## Considerações de Performance

- **Paginação**: Limite de 50 posts por página
- **Imagens**: Automáticamente otimizadas e convertidas
- **Database**: Índices otimizados para queries frequentes
- **CDN**: Imagens servidas via Bunny CDN

## Suporte

Para dúvidas sobre a API, contate a equipe de desenvolvimento ou consulte a documentação técnica do projeto.
