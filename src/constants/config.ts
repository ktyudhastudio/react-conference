// Satu-satunya tempat membaca import.meta.env
export const APP_ENV = import.meta.env.VITE_APP_ENV ?? "local";
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Meets";
export const BASE_API_URL = import.meta.env.VITE_API_URL ?? "";
