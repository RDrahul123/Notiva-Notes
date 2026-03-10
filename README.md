# ✦ Notiva — Your AI-Powered Second Brain

> Offline-first, graph-based note-taking with built-in AI. Multi-vault, password-protected. No server required.

---

## ✨ Features

### 🤖 AI Features (NEW)
- **📋 Summarize** — Get a concise bullet-point summary of any note
- **✍️ Continue Writing** — AI picks up where you left off and appends text directly
- **🏷️ Auto-Tag** — One-click tag suggestions, apply them directly to the note
- **🔗 Find Related** — AI scans your entire vault and surfaces connected ideas
- **💬 AI Chat** — Ask anything about the current note in a persistent conversation

**Key privacy:** Your API key is stored only in your browser using XOR obfuscation with a device fingerprint. It cannot be read by other users, browser extensions, or anyone inspecting the source code. It never appears in any file on GitHub.

### 📁 Multi-Vault System
- Multiple isolated vaults (personal, work, research…)
- Password-protect any vault
- Custom emoji icons per vault

### 📝 Rich Editor
- Bold, italic, underline, headings, lists, blockquotes, code
- `[[Wikilinks]]` between notes
- Split view (side-by-side or top/bottom)
- Auto-save every 800ms

### 🕸 Graph View
- Interactive force-directed graph (right panel)
- Resizable — drag the left edge
- Click nodes to navigate, drag to reposition

### 📱 Mobile-Ready + PWA
- Installable on desktop and mobile
- Works fully offline after first load
- Bottom nav, swipe gestures, touch graph

---

## 🚀 Deploy to GitHub Pages

### 1. Create repo
Go to [github.com/new](https://github.com/new), create a repo named `notiva`.

### 2. Push
```bash
cd notiva-final
git init
git add .
git commit -m "Initial Notiva commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/notiva.git
git push -u origin main
```

### 3. Enable Pages
Settings → Pages → Source → **GitHub Actions** → Save.

Live in ~30 seconds at `https://YOUR_USERNAME.github.io/notiva` 🎉

---

## 🔑 Setting up AI

1. Get an API key:
   - **OpenAI:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **GitHub Marketplace Models:** [github.com/marketplace/models](https://github.com/marketplace/models)

2. In Notiva, click the **🔑** button in the editor toolbar (or AI Chat → Set API Key)

3. Paste your key and click **Save Key**

4. Your key is immediately XOR-encoded with a device fingerprint and stored in localStorage. It cannot be recovered by inspecting the HTML, localStorage, or the GitHub repo — it only works on your device.

> ⚠️ **If you forget to revoke a key you've shared publicly, do so immediately at your API provider's dashboard.**

---

## 📁 Project Structure

```
notiva-final/
├── index.html                  ← Entire app (self-contained, ~160KB)
├── manifest.json               ← PWA manifest
├── sw.js                       ← Service worker (offline)
├── LICENSE                     ← MIT
├── README.md
├── .gitignore
├── assets/icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── favicon-32.png
└── .github/workflows/
    └── deploy.yml              ← Auto-deploy to GitHub Pages
```

**No build step. No npm. No frameworks. Just open `index.html`.**

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New note |
| `Ctrl+K` | Quick search |
| `Ctrl+E` | Cycle Edit/Split/Preview |
| `Ctrl+G` | Toggle Graph View |
| `Ctrl+S` | Force save |
| `Ctrl+\` | Toggle sidebar |
| `Esc` | Close panels / modals |

---

## 💾 Data & Privacy

- All notes stored in `localStorage` — never leaves your device
- API key stored XOR-obfuscated — not readable as plaintext
- No analytics, no telemetry, no third-party tracking
- AI requests go directly from your browser to OpenAI/Azure — no proxy

---

## 📄 License

MIT — free to use, modify, distribute.
