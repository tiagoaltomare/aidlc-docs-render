# AIDLC Docs Viewer

Site estático que renderiza todos os arquivos `.md` dentro de `aidlc-docs/`
com design inspirado no padrão AWS AIDLC (fases coloridas, navegação por seções,
diagramas Mermaid, syntax highlight, TOC e busca).

---

## Uso rápido

### 1. Gerar (ou regenerar) o manifesto

```bash
# Na raiz do projeto ou em qualquer lugar:
python aidlc-docs/_docs-viewer/generate-manifest.py
```

### 2. Abrir o site

Abra o arquivo diretamente no browser — **não precisa de servidor**:

```
aidlc-docs/_docs-viewer/index.html
```

Ou sirva com Python para evitar avisos de CORS em alguns browsers:

```bash
python -m http.server 8080 --directory aidlc-docs/_docs-viewer
# → http://localhost:8080
```

### 3. Manter atualizado automaticamente

```bash
python aidlc-docs/_docs-viewer/generate-manifest.py --watch
# Verifica mudanças a cada 3 s e regenera manifest.js automaticamente
```

---

## Portabilidade

Para usar em outro projeto basta copiar a pasta `_docs-viewer/` e editar o
bloco **CONFIG** no topo de `generate-manifest.py`:

| Variável        | Padrão              | Descrição                                 |
|-----------------|---------------------|-------------------------------------------|
| `DOCS_ROOT`     | `".."`              | Caminho para a pasta de docs (relativo ao script) |
| `SITE_TITLE`    | `"AIDLC Docs"`      | Título exibido no header do site          |
| `EXCLUDE_DIRS`  | `{".git", ...}`     | Pastas ignoradas no scan                  |
| `EXCLUDE_FILES` | `set()`             | Arquivos .md ignorados                    |
| `WATCH_INTERVAL`| `3`                 | Segundos entre polls no modo --watch      |

---

## Como funciona

```
generate-manifest.py   →   manifest.js   →   index.html
       (script)               (dados)           (SPA)
```

1. **generate-manifest.py** percorre toda a árvore de docs, lê cada `.md`,
   extrai título (primeiro `# H1` ou nome do arquivo) e serializa tudo
   em `manifest.js` como variável JavaScript global (`window.AIDLC_MANIFEST`).

2. **manifest.js** é carregado via `<script src="manifest.js">` — funciona
   com `file://` sem precisar de servidor.

3. **index.html** lê o manifesto, monta o sidebar com as fases AIDLC,
   e renderiza o Markdown selecionado com:
   - **marked.js** — Markdown → HTML
   - **highlight.js** — syntax highlight de código
   - **Mermaid** — diagramas `flowchart`, `sequenceDiagram`, etc.

---

## Estrutura de navegação

O sidebar agrupa automaticamente os documentos pelas fases AIDLC:

| Pasta              | Fase exibida          | Cor      |
|--------------------|-----------------------|----------|
| `aidlc-state.md`, `audit.md` (raiz) | 📋 Overview | Cinza |
| `inception/`       | 🔵 Inception Phase    | Azul     |
| `construction/`    | 🟢 Construction Phase | Verde    |
| `operations/`      | 🟡 Operations Phase   | Âmbar    |

Subpastas viram seções colapsáveis dentro de cada fase.

---

## Atalhos de teclado

| Tecla | Ação              |
|-------|-------------------|
| `/`   | Foca a busca      |
| `Esc` | Limpa a busca     |
