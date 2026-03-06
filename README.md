# ✦ Notiva — Your Second Brain

> A beautiful, offline-first, graph-based note-taking web app inspired by Obsidian.  
> Fully mobile-friendly. Zero dependencies. Deployable on GitHub Pages in minutes.

[![Deploy to GitHub Pages](https://github.com/yourusername/notiva/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/notiva/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 🌐 Live Demo

**[notiva.example.com](https://yourusername.github.io/notiva)**  
*(Replace with your actual GitHub Pages URL after deployment)*

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📝 **Rich Text Editor** | Bold, italic, headings, lists, blockquotes, inline code |
| 🔗 **Wikilinks** | Type `[[Note Title]]` to link notes — click to navigate |
| 🕸️ **Graph View** | Interactive force-directed graph showing note connections |
| 📁 **Folders** | Organise notes into collapsible folder groups |
| 🏷️ **Tags** | Assign and filter notes by hashtags |
| 🔍 **Full-Text Search** | Search titles, content, or filter by `#tag` |
| ↔️ **Split View** | Edit and preview side by side |
| ⬅️ **Backlinks Panel** | See which notes link to the current one |
| 📊 **Statistics** | Word count, character count, estimated read time |
| 🌙☀️ **Theme Toggle** | Smooth dark ↔ light mode switch, preference saved |
| 📱 **Mobile First** | Bottom navigation, slide-in drawers, touch graph |
| 💾 **Auto-Save** | Notes saved to `localStorage` every 800ms |
| 🗂️ **Multi-Tab** | Open multiple notes in tabs simultaneously |
| ♿ **Accessible** | ARIA roles, keyboard navigation, semantic HTML |

---

## 📱 Mobile Experience

Notiva is fully usable on mobile browsers (iOS Safari, Android Chrome):

- **Bottom navigation bar** — Notes / Edit / New / Graph / Info
- **Slide-in sidebar drawer** — tap overlay or swipe to dismiss
- **Bottom sheet panel** — swipe down to close
- **Touch graph** — tap nodes to open notes, drag to reposition
- **Safe area insets** — supports iPhone notch / Dynamic Island
- **No zoom on inputs** — `font-size: 16px` on all inputs

---

## 🚀 Deploy to GitHub Pages

### Option 1: Automatic (GitHub Actions)

1. **Fork or create** this repository on GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select **GitHub Actions**
4. Push to `main` — the workflow at `.github/workflows/deploy.yml` will deploy automatically
5. Your app will be live at `https://yourusername.github.io/notiva`

### Option 2: Manual (GitHub Pages from branch)

1. Go to **Settings → Pages**
2. Under **Source**, choose **Deploy from a branch**
3. Select `main` branch, `/ (root)` folder
4. Click **Save**

### Option 3: Local use

Just open `index.html` in any modern browser — no server required!

---

## 📂 Project Structure

```
notiva/
├── index.html              # Main HTML (entry point)
├── manifest.json           # PWA manifest
│
├── css/
│   ├── theme.css           # CSS variables — dark & light tokens
│   ├── layout.css          # Topbar, workspace, sidebar, editor layout
│   ├── components.css      # Buttons, modals, tags, tree, toast, panel
│   ├── editor.css          # Note editor, toolbar, preview, welcome
│   └── mobile.css          # Responsive breakpoints & mobile UX
│
├── js/
│   ├── state.js            # Vault data, localStorage, shared state
│   ├── theme.js            # Theme toggle logic
│   ├── sidebar.js          # File tree, search, tags, CRUD
│   ├── tabs.js             # Multi-tab management
│   ├── editor.js           # Note load/save, formatting, preview, tags
│   ├── panel.js            # Right properties panel (info/links/stats)
│   ├── graph.js            # Force-directed graph with touch support
│   ├── mobile.js           # Mobile nav, drawers, bottom sheet
│   └── app.js              # Init, keyboard shortcuts, event wiring
│
├── assets/
│   └── icons/
│       ├── icon-192.png    # PWA icon (192×192)
│       └── icon-512.png    # PWA icon (512×512)
│
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions — auto-deploy to Pages
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New note |
| `Ctrl + K` | Focus search |
| `Ctrl + E` | Cycle edit / split / preview mode |
| `Ctrl + G` | Toggle graph view |
| `Ctrl + S` | Force save |
| `Ctrl + \` | Toggle sidebar |
| `Esc` | Close modal / context menu |

---

## 🗃️ Data Storage

All notes are stored in your browser's `localStorage` under the key `notiva_v3`.  
**No data is sent to any server.** Everything is 100% local and private.

> **Note:** Clearing browser data / site data will erase your notes. Export functionality is planned.

---

## 🛠️ Customisation

### Change accent colour

Edit `css/theme.css`:
```css
:root, [data-theme="dark"] {
  --accent: #9d7aff;       /* Main purple accent */
  --accent-dim: #6b4fd8;   /* Darker accent for hover states */
}
```

### Add new folders or default notes

Edit the `DEFAULT_VAULT` object in `js/state.js`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

Inspired by [Obsidian](https://obsidian.md). Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.

Fonts: [Literata](https://fonts.google.com/specimen/Literata), [Syne](https://fonts.google.com/specimen/Syne), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
