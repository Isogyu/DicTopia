export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} DicTopia. All rights reserved.
      </div>
    </footer>
  );
}
