"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function HamburgerMenu() {
  const router = useRouter();
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => router.push("/coming-soon")}
      aria-label="メニュー"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
