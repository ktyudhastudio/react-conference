import { create } from "zustand";
import createSessionSlice, { type SessionState } from "./slices/session.slice";

type BoundSliceTypes = SessionState;

const useGlobalStore = create<BoundSliceTypes>()((...setter) => ({
  ...createSessionSlice(...setter),
}));

export default useGlobalStore;
