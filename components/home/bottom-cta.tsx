"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SubmissionModal } from "@/components/submission/submission-modal";
import { createClient } from "@/lib/supabase/client";
import type { Topic } from "@/types/database";

export function BottomCta() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
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
    <section className="bg-indigo-600 py-16 text-white">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-6 text-2xl font-bold sm:text-3xl">
          あなたの言葉が、未来の辞書に。
        </p>
        <Button
          size="lg"
          className="bg-white text-indigo-600 hover:bg-white/90"
          onClick={() => setOpen(true)}
        >
          新語を追加する
        </Button>
      </div>
      <SubmissionModal
        activeTopic={activeTopic}
        open={open}
        onOpenChange={setOpen}
        onSubmitted={handleSubmitted}
      />
    </section>
  );
}
