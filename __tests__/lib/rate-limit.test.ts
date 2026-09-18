import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// rate-limit は NODE_ENV === "test" で無効化されるため、
// 挙動を検証するためにモジュールを読み込む前に無効化を解除する。
async function loadRateLimit() {
  vi.resetModules();
  // NODE_ENV は型上 readonly なので、env オブジェクト経由で差し替える
  const env = process.env as Record<string, string | undefined>;
  const original = env.NODE_ENV;
  const originalFlag = env.DISABLE_RATE_LIMIT;
  env.NODE_ENV = "production";
  env.DISABLE_RATE_LIMIT = "false";
  const mod = await import("@/lib/rate-limit");
  env.NODE_ENV = original;
  env.DISABLE_RATE_LIMIT = originalFlag;
  return mod;
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("上限までは許可し、超えたら拒否する", async () => {
    const { rateLimit } = await loadRateLimit();

    expect(rateLimit("k1", 3, 1000).ok).toBe(true);
    expect(rateLimit("k1", 3, 1000).ok).toBe(true);
    expect(rateLimit("k1", 3, 1000).ok).toBe(true);

    const blocked = rateLimit("k1", 3, 1000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("キーごとに独立して数える", async () => {
    const { rateLimit } = await loadRateLimit();

    rateLimit("a", 1, 1000);
    expect(rateLimit("a", 1, 1000).ok).toBe(false);
    expect(rateLimit("b", 1, 1000).ok).toBe(true);
  });

  it("ウィンドウが過ぎると再び許可する", async () => {
    const { rateLimit } = await loadRateLimit();

    rateLimit("w", 1, 1000);
    expect(rateLimit("w", 1, 1000).ok).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(rateLimit("w", 1, 1000).ok).toBe(true);
  });

  it("テスト環境では無効化される", async () => {
    vi.resetModules();
    const { rateLimit } = await import("@/lib/rate-limit");
    for (let i = 0; i < 10; i++) {
      expect(rateLimit("disabled", 1, 1000).ok).toBe(true);
    }
  });
});
