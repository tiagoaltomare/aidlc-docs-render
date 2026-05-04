# AIDLC Docs Viewer

Viewer web para documentação AIDLC em Markdown. O sistema atual é composto por
três partes:

- `generate-manifest.py`: varre os arquivos `.md` e gera `manifest.js`
- `index.html`: SPA que navega e renderiza a documentação
- `save-server.py`: servidor local para salvar respostas e emitir live reload

O objetivo do projeto é permitir leitura, navegação e preenchimento de arquivos
Markdown AIDLC com uma interface única no navegador.

## Funções atuais do sistema

### 1. Indexação de documentos Markdown

O gerador percorre a pasta de documentação configurada em `DOCS_ROOT` e cria um
manifesto JavaScript consumido pela SPA.

O que é indexado para cada arquivo:

- caminho relativo
- título extraído do primeiro `# H1` ou do nome do arquivo
- fase AIDLC detectada pela pasta
- seção principal
- conteúdo completo do Markdown

Também são gravados no manifesto:

- título do site
- nome do projeto detectado a partir de `aidlc-state.md`, quando disponível
- timestamp de geração

### 2. Agrupamento automático por fases AIDLC

A navegação lateral agrupa os arquivos automaticamente em:

- `overview`: arquivos na raiz
- `inception`
- `construction`
- `operations`
- `other`: qualquer pasta fora do padrão acima

Subpastas são exibidas como seções e subseções colapsáveis.

### 3. Busca na navegação

A interface permite filtrar documentos por título e caminho. Quando há busca:

- itens sem correspondência são ocultados
- seções relevantes são expandidas automaticamente
- o atalho `/` foca o campo de busca
- `Esc` limpa a busca

### 4. Renderização de Markdown no navegador

O `index.html` renderiza o documento selecionado com suporte a:

- headings, listas, tabelas, blockquotes e código inline
- blocos de código com syntax highlighting via `highlight.js`
- diagramas Mermaid renderizados dinamicamente
- task lists com checkboxes
- tratamento visual por fase AIDLC

### 5. TOC automático

Quando o documento possui pelo menos 3 headings `h2` ou `h3`, a interface
mostra um painel lateral "On this page" com navegação rápida por seção.

### 6. Edição de campos `[Answer]:`

Quando o Markdown contém marcadores `[Answer]:` no início de uma linha, a SPA
substitui esses pontos por áreas de texto editáveis.

Comportamentos atuais:

- respostas já existentes no arquivo são carregadas
- rascunhos são persistidos em `localStorage`
- a altura do campo cresce conforme o conteúdo
- o botão do cabeçalho alterna entre salvar e atualizar
- o rebuild do Markdown mantém o restante do documento intacto e altera apenas
  as linhas correspondentes aos marcadores

### 7. Salvamento de respostas em arquivo

Quando o viewer é aberto pelo `save-server.py`, o botão de salvar envia o
conteúdo atualizado para `POST /save` e grava de volta no arquivo `.md`.

Proteções atuais:

- o caminho salvo precisa estar dentro de `DOCS_ROOT`
- diretórios ausentes são criados automaticamente
- o conteúdo é salvo em UTF-8

Se o servidor local não estiver em execução, a interface apresenta um aviso e
oferece fallback de download do arquivo Markdown atualizado.

### 8. Live reload da navegação

Ao executar `save-server.py --watch`, o servidor:

- monitora mudanças em `.md`
- regenera o manifesto automaticamente
- publica eventos SSE em `/events`
- força recarga da navegação no browser sem refresh completo da página

### 9. Layout responsivo

A interface atual possui:

- sidebar fixa em desktop
- menu hambúrguer em telas menores
- painel de conteúdo principal
- painel de TOC ocultado em largura reduzida

## Uso

### Gerar o manifesto uma vez

```bash
python generate-manifest.py
```

### Gerar o manifesto em modo watch

```bash
python generate-manifest.py --watch
```

### Abrir apenas o viewer estático

Abra `index.html` no navegador depois de gerar `manifest.js`.

Observação: nesse modo o viewer funciona para leitura e edição local dos campos
de resposta, mas o salvamento direto em arquivo depende do servidor local.

### Rodar o servidor local com salvamento

```bash
python save-server.py
```

Depois abra:

```text
http://localhost:8765
```

### Rodar o servidor local com live reload

```bash
python save-server.py --watch
```

## Fluxo de execução

```text
generate-manifest.py -> manifest.js -> index.html
save-server.py ------> /save + /events + arquivos estáticos
```

Resumo do fluxo:

1. `generate-manifest.py` escaneia os `.md` e gera `manifest.js`.
2. `index.html` lê `window.AIDLC_MANIFEST` e monta a navegação.
3. `save-server.py` serve os arquivos estáticos, recebe salvamentos e, no modo
   watch, emite eventos de atualização.

## Configuração

### `generate-manifest.py`

| Variável | Padrão | Descrição |
|---|---|---|
| `DOCS_ROOT` | `".."` | Pasta de documentação relativa ao script |
| `SITE_TITLE` | `"AIDLC Docs"` | Título base exibido no header |
| `EXCLUDE_DIRS` | conjunto padrão | Pastas ignoradas no scan |
| `EXCLUDE_FILES` | `set()` | Arquivos `.md` ignorados |
| `OUTPUT_FILE` | `"manifest.js"` | Nome do arquivo gerado |
| `WATCH_INTERVAL` | `3` | Intervalo do polling no modo watch |

### `save-server.py`

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `8765` | Porta HTTP local |
| `DOCS_ROOT` | `".."` | Pasta de documentação relativa ao script |
| `EXCLUDE_DIRS` | conjunto padrão | Pastas ignoradas no scan/watch |
| `EXCLUDE_FILES` | `set()` | Arquivos `.md` ignorados |
| `WATCH_INTERVAL` | `3` | Intervalo do polling para live reload |

## Dependências de runtime no navegador

O viewer atual carrega bibliotecas por CDN:

- `marked`
- `highlight.js`
- `mermaid`

Isso significa que a renderização completa no browser depende de acesso a essas
bibliotecas no momento da abertura da página.

## Estrutura esperada dos documentos

O sistema foi desenhado para documentos AIDLC em Markdown. Alguns comportamentos
dependem de convenções específicas:

- o título do arquivo pode vir do primeiro heading `#`
- as fases são inferidas pelo diretório de topo
- campos editáveis dependem de linhas iniciadas por `[Answer]:`
- o nome do projeto pode ser detectado a partir de `aidlc-state.md`

## Observação sobre portabilidade

O código continua preparado para uso embarcado em uma pasta como
`aidlc-docs/_docs-viewer/`, já que o padrão de `DOCS_ROOT` é `..`. Neste
repositório os arquivos estão na raiz para desenvolvimento e manutenção do
viewer, então ajuste `DOCS_ROOT` conforme o local em que ele for implantado.
