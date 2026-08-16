import { createHash } from "crypto";

function getJstToday(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

export function generateVoterHash(
  ip: string,
  userAgent: string,
  date = getJstToday()
): string {
  return createHash("sha256")
    .update(`${ip}:${userAgent}:${date}`, "utf8")
    .digest("hex");
}

export function generateReporterHash(
  ip: string,
  userAgent: string,
  date = getJstToday()
): string {
  return generateVoterHash(ip, userAgent, date);
}
