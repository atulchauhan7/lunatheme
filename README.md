# Luxe Theme — Shopify Theme

A premium, minimal Shopify theme built for an Indian ladies kurti e-commerce store. Features smooth animations, custom cursor, parallax effects, size chart, color swatches, and a refined editorial aesthetic.

---

## How to Run This Theme Locally (Step by Step)

### Step 1 — Install Node.js

Download and install **Node.js v20.10.0 or later** from:

```
https://nodejs.org/
```

Verify installation:

```bash
node --version
```

You should see `v20.10.0` or higher.

---

### Step 2 — Install Shopify CLI

Open your terminal (PowerShell / Command Prompt / Terminal) and run:

```bash
npm install -g @shopify/cli @shopify/theme
```

Verify installation:

```bash
shopify version
```

You should see something like `3.91.0` or later.

---

### Step 3 — Clone or Download This Repository

If using Git:

```bash
git clone <your-repo-url>
```

Or download the ZIP and extract it.

---

### Step 4 — Navigate to the Theme Folder

```bash
cd luxe-theme
```

Make sure you are inside the folder that contains `config/`, `sections/`, `templates/`, etc.

---

### Step 5 — Log In to Shopify (First Time Only)

If you've never logged in before, or need to switch stores:

```bash
shopify auth logout
```

Then start the dev server (Step 6) — it will prompt you to log in automatically.

---

### Step 6 — Start the Local Dev Server

```bash
shopify theme dev --store YOUR-STORE.myshopify.com
```

Replace `YOUR-STORE` with your actual Shopify store prefix. For example:

```bash
shopify theme dev --store kahani-8561.myshopify.com
```

---

### Step 7 — Authenticate in Your Browser

The CLI will display a **verification code** and open your browser automatically.

```
User verification code: XXXX-XXXX
👉 Press any key to open the login page on your browser
```

1. Press any key in the terminal
2. Your browser will open the Shopify login page
3. Log in with your Shopify account credentials
4. Enter the verification code shown in the terminal
5. Authorize access

---

### Step 8 — Preview Your Theme

Once authenticated, the terminal will show:

```
✔ Logged in.

Preview your theme (t)
  • http://127.0.0.1:9292
```

Open **http://127.0.0.1:9292** in your browser to see the live theme preview.

Any file changes you make will **auto-sync in real time** — just save the file and refresh the browser.

---

### Step 9 — Stop the Dev Server

Press `Ctrl + C` in the terminal to stop the server.

---

## Other Useful Commands

| Command | Description |
|---------|-------------|
| `shopify theme dev --store YOUR-STORE.myshopify.com` | Start local dev server with hot reload |
| `shopify theme push --store YOUR-STORE.myshopify.com` | Push theme to your store |
| `shopify theme push --store YOUR-STORE.myshopify.com --unpublished` | Push as an unpublished/draft theme |
| `shopify theme pull --store YOUR-STORE.myshopify.com` | Pull latest theme from store |
| `shopify theme check` | Lint theme for errors and best practices |
| `shopify theme package` | Package theme into a ZIP for upload |
| `shopify auth logout` | Log out (switch accounts/stores) |
| `shopify theme list --store YOUR-STORE.myshopify.com` | List all themes on your store |
| `shopify theme dev --port 3000` | Run dev server on a custom port |

---

## Upload to Shopify (Without CLI)

1. Zip the theme: select all files inside `luxe-theme/` (not the folder itself) and compress.
2. Go to **Shopify Admin → Online Store → Themes → Add theme → Upload zip file**.
3. The uploaded theme will be unpublished by default. Click **Publish** when ready.

---

## Troubleshooting

### "Node version must be >=20.10.0"

Update Node.js:
- If using **nvm**: `nvm install 20.10.0 && nvm use 20.10.0`
- Otherwise: download the latest LTS from https://nodejs.org/

### "You are not authorized to use the CLI"

- Make sure you can log in at `https://admin.shopify.com/store/YOUR-STORE/`
- You must be the **store owner** or have a **staff account**
- Collaborator accounts may not have CLI access
- Run `shopify auth logout` and try again

### "Nonexistent flag" errors

- Make sure you're inside the `luxe-theme` folder (not the parent directory)
- Check the Shopify CLI version: `shopify version`

### Dev server starts but page is blank

- Check that your store has at least one product
- Ensure the `templates/index.json` file is valid JSON
- Try a hard refresh: `Ctrl + Shift + R`

---

## Theme Structure

```
assets/          → CSS, JS files (luxe-theme.css, luxe-animations.css, luxe-theme.js)
config/          → Theme settings schema and defaults
layout/          → Main theme layout (theme.liquid)
locales/         → Translation strings (en.default.json)
sections/        → Modular page sections (header, footer, hero, collections, etc.)
snippets/        → Reusable Liquid partials (product-card, search-overlay, etc.)
templates/       → Page templates (product, collection, cart, index, etc.)
```

---

## Features

- Scroll-triggered animations with multiple animation types
- Custom cursor follower (desktop only)
- Parallax media sections
- Hero slideshow with particles
- Product gallery with swipe and zoom
- Magnetic buttons and tilt effects
- Cart drawer with AJAX add-to-cart and free shipping progress bar
- Color swatches with Indian color name support (maroon, wine, dusty rose, etc.)
- Size chart modal with measurement guide
- Kurti-specific product meta (fabric, fit, sleeve, occasion, length)
- Newsletter popup
- Search overlay with product type filter
- Fully responsive design
- Customizable via Shopify Theme Editor

---

## Customization

Open the **Theme Editor** in Shopify Admin to configure:

- **Colors** — Accent, text, background, surface, border
- **Typography** — Heading and body fonts (via Shopify font picker)
- **Layout** — Container width, section spacing, border radius
- **Animations** — Toggle scroll animations, custom cursor, newsletter popup
- **Social Media** — Instagram, Facebook, Twitter/X, Pinterest, TikTok URLs
- **Favicon** — Upload a 32×32 PNG

---

## License

Proprietary. All rights reserved.
