import { isAxiosError } from "axios";

/** Pesan error untuk pengguna (Bahasa Indonesia). */
export function requestError(error: unknown): string {
  if (isAxiosError(error)) {
    if ((error.response?.status ?? 0) >= 500) return "Server error";
    return error.response?.data?.error ?? error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Terjadi kesalahan";
}
