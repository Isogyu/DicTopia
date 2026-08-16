import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <a href="/" className="text-xl font-bold tracking-tight">
          DicTopia
        </a>
        <Button size="sm" aria-label="造語を作る">
          造語を作る
        </Button>
      </div>
    </header>
  );
}
