import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JoinForm, { type JoinValues } from "@modules/room/JoinForm";
import useGlobalStore from "@store/useStore";
import { randomId } from "@helpers/id";
import { DEFAULT_MEETING_ID } from "@constants/meeting";

export default function Home() {
  const navigate = useNavigate();
  const { setMeetingId, setUserId } = useGlobalStore();

  const onSubmit = ({ meetingId, userId }: JoinValues) => {
    setMeetingId(meetingId);
    setUserId(userId);
    navigate(`/room/${meetingId}`);
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Gabung Meeting</CardTitle>
      </CardHeader>
      <CardContent>
        <JoinForm defaultValues={{ meetingId: DEFAULT_MEETING_ID, userId: randomId() }} onSubmit={onSubmit} />
      </CardContent>
    </Card>
  );
}
