# NoorTime Frontend

React + Vite + TypeScript + Tailwind CSS frontend.

## Setup

```bash
cp .env.example .env.local   # fill in VITE_API_URL
npm install
npm run dev
```

App runs on `http://localhost:5173`.

## Environment Variables

| Variable        | Description                         |
|-----------------|-------------------------------------|
| `VITE_API_URL`  | Backend base URL (no trailing slash) |

In development the Vite proxy forwards `/api` to `http://localhost:3001` automatically — `VITE_API_URL` can be left empty.

## Pages

| Route        | Auth required | Description                    |
|--------------|---------------|--------------------------------|
| `/`          | No            | Landing / marketing page       |
| `/dashboard` | Yes           | Prayer times + live countdown  |
| `/schedule`  | No            | Weekly / monthly timetable     |
| `/streak`    | Yes           | Streak stats + heatmap         |
| `/qibla`     | No            | Qibla compass                  |
| `/mosques`   | No            | Nearby mosque search           |
| `/settings`  | Yes           | Calculation method + prefs     |

## Production

```bash
VITE_API_URL=https://api.your-domain.com npm run build
pm2 start ecosystem.config.cjs   # serves dist/ as SPA on port 3000
```
