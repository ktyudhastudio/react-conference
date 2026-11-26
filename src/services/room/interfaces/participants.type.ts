export type QualityLevel = "good" | "fair" | "poor";

/** Kualitas koneksi peserta ke server (arah unggah), diukur server. */
export interface Quality {
  rttMs: number;
  lossPct: number;
  jitterMs: number;
  bitrateKbps: number;
  level: QualityLevel;
}

export interface Participant {
  userId: string;
  camera: boolean;
  mic: boolean;
  /** koneksi media aktif di server (bisa di-subscribe) */
  publishing: boolean;
  /** belum ada sebelum sampel pertama */
  quality?: Quality;
}

export interface ChatMessage {
  id: number;
  from: string;
  text: string;
  /** unix ms */
  at: number;
}

export type AdminAction = "mute_mic" | "camera_off" | "kick" | "allow";

/** Pesan dari server lewat websocket */
export type ServerMessage =
  | { type: "state"; participants: Participant[]; blocked: string[] }
  | ({ type: "chat" } & ChatMessage)
  | { type: "history"; messages: ChatMessage[] }
  | { type: "command"; action: Exclude<AdminAction, "allow"> };
