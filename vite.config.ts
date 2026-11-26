import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // `npm run dev:https` → HTTPS self-signed agar kamera jalan lewat IP jaringan
  plugins: [react(), tailwindcss(), ...(mode === "https" ? [basicSsl()] : [])],
  server: {
    // signaling ke go-conference (GOLANG_PORT=8080)
    proxy: {
      "/webrtc": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@context": path.resolve(__dirname, "src/context"),
      "@constants": path.resolve(__dirname, "src/constants"),
      "@helpers": path.resolve(__dirname, "src/helpers"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@layouts": path.resolve(__dirname, "src/layouts"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@modules": path.resolve(__dirname, "src/modules"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@services": path.resolve(__dirname, "src/services"),
      "@store": path.resolve(__dirname, "src/store"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@assets": path.resolve(__dirname, "src/assets"),
    },
  },
}));
