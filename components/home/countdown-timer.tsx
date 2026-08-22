"use client";

import { useEffect, useState } from "react";
import { getCountdownMs, formatCountdown } from "@/lib/week";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getCountdownMs());

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getCountdownMs());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-sm text-muted-foreground">
      次のお題切り替えまで {formatCountdown(timeLeft)}
    </div>
  );
}
