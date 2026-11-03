# Deploying Thriftzy to Vercel (Step-by-Step Guide)

Your Thriftzy store is 100% Vercel-ready with Outcrowd 3D design, smooth scrolling animations, and persistent database storage!

---

## Method 1: Deploy via GitHub & Vercel Dashboard (Recommended & Free Forever)

### Step 1: Initialize Git and Push to GitHub
Open your terminal in `C:\Users\User\Downloads\ABIN` and run:
```bash
git init
git add .
git commit -m "Thriftzy Outcrowd 3D Store with Database"
```
Create a new repository on [GitHub](https://github.com/new) named `thriftzy`, then run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/thriftzy.git
git branch -M main
git push -u origin main
```

### Step 2: Import into Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Select your `thriftzy` repository from the list and click **"Import"**.
4. Vercel automatically detects the framework preset as **Vite** and uses `dist` directory.
5. Click **"Deploy"**.

Your live URL (e.g. `https://thriftzy-store.vercel.app`) will be ready in under 60 seconds with SSL HTTPS!

---

## Method 2: Deploy directly from Terminal using Vercel CLI

Run the following command in your project folder:
```bash
npx vercel
```
1. Follow the prompt to log in via browser.
2. Confirm project name `thriftzy-store` and accept default settings (`dist` output).
3. In ~45 seconds, Vercel gives you your live production URL!

To deploy directly to production in the future:
```bash
npx vercel --prod
```

---

## 🗄️ How the Database Works on Vercel
* When running locally or on a Node server, Thriftzy uses a native **SQLite** database (`server/thriftzy.sqlite`).
* When deployed on **Vercel** (serverless CDN), Thriftzy seamlessly switches to its **High-Performance Browser Persistent Database**.
* **Zero Data Loss**: Every clothing piece you add, edit, or favorite is automatically saved.
* **1-Click Backup**: You can click **"Database"** in the navigation bar at any time to:
  - Download a `.json` backup file of your entire store (`Export Database`).
  - Restore or transfer your clothes to any new device with 1 click (`Import Database`).

---

## 💻 Running Locally
```bash
# Starts both the backend API and frontend
npm run dev

# Open in browser:
http://localhost:5173
```
