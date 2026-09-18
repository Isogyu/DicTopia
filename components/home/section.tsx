import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  description?: string;
  /** 「もっと見る」の遷移先。指定すると回遊導線が出る。 */
  moreHref?: string;
  moreLabel?: string;
  children: ReactNode;
}

export function Section({
  title,
  description,
  moreHref,
  moreLabel = "もっと見る",
  children,
}: SectionProps) {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {moreHref && (
          <Link
            href={moreHref}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary hover:underline"
          >
            {moreLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
