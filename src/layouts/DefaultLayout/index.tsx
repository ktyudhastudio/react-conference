import { Link, Outlet, useLocation } from "react-router-dom";
import Clock from "@components/common/Clock";
import SegmentedTabs from "@components/common/SegmentedTabs";
import ModeToggle from "@components/common/ModeToggle";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME } from "@constants/config";

/** Layout beranda ala Google Meet: header ringan (logo kiri, jam/tema/admin kanan). */
export default function DefaultLayout() {
  const { pathname } = useLocation();
  const inAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link to="/" className="justify-self-start text-xl font-medium">
          {APP_NAME}
        </Link>
        <SegmentedTabs
          label="Mode"
          value={inAdmin ? "admin" : "participant"}
          items={[
            { value: "participant", label: "Participant", to: "/" },
            { value: "admin", label: "Admin", to: "/admin" },
          ]}
        />
        <div className="flex items-center justify-self-end gap-1 text-sm text-muted-foreground">
          <span className="mr-2 hidden sm:inline">
            <Clock withDate />
          </span>
          <ModeToggle />
        </div>
      </header>
      <main className="flex-1">
        <div
          key={pathname}
          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500 ease-out"
        >
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
