# SiteFrame

Construction project management, organized as two independently deployable applications.

## Structure

- `frontend/` - Next.js 15 App Router web application
- `backend/` - Node.js, Express, MongoDB, Socket.IO API

## Local development

1. Copy `backend/.env.example` to `backend/.env`, then set `MONGO_URI`, `JWT_SECRET`, and the Cloudinary values.
2. Copy `frontend/.env.local.example` to `frontend/.env.local`.
3. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`. The account is created on the first backend start. Set `ADMIN_RESET_PASSWORD_ON_BOOT=true` only when you need to reset that password, then set it back to `false`.
4. In one terminal, run `cd backend`, `npm install`, then `npm run dev`. The API runs on `http://localhost:3000`.
5. In another terminal, run `cd frontend`, `npm install`, then `npm run dev`. Open `http://localhost:5000`.

## Production

Run `npm run build` followed by `npm start` in `frontend`. Run `npm start` in `backend` with `NODE_ENV=production`, `FRONTEND_URL` set to the deployed frontend URL, and secure, production MongoDB/JWT/Cloudinary environment values. Deploy the two applications as separate services and terminate HTTPS before the API so secure authentication cookies are enabled.
