/** SDP di wire = base64(JSON SessionDescription) — format go-conference. */
export function encodeSdp(desc: RTCSessionDescriptionInit | null): string {
  return btoa(JSON.stringify(desc));
}

export function decodeSdp(encoded: string): RTCSessionDescriptionInit {
  return JSON.parse(atob(encoded));
}
