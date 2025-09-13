# VALCANN Frontend — Projeto (Processo Seletivo)

**Descrição curta**

Este repositório contém a aplicação web desenvolvida para o **Processo Seletivo de Estágio Frontend da VALCANN**. A aplicação consome a API pública da NASA para recuperar e exibir fotos capturadas por rovers (por exemplo: Curiosity, Opportunity, Spirit).

---

## Funcionalidades

- Consulta à API pública da NASA para recuperar fotos de rovers.
- Exibição em galeria/lista com informações (data, rover, câmera).
- Configuração por variáveis de ambiente para manter a chave de API privada.

---

## Requisitos

- Node.js (versão LTS recomendada)
- npm ou yarn
- Chave de API da NASA (gratuita)

---

## Como obter a chave da NASA

1. Acesse: https://api.nasa.gov
2. Cadastre-se (ou faça login) e solicite uma **API Key** gratuita.
3. Adicione a chave recebida no arquivo `.env.local` (na raiz do projeto) antes de rodar a aplicação.

---

## Configuração (passo a passo)

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd <nome-do-repositorio>
```

2. Instale dependências:

```bash
npm install
# ou
yarn
```

3. Crie o arquivo `.env.local` na raiz do projeto com sua chave da NASA. Exemplo:

```
NEXT_PUBLIC_NASA_API_KEY=SuaChaveAqui
# Opcional (para uso em chamadas server-side):
NASA_API_KEY=SuaChaveAqui
```

> **Importante:** mantenha `.env.local` listado no `.gitignore` para não expor sua chave.

4. Execute em modo de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

5. Build para produção:

```bash
npm run build
npm run start
```

---

## Estrutura do projeto (resumo)

- `src/` — código-fonte (componentes, hooks, páginas)
- `public/` — ativos públicos (imagens, favicon)
- `styles/` — estilos globais / utilitários CSS
- `README.md` — este arquivo

> Use a estrutura do framework escolhido (por exemplo Next.js com `app/` ou `pages/`).

---

## Como a aplicação funciona (resumo técnico)

A aplicação consome o endpoint de **Photos** da API da NASA para rovers, enviando a chave via variável de ambiente. A resposta inclui metadados e URLs das imagens, que são renderizados no frontend em uma galeria responsiva. Para chamadas que não devem expor a chave no cliente, use variáveis sem o prefixo `NEXT_PUBLIC_` em funções server-side.

---

## Observações finais

- Projeto desenvolvido para o processo seletivo da **VALCANN**.
- Usuários que clonarem o repositório precisam criar o arquivo `.env.local` com sua própria chave da NASA para executar a aplicação localmente.
- Sinta-se à vontade para adicionar screenshots, link de preview ou notas técnicas adicionais.

---

**Autor:** Gerson de Castro Gomes

> Se quiser, eu já adiciono o seu nome e o link de pré-visualização diretamente no README — diga o nome e o link que eu insiro.

