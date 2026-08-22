"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function HamburgerMenu() {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => alert("メニューは近日公開予定です")}
      aria-label="メニュー"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
