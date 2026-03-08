# ✦ Notiva — Your Second Brain

> A graph-based, offline-first note-taking web app inspired by Obsidian.
> Fully mobile-friendly. No account required. All data stays in your browser.

<img width="916" height="410" alt="image" src="https://github.com/user-attachments/assets/de603cd3-69de-41f0-af1c-54efa276dcb1" />

<img width="896" height="395" alt="image" src="https://github.com/user-attachments/assets/5803f5bb-6f02-4c16-b4ca-be37e5ede8c8" />

## 🚀 Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Push to `main` — auto-deploys via `.github/workflows/deploy.yml`
4. Live at `https://YOUR_USERNAME.github.io/notiva/`

## 📁 Project Structure

```
notiva/
├── index.html                  # App entry point
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker (offline)
├── assets/
│   ├── css/
│   │   ├── theme.css           # Dark + Light theme variables
│   │   ├── layout.css          # Topbar, sidebar, workspace
│   │   ├── components.css      # Buttons, modals, tabs, panels
│   │   ├── editor.css          # Editor, toolbar, preview, graph
│   │   └── mobile.css          # Responsive + mobile styles
│   ├── js/
│   │   ├── vault.js            # Data layer + localStorage
│   │   ├── ui.js               # Sidebar, search, modals, theme
│   │   ├── editor.js           # Note editing, formatting, wikilinks
│   │   ├── graph.js            # Force-directed graph + touch
│   │   └── app.js              # Bootstrap + keyboard shortcuts
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
└── .github/workflows/deploy.yml
```

## ✨ Features

- Rich text editor (bold, italic, headings, lists, code, blockquotes)
- [[Wikilinks]] — connect notes, visualised in Graph View
- Folder organisation with collapsible file tree
- Tags + metadata per note
- Interactive force-directed Graph View (Ctrl+G)
- Split edit/preview mode (Ctrl+E)
- Full-text search (Ctrl+K)
- Dark 🌙 & Light ☀️ theme toggle
- Auto-save to localStorage
- Fully mobile-friendly PWA (drawer sidebar, FAB, bottom sheet panel, touch graph)
- Offline support via Service Worker

## 💻 Run Locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl+N | New note |
| Ctrl+K | Search |
| Ctrl+E | Toggle preview mode |
| Ctrl+G | Graph view |
| Ctrl+S | Save |

## 📄 License

MIT
