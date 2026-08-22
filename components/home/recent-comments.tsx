import { toRelativeTime } from "@/lib/relative-time";
import type { CommentWithWord } from "@/types/database";

interface RecentCommentsProps {
  comments: CommentWithWord[];
}

export function RecentComments({ comments }: RecentCommentsProps) {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold text-foreground">最新のコメント</h2>
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          まだコメントがありません。造語にコメントを残してみましょう。
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
            >
              <p className="mb-2 text-sm text-muted-foreground">
                「{comment.words.word}」へのコメント
              </p>
              <p className="mb-2 line-clamp-2 text-sm">{comment.body}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {comment.nickname ?? "名無し"}
                </span>
                <span>・</span>
                <span>{toRelativeTime(comment.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
