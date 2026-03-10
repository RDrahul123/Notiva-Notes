# ✦ Notiva — Your Second Brain

> A beautiful, offline-first, graph-based note-taking app. No server. No account. No tracking.

<img width="895" height="395" alt="image" src="https://github.com/user-attachments/assets/923a51ce-06ff-46cf-bcb0-768f11abc253" />


**Live Demo →** `https://rdrahul123.github.io/Notiva-Notes/`

---

## ✨ Features

### 📁 Multi-Vault System
- Create multiple isolated vaults — personal, work, research, etc.
- Each vault is fully independent with its own notes and folders
- **Password-protect** any vault with a secure hash (vaults can't be recovered if you forget the password)
- Custom emoji icon per vault
- Auto-opens your last vault on return (if unlocked)

### 📝 Rich Note Editor
- Full rich-text formatting: **Bold**, *Italic*, Underline, Strikethrough
- Headings H1 / H2 / H3
- Bullet lists, numbered lists, blockquotes, inline code
- `[[Wikilinks]]` — link notes together by title
- Auto-save every 800ms to localStorage
- Multi-tab navigation

### 🔀 Split View
- Edit and Preview side-by-side
- Toggle between **Side-by-side** and **Top/Bottom** split with one click
- Preference saved across sessions

### 🕸 Graph View
- Interactive force-directed graph of all note connections
- Opens as a **resizable right panel** alongside your note (drag the left edge to resize)
- Click any node to open that note
- Drag nodes to rearrange the graph
- Touch-friendly (tap to open, drag to move)

### 🏷 Organisation
- Folder tree with collapsible sections
- Tags per note (`#tag` syntax)
- Tag cloud in sidebar
- Full-text search with `#tag` filtering
- Right-click context menu (open / rename / delete)

### 📊 Properties Panel
- **Info tab** — folder, created/modified dates, tags
- **Links tab** — outgoing wikilinks + backlinks
- **Stats tab** — word count, character count, link count, estimated read time

### 🎨 Theming
- Dark and Light themes
- Smooth animated theme pill toggle
- Theme persists across sessions

### 📱 Mobile-Ready
- Slide-in sidebar drawer
- Bottom sheet properties panel
- Bottom navigation bar (Notes / Edit / New / Graph / Info)
- Touch graph (tap = open note, drag = reposition node)
- iPhone notch / Dynamic Island safe area support

### 🌐 Offline & Installable (PWA)
- Works 100% offline after first load
- Installable on desktop and mobile via "Add to Home Screen"
- Service worker caches all assets

---

## 🚀 Deploy to GitHub Pages (3 steps)

### Step 1 — Create a new GitHub repo
Go to [github.com/new](https://github.com/new) and create a repo named `notiva` (or anything you like).

### Step 2 — Push the files
```bash
git clone https://github.com/yourusername/notiva.git
cd notiva
# Copy all files from this zip into the folder
git add .
git commit -m "Initial Notiva commit"
git push origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Wait ~30 seconds for the action to run
4. Your app is live at `https://yourusername.github.io/notiva` 🎉

The `deploy.yml` workflow handles everything automatically on every push to `main`.

---

## 🗂 Project Structure

```
notiva/
├── index.html                  ← Entire app (self-contained, no build step)
├── manifest.json               ← PWA manifest (installable)
├── sw.js                       ← Service worker (offline caching)
├── LICENSE                     ← MIT
├── README.md                   ← This file
├── .gitignore
├── assets/
│   └── icons/
│       ├── icon-192.png        ← PWA icon
│       ├── icon-512.png        ← PWA icon
│       └── favicon-32.png      ← Browser favicon
└── .github/
    └── workflows/
        └── deploy.yml          ← Auto-deploy to GitHub Pages
```

**Everything is in `index.html`** — CSS, JS, and HTML are all inlined. No npm, no build step, no dependencies. Just open the file and it works.

---

## 💾 Data Storage

All data is stored in your browser's `localStorage`:

| Key | Contents |
|-----|----------|
| `notiva_vaults_registry` | List of all vaults (name, emoji, password hash) |
| `notiva_vault_data_<id>` | Notes and folders for each vault |
| `notiva_theme` | Saved theme preference (dark/light) |
| `notiva_splitdir` | Saved split view direction |

**Privacy:** Nothing leaves your device. No analytics, no telemetry, no server.

**Backup:** Use your browser's dev tools (`Application > Local Storage`) to export your data, or copy notes manually.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New note |
| `Ctrl+K` | Quick search |
| `Ctrl+E` | Cycle Edit / Split / Preview |
| `Ctrl+G` | Toggle Graph View |
| `Ctrl+S` | Force save |
| `Ctrl+\` | Toggle sidebar |
| `Esc` | Close modals / panels |

---

## 🛠 Running Locally

No server needed. Just open `index.html` in any modern browser:

```bash
# Option 1: directly
open index.html

# Option 2: with a simple server (avoids any browser restrictions)
python3 -m http.server 3000
# Then open http://localhost:3000
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Vanilla HTML5 / CSS3 |
| Logic | Vanilla JavaScript (ES2020, no frameworks) |
| Fonts | Google Fonts (Syne, Literata, JetBrains Mono) |
| Graph | Canvas API + custom force-directed physics |
| Storage | localStorage |
| PWA | Web App Manifest + Service Worker |
| Deploy | GitHub Actions + GitHub Pages |

---

## 📄 License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

---

*Built with ✦ and vanilla JS. No frameworks harmed in the making of this app.*
