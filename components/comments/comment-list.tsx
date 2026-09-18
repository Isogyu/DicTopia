import { RelativeTime } from "@/components/ui/relative-time";
import type { Comment } from "@/types/database";

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        まだコメントがありません。最初のコメントを投稿してみましょう。
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded-xl border border-border bg-card p-4 text-card-foreground"
        >
          <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {comment.nickname || "名無し"}
            </span>
            <span aria-hidden="true">・</span>
            <RelativeTime value={comment.created_at} />
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {comment.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
