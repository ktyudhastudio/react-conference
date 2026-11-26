import { mutate } from "swr";

/** Revalidate semua cache SWR yang key-nya cocok dengan regex. */
export function useRevalidateMutation() {
  return (pattern: RegExp) =>
    mutate((key) => typeof key === "string" && pattern.test(key));
}
