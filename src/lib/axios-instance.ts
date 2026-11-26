import axios from "axios";
import { BASE_API_URL } from "@constants/config";

/** Factory axios. Auth belum dipakai (tahap coba-coba). */
export default function axiosInstance() {
  return axios.create({
    baseURL: BASE_API_URL,
    headers: { "Content-Type": "application/json" },
  });
}
