# Miracle Financial — Mortgage Calculator
## Deploy to SiteGround + WordPress Auto-Update Guide

---

## FIRST-TIME SETUP (do once)

### Step 1 — Install Node.js
Download from https://nodejs.org — install the LTS version.

### Step 2 — Unzip this folder
Extract everything to a folder on your computer, e.g. `mortgage-calculator/`

### Step 3 — Install dependencies
Open Terminal (Mac) or Command Prompt (Windows), navigate to the folder:
```
cd mortgage-calculator
npm install
```
This takes ~1 minute the first time.

### Step 4 — Build the app
```
npm run build
```
This creates a `dist/` folder with the ready-to-upload files.

### Step 5 — Upload to SiteGround
1. Log in to SiteGround → Site Tools → File Manager
2. Navigate to `public_html/`
3. Create a new folder called `calc`
4. Upload ALL contents of your local `dist/` folder into `public_html/calc/`

Your calculator is now live at: **https://miraclefinancial.ca/calc/**

### Step 6 — Embed in WordPress (do once, never again)
1. Go to WordPress → Pages → "Mortgage Calculator"
2. Add a "Custom HTML" block
3. Paste this code:

```html
<iframe 
  src="https://miraclefinancial.ca/calc/" 
  width="100%" 
  height="950px" 
  frameborder="0" 
  style="border:none; min-height:950px;"
  title="Miracle Financial Mortgage Calculator">
</iframe>
```

4. Save & publish.

✅ The calculator is now embedded at miraclefinancial.ca/mortgage-calculator/

---

## UPDATING THE CALCULATOR (every time after changes)

When you update the calculator in Claude:

1. Download the new `miracle-mortgage-calculator.jsx` file from Claude
2. Replace `src/App.jsx` with the downloaded file (rename it to `App.jsx`)
3. Run `npm run build` in your terminal
4. Upload the new `dist/` folder contents to `public_html/calc/` on SiteGround
   (overwrite existing files)

**WordPress updates automatically** — the iframe always loads the latest version.
No WordPress login needed. ✅

---

## FASTER OPTION: GitHub Auto-Deploy (zero manual uploads)

If you want fully automatic deployment (push code → website updates):

1. Create a free GitHub account at github.com
2. Create a new repository called `miracle-calculator`
3. Connect SiteGround to GitHub via Site Tools → Deployments → Git
4. Every time you push code, SiteGround auto-builds and deploys

Ask Claude to set up the GitHub Actions workflow file for you.

---

## FILE STRUCTURE
```
mortgage-calculator/
├── src/
│   ├── App.jsx          ← THE CALCULATOR (replace this when updating)
│   └── main.jsx         ← Entry point (never change)
├── index.html           ← HTML shell (never change)
├── package.json         ← Dependencies (never change)
├── vite.config.js       ← Build config (never change)
└── README.md            ← This file
```

---

## SUPPORT
Miracle Financial · 905-588-4242 · miraclefinancial.ca
