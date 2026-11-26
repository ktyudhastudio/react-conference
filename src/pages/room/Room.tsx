import { useState } from "react";
import { useParams } from "react-router-dom";
import useDocumentTitle from "@hooks/useDocumentTitle";
import PreJoin from "@modules/room/PreJoin";
import RoomView from "@modules/room/RoomView";
import useGlobalStore from "@store/useStore";

export default function Room() {
  const { meetingId = "" } = useParams();
  const [joined, setJoined] = useState(false);
  useDocumentTitle(joined ? `Meeting ${meetingId}` : `Join ${meetingId}`);
  const userId = useGlobalStore((s) => s.userId);

  if (!joined || !userId)
    return <PreJoin meetingId={meetingId} onJoin={() => setJoined(true)} />;
  return <RoomView key={meetingId} meetingId={meetingId} userId={userId} />;
}
