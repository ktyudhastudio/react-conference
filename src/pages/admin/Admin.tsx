import { useParams } from "react-router-dom";
import useDocumentTitle from "@hooks/useDocumentTitle";
import AdminDashboard from "@modules/admin/AdminDashboard";
import AdminView from "@modules/admin/AdminView";

/** /admin = daftar rapat aktif; /admin/:meetingId = layar pemantauan penuh. */
export default function Admin() {
  const { meetingId } = useParams();
  useDocumentTitle(meetingId ? `Monitor ${meetingId}` : "Admin");
  return meetingId ? (
    <AdminView key={meetingId} meetingId={meetingId} />
  ) : (
    <AdminDashboard />
  );
}
