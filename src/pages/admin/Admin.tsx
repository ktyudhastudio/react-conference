import { useParams } from "react-router-dom";
import AdminView from "@modules/admin/AdminView";
import { DEFAULT_MEETING_ID } from "@constants/meeting";

export default function Admin() {
  const { meetingId = DEFAULT_MEETING_ID } = useParams();
  return <AdminView key={meetingId} meetingId={meetingId} />;
}
