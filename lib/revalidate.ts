import { revalidatePath } from "next/cache";

/**
 * ISR キャッシュの破棄。
 *
 * `revalidatePath` は Next のリクエストコンテキスト外（単体テストから
 * Route Handler を直接呼ぶ場合など）では例外を投げる。
 * キャッシュ更新の失敗で書き込み自体を失敗させたくないので握り潰す。
 */
export function safeRevalidate(...paths: string[]): void {
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {
      // キャッシュは revalidate の期限で自然に更新される
    }
  }
}
