"use client";

import { Button } from "@/components/ui/button";

export function LoginButton() {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => alert("ログイン機能は近日公開予定です")}
      aria-label="ログイン"
    >
      ログイン
    </Button>
  );
}
