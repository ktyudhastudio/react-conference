import { create } from "zustand";
import createMediaSlice, { type MediaState } from "./slices/media.slice";
import createSessionSlice, { type SessionState } from "./slices/session.slice";

type BoundSliceTypes = SessionState & MediaState;

const useGlobalStore = create<BoundSliceTypes>()((...setter) => ({
  ...createSessionSlice(...setter),
  ...createMediaSlice(...setter),
}));

export default useGlobalStore;
