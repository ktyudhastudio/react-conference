import { Navigate, useParams } from "react-router-dom";
import RoomView from "@modules/room/RoomView";
import useGlobalStore from "@store/useStore";

export default function Room() {
  const { meetingId = "" } = useParams();
  const userId = useGlobalStore((s) => s.userId);

  if (!userId) return <Navigate to="/" replace />;
  return <RoomView meetingId={meetingId} userId={userId} />;
}
