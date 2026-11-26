import axiosInstance from "@lib/axios-instance";
import { requestError } from "@helpers/request-error";
import type { SdpParams, SdpResponse } from "../interfaces/sdp.type";

/** POST /webrtc/sdp/m/:meetingId/c/:userId/p/:peerId/s/:isSender → { response, error } (tanpa throw) */
export default function useSendSdp() {
  return async (params: SdpParams, sdp: string) => {
    const { meetingId, userId, peerId, isSender } = params;
    try {
      const res = await axiosInstance().post<SdpResponse>(
        `/webrtc/sdp/m/${meetingId}/c/${userId}/p/${peerId || "-"}/s/${isSender}`,
        { Sdp: sdp },
      );
      return { response: res.data, error: null };
    } catch (e) {
      return { response: null, error: requestError(e) };
    }
  };
}
