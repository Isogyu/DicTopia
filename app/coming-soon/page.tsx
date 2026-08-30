import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "近日公開 - DicTopia",
  description: "この機能は近日公開予定です。",
};

export default function ComingSoonPage() {
  return (
    <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="mb-4 text-3xl font-bold text-foreground">近日公開</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        この機能は現在準備中です。もうしばらくお待ちください。
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "lg" }))}
      >
        トップページへ戻る
      </Link>
    </div>
  );
}
