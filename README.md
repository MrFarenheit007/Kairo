# ShopEase — Full-Stack Ecommerce App

A production-quality ecommerce application built with React (Vite), Node.js/Express, and PostgreSQL.

- **Frontend** → deployed on **Netlify** (free tier)
- **Database** → hosted on **Supabase** (free tier PostgreSQL)
- **Backend API** → deployed on **Render** (free tier Node.js hosting)

> **Why not host the Express API on Supabase?**  
> Supabase's free tier provides a PostgreSQL database, file storage, and Deno-based Edge Functions — but it does not host Node.js / Express servers. Render.com is the easiest free option for a standard Express API. It connects to your Supabase database via the `DATABASE_URL` environment variable.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v7, Context API, Axios |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcryptjs (cost 12) |
| Security | Helmet, CORS, express-rate-limit, express-validator |

---

## Project Structure

```
ecommerceApp/
├── public/
│   └── images/            ← Product photos served as static files
├── src/
│   ├── api/axios.js       ← Axios instance (reads VITE_API_URL env var)
│   ├── context/           ← AuthContext, CartContext
│   ├── components/        ← Navbar, Footer, ProductCard, ProtectedRoute
│   └── pages/             ← Home, Products, Cart, Checkout, Orders, Profile, Login, Register
├── BackEnd/
│   ├── config/db.js       ← PostgreSQL pool (DATABASE_URL)
│   ├── middleware/        ← auth.js (JWT), validate.js (express-validator)
│   ├── routes/            ← auth, products, cart, orders, user
│   ├── server.js          ← Express app entry point
│   ├── schema.sql         ← Full DB schema — run once to create tables
│   └── seed.sql           ← 9 seed products (5 use /images/ from Netlify)
├── netlify.toml           ← Netlify build config + SPA redirect rule
└── README.md
```

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally

```bash
# 1. Install frontend dependencies (from project root)
npm install

# 2. Install backend dependencies
cd BackEnd && npm install && cd ..

# 3. Create local PostgreSQL database
createdb ecommerce_db

# 4. Create the tables
psql -d ecommerce_db -f BackEnd/schema.sql

# 5. Seed products
psql -d ecommerce_db -f BackEnd/seed.sql

# 6. Configure backend environment
cp BackEnd/.env.example BackEnd/.env
# Open BackEnd/.env and fill in your values (see table below)

# 7. Start backend (port 5000)
cd BackEnd && npm run dev

# 8. In a new terminal — start frontend (port 5173)
npm run dev
```

Open **http://localhost:5173** — the Vite dev server proxies `/api/*` to `http://localhost:5000`.

### Backend `.env` (local)

```
PORT=5000
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/ecommerce_db
JWT_SECRET=change_this_to_a_very_long_random_string_min_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Production Deployment — Step by Step

### Step 0 — Push your code to GitHub

All three services (Supabase, Render, Netlify) connect to GitHub to pull your code and schema files.

```bash
git init                          # if not already a git repo
git add .
git commit -m "initial commit"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

### Step 1 — Database on Supabase

#### 1.1 Create a Supabase project

1. Go to **https://supabase.com** and click **Start your project** → sign up / log in.
2. Click **New project**.
3. Fill in:
   - **Name**: `shopease` (or any name)
   - **Database password**: choose a strong password — **save this, you will need it**.
   - **Region**: pick the one closest to your users.
4. Click **Create new project** and wait ~2 minutes for provisioning.

#### 1.2 Get your connection string

1. In the left sidebar go to **Settings** → **Database**.
2. Scroll to **Connection string** section.
3. Select the **URI** tab.
4. Copy the string — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the database password you set in Step 1.1.
6. **Save this as your `DATABASE_URL`** — you will paste it into Render and your local `.env`.

> **Note:** Supabase also offers a **connection pooler** URL (port 6543) using PgBouncer. For an Express app with `node-postgres` (`pg`), use the **direct connection** (port 5432), not the pooler.

#### 1.3 Run the schema

1. In the Supabase dashboard left sidebar, click **SQL Editor**.
2. Click the **+** icon to open a new query tab.
3. Open `BackEnd/schema.sql` from your project, copy its entire contents, paste into the SQL Editor.
4. Click **Run** (▶ button). You should see `Success. No rows returned.`

#### 1.4 Run the seed data

1. Open another SQL Editor tab (click **+** again).
2. Open `BackEnd/seed.sql`, copy its entire contents, paste into the SQL Editor.
3. Click **Run**. You should see `Success. 9 rows affected.`

> **About product images in the seed:**  
> Five clothing products use image paths like `/images/jeans-jacket.jpg`. These are static files served from your Netlify frontend (`public/images/`). The Supabase database stores the path as a string; the browser resolves it against the Netlify domain. **Deploy Netlify first** (Step 3) and the images will appear automatically.

#### 1.5 Verify (optional)

