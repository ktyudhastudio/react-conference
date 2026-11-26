# CLAUDE.md

Frontend `react-conference` — klien video conference untuk server `../go-conference` (signaling WebRTC). Struktur & konvensi mengikuti `peternak-web`, design system **shadcn/ui**.

## Stack
- React 19 + TypeScript (strict) + Vite 8, ESM
- Tailwind CSS v4 (`@tailwindcss/vite`) + **shadcn/ui** (style base-nova, ikon lucide, `components.json`)
- Routing `react-router-dom` v7 · data `swr` + `axios` · state `zustand` (slice) · form `react-hook-form` · toast `sonner`
- Lint: `oxlint`

## Perintah
```bash
npm run dev      # Vite :5173, proxy /webrtc → http://localhost:8080 (go-conference)
npm run build    # tsc -b && vite build
npm run lint
npx shadcn@latest add <komponen>   # tambah komponen ke src/components/ui
```
Tidak ada test runner; verifikasi dengan `npm run build` dan `npm run lint`.

## Environment
Salin `.env.example` → `.env`. Semua `VITE_*`, dibaca **hanya** lewat `src/constants/config.ts`. `VITE_BASE_API_URL` kosong = pakai proxy Vite. Jangan commit `.env`.

## Struktur `src/`
| Folder | Isi |
|---|---|
| `pages/<area>` | Halaman tipis (route target), export via `pages/<area>/index.ts` |
| `modules/<area>/<fitur>` | Komponen fitur (form, view) |
| `services/<area>/<fitur>/{hooks,interfaces}` | Hook axios/SWR + tipe |
| `store/` | Zustand: `useStore.ts` + slice di `store/slices/*.slice.ts` |
| `routes/` | `_<area>.routes.tsx` + `index.routes.tsx` |
| `components/ui` | Komponen shadcn (hasil `shadcn add`; boleh diubah) |
| `components/common` | Komponen reusable buatan sendiri (mis. `VideoTile`) |
| `layouts/`, `hooks/`, `helpers/`, `constants/`, `lib/`, `context/`, `styles/` | Util umum |

## Path alias
`@/`, `@components`, `@context`, `@constants`, `@helpers`, `@hooks`, `@layouts`, `@lib`, `@modules`, `@pages`, `@routes`, `@services`, `@store`, `@styles`, `@assets`.
Didefinisikan di **dua tempat**: `vite.config.ts` dan `tsconfig.app.json`. Komponen shadcn memakai `@/components/ui/*` dan `@/lib/utils`.

## Konvensi
- Import pakai alias, bukan path relatif panjang (relatif hanya untuk tetangga, mis. `../interfaces/...`).
- `verbatimModuleSyntax`: tipe wajib `import type`. `erasableSyntaxOnly`: tanpa `enum`/`namespace`/parameter property (pakai `as const`).
- `noUnusedLocals/Parameters` aktif.
- Nama: komponen `PascalCase.tsx`, hook `useXxx.ts`, service/interface `kebab-case`.
- Double quotes + semicolon. Teks UI & pesan error dalam Bahasa Indonesia.
- **UI: pakai komponen shadcn dulu** (`components/ui`); style dengan token (`bg-background`, `text-muted-foreground`, …) dan `cn()` dari `@/lib/utils`. Jangan buat CSS terpisah kecuali perlu.
- Hook mutasi mengembalikan `{ response, error }` tanpa throw; error ≥500 → "Server error".

## Integrasi go-conference
- Endpoint: `POST /webrtc/sdp/m/:meetingId/c/:userId/p/:peerId/s/:isSender` (`isSender=true` publish; false = subscribe ke `peerId`).
- Body/response `{ "Sdp": base64(JSON SessionDescription) }` → `helpers/sdp.ts`.
- Signaling non-trickle: tunggu ICE gathering selesai sebelum kirim offer (lihat `hooks/useConference.ts`).
- Hanya video VP8. Auth belum ada (tahap coba-coba).

## Menambah fitur
1. `services/<area>/<fitur>/{hooks,interfaces}` 2. `modules/<area>/<fitur>/` 3. `pages/<area>/` + export di `index.ts` 4. route di `routes/_<area>.routes.tsx` (daftarkan di `index.routes.tsx`) 5. slice store bila perlu 6. `npm run build && npm run lint`.
