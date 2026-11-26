export interface ActiveMeeting {
  id: string;
  participants: number;
  /** unix ms */
  startedAt: number;
}

export interface IGetMeetings {
  meetings: ActiveMeeting[];
}
