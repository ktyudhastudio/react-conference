// Satu-satunya tempat membaca import.meta.env
export const APP_ENV = import.meta.env.VITE_APP_ENV ?? "local";
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Meets";
const API_URL = import.meta.env.VITE_API_URL ?? "";
// Halaman HTTPS tidak boleh memanggil http:// / ws:// (mixed content): jatuh ke origin yang sama
export const BASE_API_URL =
  window.location.protocol === "https:" && API_URL.startsWith("http:")
    ? ""
    : API_URL;
