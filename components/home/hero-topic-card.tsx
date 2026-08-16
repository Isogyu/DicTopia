import type { Topic } from "@/types/database";

interface HeroTopicCardProps {
  topic: Topic | null;
}

export function HeroTopicCard({ topic }: HeroTopicCardProps) {
  return (
    <section className="w-full border-b border-border/40 bg-muted/40 py-12">
      <div className="container mx-auto px-4">
        {topic ? (
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              今週のお題
            </p>
            <h1 className="mb-3 text-2xl font-bold md:text-3xl">
              {topic.title}
            </h1>
            {topic.description && (
              <p className="text-muted-foreground">{topic.description}</p>
            )}
          </div>
        ) : (
          <div className="max-w-2xl">
            <h1 className="mb-3 text-2xl font-bold md:text-3xl">
              今週のお題はまだありません
            </h1>
            <p className="text-muted-foreground">
              新しいお題が決まるのをお待ちください。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
