import axiosInstance from "@lib/axios-instance";
import { STUN_SERVERS } from "@constants/stun";

const FALLBACK: RTCIceServer[] = [{ urls: [...STUN_SERVERS] }];
const TTL_OK = 30 * 60_000; // kredensial TURN berlaku 24 jam; segarkan tiap 30 menit
const TTL_FALLBACK = 30_000; // server ICE belum terjangkau: coba lagi sebentar lagi

let cache: { servers: RTCIceServer[]; until: number } | null = null;
let inflight: Promise<RTCIceServer[]> | null = null;

/** Daftar ICE server (STUN + TURN) bila sudah dimuat; null bila belum / kedaluwarsa. */
export const iceServersNow = () =>
  cache && Date.now() < cache.until ? cache.servers : null;

/** Ambil STUN+TURN dari go-conference (GET /webrtc/ice). Gagal → STUN saja. */
export function loadIceServers(): Promise<RTCIceServer[]> {
  const fresh = iceServersNow();
  if (fresh) return Promise.resolve(fresh);
  inflight ??= axiosInstance()
    .get<{ iceServers?: RTCIceServer[] }>("/webrtc/ice", { timeout: 4000 })
    .then((r) => {
      const servers = r.data.iceServers;
      return servers?.length
        ? { servers, ttl: TTL_OK }
        : { servers: FALLBACK, ttl: TTL_FALLBACK };
    })
    .catch(() => ({ servers: FALLBACK, ttl: TTL_FALLBACK }))
    .then(({ servers, ttl }) => {
      cache = { servers, until: Date.now() + ttl };
      return servers;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
