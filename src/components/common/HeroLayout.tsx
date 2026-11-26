import type { ReactNode } from "react";
import { LogOutIcon, MicIcon, UserIcon, VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Ilustrasi jendela rapat: video lawan bicara, self-view kecil, dan bar kontrol. */
function CallPreview() {
  return (
    <div
      className="mx-auto w-full max-w-md space-y-3 rounded-2xl border bg-card p-3 shadow-sm"
      aria-hidden
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <UserIcon className="size-7" />
          </div>
        </div>
        <div className="absolute right-2 bottom-2 flex aspect-video w-24 items-center justify-center rounded-lg bg-background shadow-md ring-1 ring-foreground/10">
          <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <UserIcon className="size-4" />
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-2">
        <Button
          tabIndex={-1}
          size="icon-lg"
          variant="secondary"
          className="rounded-full"
        >
          <MicIcon />
        </Button>
        <Button
          tabIndex={-1}
          size="icon-lg"
          variant="secondary"
          className="rounded-full"
        >
          <VideoIcon />
        </Button>
        <Button
          tabIndex={-1}
          className="rounded-full bg-destructive px-4 font-semibold text-white hover:bg-destructive"
        >
          <LogOutIcon />
          Leave
        </Button>
      </div>
    </div>
  );
}

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

/** Layout beranda dua kolom ala Google Meet: teks & aksi di kiri, ilustrasi di kanan. */
export default function HeroLayout({ title, description, children }: Props) {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 md:py-20 lg:grid-cols-2">
      <div className="space-y-6">
        <h1 className="text-4xl font-medium tracking-tight text-balance md:text-5xl">
          {title}
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">{description}</p>
        {children}
      </div>
      <CallPreview />
    </div>
  );
}
