// Satu-satunya tempat membaca import.meta.env
export const APP_ENV = import.meta.env.VITE_APP_ENV ?? "local";
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Conference";
export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL ?? "";
