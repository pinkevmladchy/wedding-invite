# Wedding Invitation — Дмитро & Ірина

A personal, single-page wedding invitation built with Vue 3 + Vite + TypeScript. Guests enter a personal code to unlock the invitation, see a short welcome screen with their name, and reach a full invitation page with venue, schedule, dress code, and an RSVP form.

**Date:** 29 серпня 2026 · **Місце:** Cafe Gallerist, Буча

---

## How it works

1. **Code screen** — guest enters a personal invitation code (e.g. `GUEST01`).
2. **Reveal screen** — short animated greeting with the guest's name.
3. **Invitation** — full page with:
   - Місце (venue + ceremony / reception times, map link)
   - Програма вечора (timeline)
   - Дрес-код (style + colour swatches)
   - Підтвердження (RSVP form submitted via Formspree)

Guest codes and names are defined in `src/composables/useInvite.ts` (`GUEST_LIST`).

---

## Configuration

Most copy lives in `src/App.vue` under the `WEDDING` object — names, dates, venue, schedule, dress code, photo URLs.

- **Photos:** drop `couple-portrait.jpg` and `couple-detail.jpg` into `public/`.
- **RSVP endpoint:** set `FORMSPREE_ENDPOINT` in `src/App.vue` to your own Formspree form.
- **Guests:** edit `GUEST_LIST` in `src/composables/useInvite.ts`.

---

## Project setup

```sh
npm install
```

### Develop with hot reload

```sh
npm run dev
```

### Type-check, build for production

```sh
npm run build
```

### Preview the production build

```sh
npm run preview
```

### Deploy to GitHub Pages

```sh
npm run deploy
```

---

## Stack

- Vue 3 (`<script setup>`) + TypeScript
- Vite 7
- Formspree (RSVP submissions)
- `gh-pages` for deployment
