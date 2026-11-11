# Deployment Guide (Free Tier)

This guide explains how to deploy the SaaS URL Shortener for free using:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: TiDB Cloud (Serverless MySQL)

## 1. Database (TiDB Cloud)
1. Sign up at [TiDB Cloud](https://tidbcloud.com/).
2. Create a new **Serverless Tier** cluster (Free).
3. Once created, click **Connect** to get your connection details.
4. You will need:
   - Host
   - Port (usually 4000)
   - User
   - Password
   - Database Name (default is `test`, you can create `url_shortener`)

## 2. Backend (Render)
1. Push your code to GitHub.
2. Sign up at [Render](https://render.com/).
3. Create a new **Web Service**.
4. Connect your GitHub repository.
5. **Settings**:
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Region**: Choose one close to you.
6. **Environment Variables**:
   Add the following variables using the details from TiDB:
   - `MYSQL_HOST`: (Your TiDB Host)
   - `MYSQL_PORT`: `4000`
   - `MYSQL_USER`: (Your TiDB User)
   - `MYSQL_PASSWORD`: (Your TiDB Password)
   - `MYSQL_DB`: `test` (or your chosen DB name)
   - `SECRET_KEY`: (Generate a random string)
   - `PORT`: `8000` (Render might set this automatically, but good to be safe)

7. Deploy! Render will build the Docker image and start the service.
8. Copy the **Service URL** (e.g., `https://my-api.onrender.com`).

## 3. Frontend (Vercel)
1. Sign up at [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. **Configure Project**:
   - **Root Directory**: Click Edit and select `frontend`.
   - **Framework Preset**: Vite (should be auto-detected).
5. **Environment Variables**:
   - `VITE_API_URL`: Paste your Render Backend URL (e.g., `https://my-api.onrender.com`).
   - **IMPORTANT**: Do NOT add a trailing slash `/`.
6. Deploy!

## 4. Final Verification
1. Open your Vercel URL.
2. Try to Sign Up.
3. If successful, your full stack is running for free!
