---
name: react-conference
description: Tambah/ubah fitur di react-conference (React + Vite + shadcn/ui + SWR + Zustand) mengikuti pola peternak-web — service hook, module, page, route, store. Gunakan saat diminta membuat halaman, komponen UI, endpoint call, atau route.
---

# react-conference — workflow fitur

Baca `CLAUDE.md` untuk konvensi. Urutan kerja:

1. **Cari yang mirip dulu**: `modules/room/*` (form + view), `services/room/hooks/useSendSdp.ts` (hook mutasi), `hooks/useConference.ts` (WebRTC).
2. **Service** — `services/<area>/<fitur>/hooks/useXxx.ts` + `interfaces/xxx.type.ts`.
   - GET: `useSWR(url?querystring, fetcher)` → `{ data, loading, error }`; query pakai `query-string` (`skipEmptyString`, `skipNull`).
   - Mutasi: async fn → `{ response, error }`, pakai `requestError()`; setelah sukses `useRevalidateMutation()(/^\/path/)`.
   - Axios hanya lewat `@lib/axios-instance`.
3. **UI** — gunakan shadcn: cek `src/components/ui`; belum ada → `npx shadcn@latest add <nama>`. Styling pakai token tema + `cn()`.
4. **Module** (`modules/<area>/<fitur>`) berisi logika tampilan; **page** (`pages/<area>`) tipis, export di `index.ts`.
5. **Route** di `routes/_<area>.routes.tsx`, daftarkan di `routes/index.routes.tsx`.
6. **Store** — slice di `store/slices/<nama>.slice.ts`, gabungkan di `store/useStore.ts`.
7. Verifikasi: `npm run build && npm run lint` (tidak ada test runner). Lalu `npm run dev` bersama `make run` di go-conference untuk uji nyata.

Aturan: alias import, `import type`, tanpa `enum`, teks UI Bahasa Indonesia, `.env` hanya dibaca di `constants/config.ts`.
