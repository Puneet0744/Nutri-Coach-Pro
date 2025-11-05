# Nutri-Coach-Pro - Backend (Express + Supabase)

## What I created
- `index.js` - Express server with endpoints:
  - `GET /api/health`
  - `GET /api/profile/:id`
  - `POST /api/profile`
  - `GET /api/recipes`
  - `POST /api/recipes`
- `.env.example` - environment variables to set (SUPABASE_URL, SUPABASE_SERVICE_KEY)
- `supabase_migrations.sql` - SQL to create `profiles` and `recipes` tables in Supabase
- `package.json`

## Setup
1. Create a Supabase project at https://app.supabase.com
2. In Project Settings -> API, copy the **Project URL** and **Service Role** key.
3. Run SQL from `supabase_migrations.sql` in Supabase SQL editor.
4. Locally, copy `.env.example` to `.env` and fill in values:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=service_role_key_here
   PORT=4000
   ```
5. Install dependencies and run:
   ```
   cd server
   npm install
   npm run dev
   ```

## Frontend integration (recommended)
- You can keep using Supabase auth from the frontend (the app already includes a Supabase client).
- After user signs in on the frontend, send requests to backend endpoints, including the user id:

Example: upsert profile from frontend (replace <USER_ID>):
```js
await fetch('http://localhost:4000/api/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: '<USER_ID>', age: 30, sex: 'male', height: 180 })
})
```

- To fetch recipes for a user:
```js
const res = await fetch('http://localhost:4000/api/recipes?user_id=<USER_ID>');
const recipes = await res.json();
```

## Security note
- Keep `SUPABASE_SERVICE_KEY` private (do NOT commit it).
- Use row-level security (RLS) in Supabase and implement auth verification in the backend if you need stricter security.
