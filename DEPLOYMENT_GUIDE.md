# 🚀 Gully Cricket Deployment Guide

This guide walks you step-by-step through deploying **Gully Cricket** to the cloud using free, production-ready platforms:
- **Backend**: [Render](https://render.com) (Spring Boot 3.3.5 / Java 21)
- **Database**: [MongoDB Atlas](https://cloud.mongodb.com) (Already configured & cloud-hosted)
- **Frontend**: [Vercel](https://vercel.com) (Vite + React 19)

---

## 📋 Pre-Deployment Summary

All configuration files and optimizations have already been prepared in your repository:
1. **[render.yaml](file:///c:/Users/rajas/OneDrive/Documents/Desktop/Gulli_Cricket_Project/render.yaml)**: Automatic Render Blueprint definition.
2. **[backend/Dockerfile](file:///c:/Users/rajas/OneDrive/Documents/Desktop/Gulli_Cricket_Project/backend/Dockerfile)**: Multi-stage Docker container build with memory optimization (`MaxRAMPercentage=75.0`).
3. **[HealthController.java](file:///c:/Users/rajas/OneDrive/Documents/Desktop/Gulli_Cricket_Project/backend/src/main/java/com/gullyCricket/backend/controller/HealthController.java)**: Dedicated health check endpoint (`/api/health` and `/`) for zero-downtime monitoring.
4. **[application.properties](file:///c:/Users/rajas/OneDrive/Documents/Desktop/Gulli_Cricket_Project/backend/src/main/resources/application.properties)**: Dynamic port binding (`${PORT:8086}`) and environment-driven MongoDB & JWT configurations.
5. **[vercel.json](file:///c:/Users/rajas/OneDrive/Documents/Desktop/Gulli_Cricket_Project/frontend/vercel.json)** & **[_redirects](file:///c:/Users/rajas/OneDrive/Documents/Desktop/Gulli_Cricket_Project/frontend/public/_redirects)**: Full Single Page Application (SPA) client-side routing support.
6. **[api.js](file:///c:/Users/rajas/OneDrive/Documents/Desktop/Gulli_Cricket_Project/frontend/src/services/api.js)**: Auto-normalizing base URL that handles trailing slashes and ensures `/api` routes work smoothly.

---

## Step 1: Push Changes to GitHub

Run the following command in your terminal to push the latest commit to your GitHub repository:

```bash
git push origin main
```

*(Repository: `https://github.com/Rajasekhar-WebDev/Gully-Cricket.git`)*

---

## Step 2: Configure MongoDB Atlas Network Access

Ensure MongoDB Atlas allows incoming connections from Render:
1. Open [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to **Network Access** under Security in the left sidebar.
3. Verify that IP Address `0.0.0.0/0` (Allow Access from Anywhere) is active.
   - If not, click **Add IP Address** -> select **Allow Access from Anywhere** -> click **Confirm**.

---

## Step 3: Deploy Backend on Render

You can deploy using either **Option A (One-click Blueprint)** or **Option B (Manual Web Service)**:

### Option A: Via Blueprint (Recommended)
1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** in the top right -> select **Blueprint**.
3. Select your repository: `Rajasekhar-WebDev/Gully-Cricket`.
4. Render will automatically detect [`render.yaml`](file:///c:/Users/rajas/OneDrive/Documents/Desktop/Gulli_Cricket_Project/render.yaml).
5. Review the plan (**Free**) and click **Apply**.
6. When deployment finishes, copy your backend URL (e.g., `https://gully-cricket-backend.onrender.com`).
7. Verify by opening `https://<your-backend-url>/api/health` in your browser. You should see:
   ```json
   {"status":"UP","service":"gully-cricket-backend"}
   ```

### Option B: Manual Web Service
1. On the Render Dashboard, click **New +** -> **Web Service**.
2. Connect `Rajasekhar-WebDev/Gully-Cricket`.
3. Fill in the fields:
   - **Name**: `gully-cricket-backend`
   - **Root Directory**: `backend`
   - **Language / Runtime**: `Docker` *(Render will build using `backend/Dockerfile`)*
   - **Instance Type**: `Free`
4. Expand **Environment Variables** and add:
   - `PORT`: `8086`
   - `SPRING_DATA_MONGODB_URI`: `mongodb+srv://raja99sekhar49_db_user:Balakrishna143Devamma@gulli-cricket.cq8yhmv.mongodb.net/gulli_cricket?retryWrites=true&w=majority&appName=Gulli-Cricket`
   - `JWT_SECRET`: `GulliCricketSuperSecretKeyForAuthenticationSigningKey2026!`
5. Click **Deploy Web Service**.

---

## Step 4: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `Rajasekhar-WebDev/Gully-Cricket`.
4. In the Project Setup screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
5. Expand the **Environment Variables** section and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-backend-url-from-step-3>.onrender.com/api`
   *(Example: `https://gully-cricket-backend.onrender.com/api`)*
6. Click **Deploy**.
7. Vercel will build the frontend in ~30 seconds and provide you with a live domain (e.g., `https://gully-cricket.vercel.app`).

---

## Step 5: Verification Checklist

Once both services are active:
- [ ] Open the Vercel URL and register or log in with an account.
- [ ] Create a match and test live scoring to verify real-time MongoDB Atlas persistence.
- [ ] Refresh any deep route (e.g. `/matches`, `/teams`) to verify SPA client routing works cleanly without 404s.
- [ ] View the dashboard and leaderboard to confirm statistics aggregation.
