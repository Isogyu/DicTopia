import Link from "next/link";
import { RelativeTime } from "@/components/ui/relative-time";
import { Section } from "./section";
import type { CommentWithWord } from "@/types/database";

/**
 * 最新コメント。
 * 1 件も無いときはセクションごと出さない
 * （空の見出しだけが並ぶと、活動していないサービスに見えるため）。
 */
export function RecentComments({ comments }: { comments: CommentWithWord[] }) {
  if (comments.length === 0) return null;

  return (
    <Section title="最新のコメント" description="造語をめぐる反応">
      <ul className="grid gap-3 sm:grid-cols-2">
        {comments.map((comment) => (
          <li key={comment.id}>
            <Link
              href={`/word/${comment.word_id}`}
              className="block h-full rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <p className="mb-1.5 text-xs font-medium text-primary">
                「{comment.words?.word}」へのコメント
              </p>
              <p className="line-clamp-2 text-sm">{comment.body}</p>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {comment.nickname || "名無し"}
                </span>
                <span aria-hidden="true">・</span>
                <RelativeTime value={comment.created_at} />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
