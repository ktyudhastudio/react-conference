import useSWR, { type Fetcher } from "swr";
import axiosInstance from "@lib/axios-instance";
import type { IGetMeetings } from "../interfaces/meetings.type";

/** Rapat yang sedang aktif (polling). */
export default function useGetMeetings(refreshInterval = 3000) {
  const fetcher: Fetcher<IGetMeetings, string> = (url) =>
    axiosInstance()
      .get(url)
      .then((res) => res.data);

  const { data, error, isValidating } = useSWR("/webrtc/meetings", fetcher, {
    refreshInterval,
    keepPreviousData: true,
  });

  return {
    meetings: data?.meetings ?? [],
    loading: !data && !error,
    error,
    refreshing: isValidating,
  };
}
