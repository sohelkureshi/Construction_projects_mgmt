# Construction Management Monorepo

This project is now split into two applications:

- `backend/` -> Node.js + Express + MongoDB API server
- `frontend/` -> Vue 3 + Vite single-page application

## Run locally

Backend:

```bash
npm --prefix backend run dev
```

Frontend:

```bash
npm --prefix frontend run dev
```

## Notes

- Existing CSS and image assets were copied into `frontend/public/` so the new Vue UI keeps the same visual direction.
- The new backend entrypoint is `backend/server.js`.
- Legacy server-rendered files remain in the repository for reference during the transition, but the new split app should be treated as the source of truth.
