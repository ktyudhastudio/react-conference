import type { StateCreator } from "zustand";

/** Pengaturan perangkat dari layar pre-join. */
export interface MediaState {
  camera: boolean;
  mic: boolean;
  videoDeviceId: string;
  audioDeviceId: string;
  setMedia: (v: Partial<Omit<MediaState, "setMedia">>) => void;
}

const createMediaSlice: StateCreator<MediaState> = (set) => ({
  camera: false,
  mic: false,
  videoDeviceId: "",
  audioDeviceId: "",
  setMedia: (v) => set(v),
});

export default createMediaSlice;
