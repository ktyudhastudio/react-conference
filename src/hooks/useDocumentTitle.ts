import { useEffect } from "react";
import { APP_NAME } from "@constants/config";

/** Judul tab per halaman: "<judul> – Meets" (tanpa argumen: judul default beranda). */
export default function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? `${title} – ${APP_NAME}`
      : `${APP_NAME} – Video meetings for everyone`;
  }, [title]);
}
