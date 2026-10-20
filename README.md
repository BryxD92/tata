# Tata — pagina della bozza (GitHub Pages)

Un indirizzo stabile per chi prova Tata. Per ora il download è solo il DMG per Mac, sulle **GitHub Releases**. Niente link Dropbox.

## File

```
index.html
styles.css
app.js
releases.json      ← da aggiornare a ogni versione
privacy.html
tata-mark.svg
```

## Una volta sola

1. Repo pubblico `tata` sull’account GitHub (qui non va il codice del programma, solo questa pagina e, sulle Releases, il DMG).
2. Push di questa cartella sul branch `main`.
3. GitHub → **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: **/ (root)**
4. In `releases.json`, `github.owner` e `github.repo` sono già `BryxD92` / `tata`.
5. L’indirizzo è: `https://bryxd92.github.io/tata/`

## A ogni nuova versione

1. Prepara il DMG per Mac (Apple Silicon).
2. GitHub → **Releases → Draft a new release**
   - Tag: `v0.1.0`
   - Titolo: `Tata 0.1.0`
   - Allega il DMG
3. Aggiorna `releases.json`:
   - Sposta il `latest` attuale in `history` (note corte)
   - Nuovo `latest` con `version`, `tag`, `releasedAt`, `notes`
   - Sotto `mac`: `version`, `tag`, `file`, `sizeMb`, `url`, `arch`
   - Se `url` è vuoto, la pagina lo costruisce da owner / repo / tag / file
4. Commit e push di `releases.json`.
5. Nel messaggio privato: «C’è un aggiornamento sulla pagina solita» e l’indirizzo.

## Cosa non va su questo sito

- I dati delle famiglie
- Copie locali del quaderno
- Il codice del programma

## Anteprima in locale

La pagina usa `<base href="/tata/">`, come sul sito pubblicato. Dalla cartella che contiene `sito`:

```bash
ln -sfn sito tata
python3 -m http.server 8765
```

Poi apri `http://127.0.0.1:8765/tata/`.
