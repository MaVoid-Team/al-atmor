# Al-Atmor

Premium e-commerce for electronics and more — Next.js storefront (EN/AR locales, PWA) plus an Express/Sequelize API and PostgreSQL, shippable with Compose.

Installable as a Progressive Web App (offline cache, service worker, install prompts) and packable to APK via tools like PWABuilder for tester distribution.

## Who it's for

- Brands selling electronics (or similar catalogs) that need a bilingual shop
- Teams that want storefront + API + DB in one container stack
- Anyone shipping a PWA-first commerce experience to mobile testers

## What you get

- Locale-aware Next.js frontend (`next-intl`) with product browsing and checkout UX
- Express TypeScript API (Sequelize, JWT, Cloudinary uploads, payment-ready hooks)
- PostgreSQL via Compose
- PWA: manifest, icons, service worker caching, offline + install pages
- Guides: `QUICK_START.md`, `PWA_IMPLEMENTATION_SUMMARY.md`, `DEPLOYMENT.md`
- Live demo: [al-atmor.vercel.app](https://al-atmor.vercel.app)

## Try it

**Live:** [Open Al-Atmor](https://al-atmor.vercel.app) (try `/en` for English)

**Frontend (PWA test):** under `frontend/`, sync deps, run production `build` then `start`, open http://localhost:3000/en, and check DevTools → Application for the service worker.

**Full stack:** put real credentials in `backend/.env` (never commit secrets), then Compose build, run migrations on the backend service, and bring the stack up. See `DEPLOYMENT.md` for ports, host nginx, and env var names.

**APK for testers:** deploy over HTTPS, then package with [PWABuilder](https://www.pwabuilder.com/) — steps in `QUICK_START.md`.

## Stack

Next.js · next-intl · next-pwa · Express · Sequelize · PostgreSQL · Cloudinary · Compose

---

[MaVoid](https://mavoid.com) · [LinkedIn](https://linkedin.com/in/ziad-ahmed-634202332) · [GitHub](https://github.com/Ziad-NasrEldin)
