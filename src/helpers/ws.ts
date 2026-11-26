import { BASE_API_URL } from "@constants/config";

/** URL websocket go-conference. Kosong BASE_API_URL = lewat proxy Vite (origin yang sama). */
export function wsUrl(path: string, params: Record<string, string>) {
  const base = BASE_API_URL
    ? BASE_API_URL.replace(/^http/, "ws")
    : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
  return `${base}${path}?${new URLSearchParams(params).toString()}`;
}
