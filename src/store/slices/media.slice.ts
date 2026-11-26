import type { StateCreator } from "zustand";
import {
  DEFAULT_VIDEO_QUALITY,
  type VideoQualityId,
} from "@constants/videoQuality";

/** Pengaturan perangkat dari layar pre-join. */
export interface MediaState {
  camera: boolean;
  mic: boolean;
  videoDeviceId: string;
  audioDeviceId: string;
  videoQuality: VideoQualityId;
  setMedia: (v: Partial<Omit<MediaState, "setMedia">>) => void;
}

const createMediaSlice: StateCreator<MediaState> = (set) => ({
  camera: false,
  mic: false,
  videoDeviceId: "",
  audioDeviceId: "",
  videoQuality: DEFAULT_VIDEO_QUALITY,
  setMedia: (v) => set(v),
});

export default createMediaSlice;
