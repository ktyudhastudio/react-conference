import type { StateCreator } from "zustand";

export interface SessionState {
  meetingId: string;
  setMeetingId: (id: string) => void;
  userId: string;
  setUserId: (id: string) => void;
}

const createSessionSlice: StateCreator<SessionState> = (set) => ({
  meetingId: "",
  setMeetingId: (meetingId) => set({ meetingId }),
  userId: "",
  setUserId: (userId) => set({ userId }),
});

export default createSessionSlice;
