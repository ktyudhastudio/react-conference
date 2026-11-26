import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** isi bebas: daftar opsi (radio/checkbox), form, dsb. */
  children?: ReactNode;
  /** area tombol di bawah */
  footer?: ReactNode;
}

/**
 * Wadah bottom sheet (geser dari bawah, bisa di-swipe untuk menutup).
 * Hanya kerangka: isinya diberikan lewat `children` / `footer`.
 */
export default function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          // ukuran ponsel, melayang di tengah bawah (juga di desktop)
          "mx-auto mb-3 w-[calc(100%-1.5rem)] max-w-sm",
          // liquid glass: transparan + blur, sudut besar, tepi tipis terang
          "data-[swipe-direction=down]:rounded-[2rem] data-[swipe-direction=down]:border",
          "border-white/25 bg-popover/60 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-popover/50",
          "after:hidden",
        )}
      >
        <div className="w-full pb-2">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
          {children}
          {footer && <DrawerFooter>{footer}</DrawerFooter>}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
