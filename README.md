# Arnav Singh — Portfolio

```
portfolio/
├── frontend/
│   └── index.html          ← Deploy to Vercel / Netlify
└── backend/
    ├── server.js            ← Express + MongoDB Atlas API
    ├── package.json
    ├── .env.example         ← Copy to .env and fill in
    └── .gitignore
```

---

## Backend Setup (MongoDB Atlas + Express)

### 1. Create MongoDB Atlas Cluster
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create a free cluster
2. **Database Access** → Add user with password
3. **Network Access** → Add IP `0.0.0.0/0` (allow all, for hosting)
4. **Connect** → Drivers → Copy connection string

### 2. Install & Configure
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
PORT=5000
ALLOWED_ORIGIN=https://your-frontend-domain.com
ADMIN_TOKEN=pick_any_long_random_string
```

### 3. Run locally
```bash
npm run dev      # development (nodemon)
npm start        # production
```

### 4. Deploy Backend to Render (free)
1. Push `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Set environment variables (same as `.env`)
5. Build command: `npm install` · Start command: `node server.js`
6. Copy the live URL (e.g. `https://arnav-api.onrender.com`)

---

## Frontend Setup

### 1. Point to your backend
In `frontend/index.html`, find line:
```js
var API_URL = 'https://your-backend.onrender.com/api/contact';
```
Replace with your actual Render URL.

### 2. Deploy Frontend to Vercel
```bash
npm i -g vercel
cd frontend
vercel
```
Or drag-drop `frontend/` to [vercel.com/new](https://vercel.com/new)

### 3. Deploy Frontend to Netlify
Drag-drop `frontend/` folder to [app.netlify.com/drop](https://app.netlify.com/drop)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/contact` | Save a contact message |
| `GET` | `/api/messages` | View all messages (requires `x-admin-token` header) |
| `DELETE` | `/api/messages/:id` | Delete a message (requires `x-admin-token` header) |
| `GET` | `/api/health` | Health check |

### View messages (curl example)
```bash
curl https://your-api.onrender.com/api/messages \
  -H "x-admin-token: your_admin_token_here"
```

---

## Update Your GitHub/LinkedIn Links
In `frontend/index.html`, search for `github.com/arnavsingh` and `linkedin.com/in/arnavsingh` and replace with your actual URLs.
