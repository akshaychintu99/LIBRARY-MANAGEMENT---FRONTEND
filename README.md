# Library Management System — React Frontend

A modern, responsive, and aesthetic university library management portal built with **React.js 18**, **Vite 5**, **React Router 6**, and custom modern CSS with tailored HSL design tokens, glassmorphism, and micro-interactions.

---

## 1. Features

- **Role-Based Workflows**: Tailored user experiences for **Admin**, **Library Staff**, and **Student** members.
- **Security & Bot Protection**: Demonstration CAPTCHA puzzle verification on the login portal, protected routes, and session timeout handling.
- **Book Catalogue & Search**: Live multi-field query matching, category filtering, in-stock badges, and one-click borrowing reservation modals.
- **Circulation Desk**: Staff lending checkout, return processing, and real-time calculation of overdue days at **₹10 per overdue day**.
- **Fine Management & Payment Simulation**: Interactive payment modal supporting simulated UPI, Credit Card, Debit Card, and Net Banking with instant verifiable receipts.
- **User Account Management**: Full administrative control over university member accounts, role privileges, and account status toggles.

---

## 2. Prerequisites

- **Node.js**: v18.0.0 or higher (Installed: LTS v24.20.0)
- **npm**: v9.0.0 or higher

---

## 3. Installation & Local Development

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite local development server (with proxy to backend at http://localhost:8080)
npm run dev
```

The application will launch at `http://localhost:5173`.

---

## 4. Environment Variables

Create a `.env` file in the `frontend/` folder:

```properties
# Development (Uses Vite proxy to localhost:8080 by default):
# VITE_API_BASE_URL=

# Production (e.g. Render backend service URL):
VITE_API_BASE_URL=https://your-backend-api.onrender.com
```

---

## 5. Production Build

```bash
# Compile and optimize production distribution bundle
npm run build

# Preview production build locally
npm run preview
```

The production bundle is output to the `dist/` folder.

---

## 6. Deployment Guides

### Deploying on Vercel
1. Push `frontend/` to your GitHub repository `LIBRARY-MANAGEMENT-FRONTEND`.
2. Connect the repository in the [Vercel Dashboard](https://vercel.com).
3. Set the **Framework Preset** to **Vite**.
4. Set the **Build Command** to `npm run build` and **Output Directory** to `dist`.
5. Add the Environment Variable:
   - `VITE_API_BASE_URL` = `https://<YOUR_RENDER_BACKEND_URL>`
6. Click **Deploy**. Vercel will automatically apply `vercel.json` for single-page application routing.

### Deploying on Netlify
1. Connect your repository on [Netlify](https://app.netlify.com).
2. Set **Base directory** to `frontend` (or repository root if separate repo).
3. Set **Build command** to `npm run build`.
4. Set **Publish directory** to `dist`.
5. Under **Environment variables**, add:
   - `VITE_API_BASE_URL` = `https://<YOUR_RENDER_BACKEND_URL>`
6. Click **Deploy Site**. The `public/_redirects` file guarantees SPA route resolution.
