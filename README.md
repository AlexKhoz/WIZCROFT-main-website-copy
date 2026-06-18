# WIZCROFT — homepage

Static site (plain HTML + CSS + vanilla JS, **no build step**). The contact form posts to
**Web3Forms**; page copy is editable through **Decap CMS**.

```
/
├── index.html            ← the homepage
├── css/
│   ├── fonts.css         ← @font-face only
│   └── style.css         ← tokens + layout
├── js/
│   └── main.js           ← content injection, form, scroll-to-top
├── content/
│   └── home.json         ← all editable copy (read by main.js & Decap)
├── admin/
│   ├── index.html        ← Decap CMS entry point
│   └── config.yml        ← Decap CMS configuration
├── img/                  ← images (do not rename existing files)
└── Fonts/                ← font files (do not rename)
```

---

## 1. Deploy to Netlify

**Option A — drag & drop (fastest)**
1. Sign in at <https://app.netlify.com>.
2. Drag the **entire project folder** onto the "Add new site → Deploy manually" drop zone.
3. Netlify publishes it as-is (there is no build command — leave build settings empty).

**Option B — from a Git repo (recommended, required for the CMS)**
1. Push this folder to a GitHub/GitLab repo (default branch **`main`**).
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build command: *(leave empty)*. Publish directory: `/` (the repo root).
4. Deploy.

To use a dedicated subdomain (e.g. `www.wizcroft.com` or a subdomain): Netlify dashboard →
**Domain management → Add a domain**, then follow the DNS instructions.

---

## 2. Enable Decap CMS (manual dashboard steps)

Decap uses Netlify **Identity + Git Gateway**. This must be turned on in the dashboard — the
code cannot do it:

1. Netlify site → **Integrations / Identity** → **Enable Identity**.
2. Identity → **Registration**: set to **Invite only** (recommended).
3. Identity → **Services → Git Gateway** → **Enable Git Gateway**.
4. Identity → **Invite users** → invite the site owner's email. They accept the email invite
   and set a password.
5. Visit **`https://YOUR-SITE/admin/`** and log in. Edits are committed back to `content/home.json`
   on the `main` branch; Netlify redeploys automatically.

> The site must be served over HTTPS on its Netlify domain for Identity to work (it does by
> default). The CMS requires deploy **Option B (Git repo)** — drag-and-drop deploys cannot
> commit content back.

---

## 3. Web3Forms key

The contact form needs a Web3Forms access key:

1. Get a free key at <https://web3forms.com> (enter the email that should receive submissions).
2. Open **`index.html`**, find:
   ```html
   <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
   ```
3. Replace `YOUR_ACCESS_KEY_HERE` with your real key, save, and redeploy.

Until a real key is set, the form validates input but submissions will not be delivered.

---

## Notes

- The hero and footer use a **fixed-background effect** (the image stays put while content
  scrolls over it). It is CSS-only — see the comments around `.hero__bg` / `.footer__bg` in
  `css/style.css`. It can be disabled for small screens later.
- Built from the desktop **1920px** Figma frame, now using a **fluid, responsive flow layout**
  (no fixed-coordinate positioning). It scales across desktop widths and stacks into single
  vertical columns on tablet/mobile; the nav collapses into a hamburger menu under ~900px. Since
  no dedicated mobile design exists yet, the mobile breakpoints are sensible defaults — adjust the
  `@media` blocks at the bottom of `css/style.css` if the owner provides a mobile design later.
- Some brand assets (logos, social icons, arrows) were exported from Figma into `img/icons/` and
  `img/logo/`. The hero founder photo is `img/team/hero-founder.png`.
