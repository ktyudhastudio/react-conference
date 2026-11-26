import { useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import type { Panel } from "@components/common/PanelTabs";

/** Status panel sidebar (Peserta/Chat) + hitung pesan belum dibaca. Harus di dalam SidebarProvider. */
export default function useMeetingPanel(messageCount: number) {
  const {
    open: desktopOpen,
    openMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();
  // di mobile sidebar berupa sheet dengan state terpisah
  const open = isMobile ? openMobile : desktopOpen;
  const [panel, setPanel] = useState<Panel>("people");
  const [seen, setSeen] = useState(0);

  useEffect(() => {
    if (open && panel === "chat") setSeen(messageCount);
  }, [open, panel, messageCount]);

  /** Tombol footer: buka panel itu, atau tutup jika sudah terbuka. */
  const openPanel = (p: Panel) => {
    if (open && panel === p) return toggleSidebar();
    setPanel(p);
    if (!open) toggleSidebar();
  };

  return {
    panel,
    setPanel,
    open,
    openPanel,
    unread: Math.max(0, messageCount - seen),
  };
}
