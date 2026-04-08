# IPL ProPick

A production-style IPL match prediction app built with React + Vite, Tailwind CSS, Supabase, and Netlify. Users stay signed in, predict match winners once, earn 1 point for each correct pick, and climb the leaderboard with early-pick tie-breakers.

## Features
- Email/password auth with persistent sessions
- Optional Google OAuth
- Predict each match once (only on match day)
- Forgot password via email OTP
- Leaderboard with tie-breakers (earlier predictions rank higher)
- Auto match + result sync (no admin needed)
- In-app notifications (results + new messages)
- 1:1 chat between users + public profiles
- Mobile-first responsive UI

## Tech Stack
- Frontend: React + Vite
- Styling: Tailwind CSS
- Auth & DB: Supabase (RLS enabled)
- Hosting: Netlify

## Local Setup
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create a Supabase project**
   - Get your **Project URL** and **Anon Key**.
   - Disable **email confirmations** if you want instant login on signup.
3. **Apply database schema**
   - Open `supabase/schema.sql` and run it in Supabase SQL editor.
4. **Create `.env`**
   ```bash
   cp .env.example .env
   ```
5. **Run the app**
   ```bash
   npm run dev
   ```

## Environment Variables
See `C:\Users\sanch\OneDrive\Desktop\IPL PREDICTION APP\.env.example`.

Required (client):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Required (Netlify function only):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

CricketData / CricAPI (fixtures + results):
- `CRICKET_API_URL` (default in `.env.example`)
- `CRICKET_API_KEY`
- `CRICKET_SERIES_ID` (optional; if omitted we filter the matches list)
- `CRICKET_SERIES_YEAR` (defaults to 2026)
- `CRICKET_SERIES_NAME` (defaults to Indian Premier League)
- `PREDICTION_LOCK_MINUTES` (0 = match start time)
- `CRICKET_MAX_INFO_CALLS` (limit extra match_info calls)
- `CRICKET_MAX_MATCH_PAGES` (how many pages to scan for matches)
- `SYNC_SECRET` (optional)

## Google OAuth Setup
1. Create OAuth client in Google Cloud Console.
2. Add Supabase callback URL as an authorized redirect URI:
   `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
3. In Supabase: **Authentication → Providers → Google**, paste Client ID and Secret, and add redirect URLs for:
   - `http://localhost:5173`
   - your Netlify domain

## Forgot Password (OTP)
This app uses **email OTP** for password reset:
1. In Supabase **Authentication → Providers → Email**, enable email OTP.
2. Update the Magic Link email template to include `{{ .Token }}` so the OTP code is sent.

## Match Sync
The Netlify function `netlify/functions/sync-matches.cjs` pulls IPL 2026 fixtures and results from CricketData / CricAPI and updates Supabase. It also updates winners and points once results are available.

You can protect the endpoint by setting `SYNC_SECRET` and sending it as `x-sync-secret`.

## Netlify Deployment
1. Push this repo to GitHub.
2. Create a new Netlify site from the repo.
3. Set build command: `npm run build`
4. Set publish folder: `dist`
5. Add environment variables (both client + function keys).

`netlify.toml` and `public/_redirects` are already configured for SPA routing.

## Notes
- Predictions are **one per match** (DB constraint + UI).
- Predictions are allowed only on match day after 12:00 AM IST and close at lock time.
- Leaderboard tie-breaker uses earliest correct prediction, then earliest prediction.
- Enable Realtime for `messages` and `notifications` tables for live chat/alerts.

## Scripts
- `npm run dev` - local dev
- `npm run build` - production build
- `npm run preview` - preview build
