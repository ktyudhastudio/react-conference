import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

/** Layout layar penuh ala Google Meet (tema gelap, tanpa header). */
export default function RoomLayout() {
  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <Outlet />
      <Toaster />
    </div>
  );
}
