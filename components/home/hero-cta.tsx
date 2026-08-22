"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { SubmissionModal } from "@/components/submission/submission-modal";
import { useRouter } from "next/navigation";
import type { Topic } from "@/types/database";

export function HeroCta() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

  useEffect(() => {
    createClient()
      .from("topics")
      .select("*")
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setActiveTopic(data as Topic);
      });
  }, []);

  const handleSubmitted = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={() => setOpen(true)}>
          新語を追加する
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => alert("使い方ページは近日公開予定です")}
        >
          使い方を見る
        </Button>
      </div>
      <SubmissionModal
        activeTopic={activeTopic}
        open={open}
        onOpenChange={setOpen}
        onSubmitted={handleSubmitted}
      />
    </>
  );
}