In the SQL Editor run:
```sql
SELECT name, category, image FROM products;
```
You should see 9 rows.

---

### Step 2 — Backend API on Render

#### 2.1 Create a Render account

1. Go to **https://render.com** and click **Get Started for Free** → sign up with GitHub.

#### 2.2 Create a Web Service

1. Click **New +** → **Web Service**.
2. Click **Connect a repository** and select your GitHub repo.
3. Fill in the settings:

   | Setting | Value |
   |---|---|
   | **Name** | `shopease-api` (or any name) |
   | **Region** | Closest to your users |
   | **Root directory** | `BackEnd` |
   | **Runtime** | Node |
   | **Build command** | `npm install` |
   | **Start command** | `node server.js` |
   | **Instance type** | Free |

4. Click **Advanced** to add environment variables (do this before deploying).

#### 2.3 Set environment variables on Render

Click **Add Environment Variable** for each:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Supabase connection string from Step 1.2 |
| `JWT_SECRET` | A long random string (generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://YOUR-SITE.netlify.app` ← fill this in after Step 3 |

> You can come back and add/update `FRONTEND_URL` after you know your Netlify URL. Render redeploys automatically when you save environment variable changes.

#### 2.4 Deploy

1. Click **Create Web Service**.
2. Render will pull your code, run `npm install`, and start the server.
3. Watch the deploy log — look for `🚀 Server running on port 10000` (Render assigns its own port via the `PORT` env var which Express automatically uses).
4. Once live, your API URL will be something like `https://shopease-api.onrender.com`.
5. **Test it** by visiting `https://shopease-api.onrender.com/api/health` — you should see `{"status":"ok"}`.

> **Important — Render free tier sleep:**  
> Free Render services spin down after **15 minutes of inactivity**. The first request after sleep takes 30–60 seconds to wake up. This is normal on the free tier. Upgrading to a paid Render plan ($7/month) removes the sleep behaviour.

---

### Step 3 — Frontend on Netlify

#### 3.1 Create a Netlify account

1. Go to **https://netlify.com** and click **Sign up** → connect with GitHub.

#### 3.2 Import your project

1. In the Netlify dashboard click **Add new site** → **Import an existing project**.
2. Click **Deploy with GitHub** and select your repository.

#### 3.3 Configure build settings

Netlify should auto-detect Vite, but confirm these settings:

| Setting | Value |
|---|---|
| **Base directory** | *(leave empty — project root)* |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

> The `netlify.toml` file in the root already defines these settings and the SPA redirect rule, so Netlify will read them automatically.

#### 3.4 Set environment variables on Netlify

Before clicking **Deploy**, click **Show advanced** → **New variable**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://shopease-api.onrender.com/api` ← your Render URL + `/api` |

> `VITE_API_URL` is read at **build time** by Vite (all `VITE_` prefixed variables are baked into the bundle). Every time you change this value you must trigger a new deploy.

#### 3.5 Deploy

1. Click **Deploy site**.
2. Netlify builds the React app (`npm run build`), uploads the `dist/` folder, and gives you a URL like `https://random-name-123456.netlify.app`.
3. Visit your site — it should be live.

#### 3.6 (Optional) Set a custom subdomain

In **Site configuration** → **Domain management** → click **Options** → **Edit site name** to change the subdomain to something like `shopease.netlify.app`.

#### 3.7 Go back and update Render

Now that you know your Netlify URL:
1. Go back to your Render service → **Environment**.
2. Update `FRONTEND_URL` to `https://YOUR-SITE.netlify.app`.
3. Render redeploys automatically.

---

### Step 4 — Post-Deployment Checklist

- [ ] Visit `https://your-api.onrender.com/api/health` → returns `{"status":"ok"}`
- [ ] Visit your Netlify URL → homepage loads with products and images
- [ ] Register a new account → redirected to home
- [ ] Add a product to cart → appears in cart
- [ ] Proceed to checkout → order placed, redirected to Orders page
- [ ] Check that clothing product images load (served from `/images/` on Netlify)
- [ ] Check the Supabase SQL Editor: run `SELECT * FROM orders;` to confirm orders are saved

---

## Environment Variables Reference

### Backend (`BackEnd/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port Express listens on (Render sets this automatically) | `5000` |
| `DATABASE_URL` | Full PostgreSQL connection string | `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | Random secret for signing JWTs — keep private | 96-char hex string |
| `JWT_EXPIRES_IN` | JWT lifespan | `7d` |
| `NODE_ENV` | `development` or `production` | `production` |
| `FRONTEND_URL` | Allowed CORS origin | `https://your-site.netlify.app` |

### Frontend (Netlify environment variables)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Full URL to backend API (including `/api`) | `https://shopease-api.onrender.com/api` |

> In local dev `VITE_API_URL` is **not set** — Vite's proxy (`/api` → `http://localhost:5000`) handles it automatically.

---

## API Endpoints

| Method | Route | Auth Required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/products` | No | List all products (`?category=clothing`) |
| GET | `/api/products/:id` | No | Single product |
| GET | `/api/cart` | Yes | Get logged-in user's cart |
| POST | `/api/cart` | Yes | Add / upsert item |
| PUT | `/api/cart/:id` | Yes | Update quantity |
| DELETE | `/api/cart/:id` | Yes | Remove item |
| POST | `/api/orders` | Yes | Place order + clear cart |
| GET | `/api/orders` | Yes | Order history |
| GET | `/api/user` | Yes | Get profile |
| PUT | `/api/user` | Yes | Update profile / change password |
| GET | `/api/health` | No | Health check |

---

## Security

- Parameterized SQL queries (no injection risk)
- bcrypt password hashing (cost factor 12)
- JWT authentication with expiration
- Helmet security headers
- CORS restricted to `FRONTEND_URL`
- Rate limiting on auth endpoints (20 requests / 15 min)
- Input validation with express-validator
- Per-user ownership checks on cart and orders
- UUID format validation before DB queries


A full-stack, production-quality ecommerce application built with React (Vite), Node.js/Express, and PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|-------|----------|
| Frontend | React 19 + Vite, React Router, Context API, Axios, Plain CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL (raw SQL, parameterized queries) |
| Auth | JWT (stored in localStorage) + bcryptjs |
| Security | Helmet, CORS, rate-limiting, input validation |

---

## Project Structure

```
ecommerceApp/
├── BackEnd/               ← Express API server
│   ├── config/db.js       ← PostgreSQL pool
│   ├── middleware/
│   │   ├── auth.js        ← JWT verification middleware
│   │   └── validate.js    ← express-validator error handler
│   ├── routes/
│   │   ├── auth.js        ← POST /register, /login
│   │   ├── products.js    ← GET /products, /products/:id
│   │   ├── cart.js        ← CRUD /cart
│   │   ├── orders.js      ← POST/GET /orders
│   │   └── user.js        ← GET/PUT /user
│   ├── server.js          ← Express app entry point
│   ├── schema.sql         ← Final database schema (run once)
│   └── seed.sql           ← 7 seed products
│
└── src/                   ← React frontend
    ├── api/axios.js        ← Axios instance with interceptors
    ├── context/
    │   ├── AuthContext.jsx ← Global auth state
    │   └── CartContext.jsx ← Cart state (guest + logged-in)
    ├── components/
    │   ├── Navbar/
    │   ├── Footer/
    │   ├── ProductCard/
    │   └── ProtectedRoute/
    └── pages/
        ├── Home/
        ├── Products/
        ├── Cart/
        ├── Checkout/
        ├── Login/
        ├── Register/
        ├── Orders/
        └── Profile/
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

```bash
# Create the database
createdb ecommerce_db

# Run schema (creates all tables + indexes)
psql -d ecommerce_db -f BackEnd/schema.sql

# Seed with 7 products
psql -d ecommerce_db -f BackEnd/seed.sql
```

### 2. Backend Setup

```bash
cd BackEnd

# Copy and configure environment variables
cp .env.example .env
# Edit .env — set your DATABASE_URL and JWT_SECRET

# Start development server
npm run dev
# → http://localhost:5000
```

**Required `.env` variables:**
```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce_db
JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
# From the project root
npm install
npm run dev
# → http://localhost:5173
```

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/products` | No | List products (optional `?category=`) |
| GET | `/api/products/:id` | No | Single product |
| GET | `/api/cart` | Yes | Get user cart |
| POST | `/api/cart` | Yes | Add/upsert item |
| PUT | `/api/cart/:id` | Yes | Update quantity |
| DELETE | `/api/cart/:id` | Yes | Remove item |
| POST | `/api/orders` | Yes | Place order + clear cart |
| GET | `/api/orders` | Yes | Get order history |
| GET | `/api/user` | Yes | Get profile |
| PUT | `/api/user` | Yes | Update profile / password |

---

## Security Features

- ✅ Parameterized SQL queries (no injection risk)
- ✅ bcrypt password hashing (cost factor 12)
- ✅ JWT with expiration
- ✅ Helmet security headers
- ✅ CORS restricted to frontend origin
- ✅ Rate limiting on auth endpoints (20 req/15 min)
- ✅ Input validation via express-validator
- ✅ Authorization checks (users can only access own data)
- ✅ UUID validation before DB queries
- ✅ Generic error messages (no leak of internal details)

---

## Features

- 🔐 Register / Login / Persistent sessions
- 🛍 Product listing with search and category filtering
- 🛒 Cart — guest (localStorage) + logged-in (DB), auto-merge on login
- 💳 Checkout with form validation → creates order + clears cart
- 📦 Order history with expandable item details
- 👤 Profile edit (name, city, gender, password change)
- 📱 Fully responsive (mobile → desktop)
