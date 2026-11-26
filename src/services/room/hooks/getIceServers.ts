import axiosInstance from "@lib/axios-instance";
import { STUN_SERVERS } from "@constants/stun";

const FALLBACK: RTCIceServer[] = [{ urls: [...STUN_SERVERS] }];
let cached: { at: number; servers: RTCIceServer[] } | null = null;
const TTL_MS = 10 * 60 * 1000;

/** GET /webrtc/ice → { iceServers } (STUN + TURN). Gagal → fallback STUN saja. */
export default async function getIceServers(): Promise<RTCIceServer[]> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.servers;
  try {
    const res = await axiosInstance().get<{ iceServers: RTCIceServer[] }>(
      "/webrtc/ice",
    );
    const servers = res.data.iceServers;
    if (!servers?.length) return FALLBACK;
    cached = { at: Date.now(), servers };
    return servers;
  } catch {
    return FALLBACK;
  }
}
