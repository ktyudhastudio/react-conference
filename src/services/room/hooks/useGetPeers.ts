import useSWR, { type Fetcher } from "swr";
import axiosInstance from "@lib/axios-instance";
import type { IGetPeers } from "../interfaces/peers.type";

/** Publisher aktif di sebuah meeting (polling). */
export default function useGetPeers(meetingId: string, refreshInterval = 3000) {
  const fetcher: Fetcher<IGetPeers, string> = (url) =>
    axiosInstance()
      .get(url)
      .then((res) => res.data);

  const { data, error } = useSWR(meetingId ? `/webrtc/m/${meetingId}/peers` : null, fetcher, {
    refreshInterval,
    keepPreviousData: true,
  });

  return { peers: data?.peers ?? [], loading: !data && !error, error };
}
