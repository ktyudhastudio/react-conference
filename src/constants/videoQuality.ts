/** Preset kualitas video kiriman (upload). Batas dipasang di RTCRtpSender, tanpa membuka ulang kamera. */
export const VIDEO_QUALITIES = {
  low: {
    label: "Data saver",
    hint: "360p · ~0.3 Mbps",
    height: 360,
    maxBitrate: 300_000,
    maxFramerate: 15,
  },
  medium: {
    label: "Standard",
    hint: "480p · ~0.7 Mbps",
    height: 480,
    maxBitrate: 700_000,
    maxFramerate: 24,
  },
  high: {
    label: "HD",
    hint: "720p · ~1.5 Mbps",
    height: 720,
    maxBitrate: 1_500_000,
    maxFramerate: 30,
  },
} as const;

export type VideoQualityId = keyof typeof VIDEO_QUALITIES;

export const DEFAULT_VIDEO_QUALITY: VideoQualityId = "low";

export const VIDEO_QUALITY_OPTIONS = (
  Object.keys(VIDEO_QUALITIES) as VideoQualityId[]
).map((id) => ({
  value: id,
  label: VIDEO_QUALITIES[id].label,
  description: VIDEO_QUALITIES[id].hint,
}));

/** Kamera selalu dibuka di 720p; penurunan resolusi dilakukan saat dikirim. */
export const CAPTURE_VIDEO = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30 },
} as const;
