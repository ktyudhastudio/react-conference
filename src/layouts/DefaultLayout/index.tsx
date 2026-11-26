import { Link, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME } from "@constants/config";

export default function DefaultLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link to="/" className="font-semibold">
            {APP_NAME}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
