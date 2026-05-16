# FundBridge

Local development and deploy notes.

## Backend

- Copy `.env.example` to `backend/.env` and set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URLS`, and Firebase variables if used.
- Install dependencies and run in dev:

```powershell
cd backend
npm install
npm run dev
```

The backend serves uploads at `/uploads` and exposes APIs under `/api`.

## Frontend

- Install and run:

```powershell
cd frontend
npm install
npm run dev
```

- Build for production:

```powershell
cd frontend
npm run build
```

## Pushing to GitHub

- Secrets (service account JSON) must not be committed. Ensure `backend/.gitignore` contains `serviceAccountKey.json`.
- If you need to remove a secret from history, use a tool like `git filter-repo` or contact the project owner to reset the repository.

## Notes

- Uploaded pitch files are saved to `backend/uploads` (ignored by git).
- API endpoints added:
  - `POST /api/startup/create` (auth required, role: founder/startup_rep). Accepts `multipart/form-data` with `pitchUpload` file.
  - `POST /api/investor/create` (auth required, role: investor).
# fundbridge
🚀 MERN Stack investor-founder matchmaking platform inspired by PitchStreet &amp; AngelList, featuring startup discovery, investor networking, real-time chat, deal tracking, and trust verification.
