export function getJSTDate(date = new Date()): Date {
  return new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
}

export function getCurrentWeekCode(date = new Date()): string {
  const jst = getJSTDate(date);
  const year = jst.getFullYear();
  const week = getISOWeek(jst);
  return `${year}-W${week.toString().padStart(2, "0")}`;
}

export function getNextResetTimestamp(date = new Date()): number {
  const jst = getJSTDate(date);

  const year = jst.getFullYear();
  const month = jst.getMonth(); // 0-based
  const day = jst.getDate();
  const dayOfWeek = jst.getDay(); // 0=Sun, 6=Sat

  // 今週の日曜 23:59:59 JST を UTC に変換（JST = UTC+9）
  let daysUntilSunday = (7 - dayOfWeek) % 7;
  if (daysUntilSunday === 0) {
    // すでに日曜なら今日の 23:59:59
    daysUntilSunday = 0;
  }

  return Date.UTC(
    year,
    month,
    day + daysUntilSunday,
    23 - 9, // JST 23 = UTC 14
    59,
    59
  );
}

export function getCountdownMs(date = new Date()): number {
  const target = getNextResetTimestamp(date);
  return Math.max(0, target - date.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}日 ${hours.toString().padStart(2, "0")}時間 ${minutes
      .toString()
      .padStart(2, "0")}分 ${seconds.toString().padStart(2, "0")}秒`;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function getISOWeek(date: Date): number {
  const tmp = new Date(date.valueOf());
  const dayNum = (date.getDay() + 6) % 7;
  tmp.setDate(tmp.getDate() - dayNum + 3);
  const firstThursday = tmp.valueOf();
  tmp.setMonth(0, 1);
  if (tmp.getDay() !== 4) {
    tmp.setMonth(0, 1 + ((4 - tmp.getDay() + 7) % 7));
  }
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return 1 + Math.ceil((firstThursday - tmp.valueOf()) / oneWeek);
}
