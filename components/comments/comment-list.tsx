import { toRelativeTime } from "@/lib/relative-time";
import type { Comment } from "@/types/database";

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        まだコメントがありません。最初のコメントを投稿してみましょう。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {comment.nickname ?? "名無し"}
            </span>
            <span>・</span>
            <span>{toRelativeTime(comment.created_at)}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
        </div>
      ))}
    </div>
  );
}
