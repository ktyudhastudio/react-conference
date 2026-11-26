export interface SdpPayload {
  Sdp: string;
}

export interface SdpResponse {
  Sdp: string;
}

export interface SdpParams {
  meetingId: string;
  userId: string;
  peerId: string;
  isSender: boolean;
}
