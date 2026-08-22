import { HeroCta } from "./hero-cta";

export function Hero() {
  return (
    <section className="w-full bg-gradient-to-br from-indigo-50 to-white py-16">
      <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 md:grid-cols-2 md:py-20">
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl">
            あなたの造語が、
            <br />
            未来の辞書になる。
          </h1>
          <p className="max-w-md text-base text-muted-foreground sm:text-lg">
            DicTopia は、新しい言葉を生み出し、シェアし、育てるコミュニティです。
            今の気持ちや現象を、一つの造語にしてみましょう。
          </p>
          <HeroCta />
        </div>
        <div className="flex justify-center">
          <div className="h-48 w-48 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-400 opacity-80 sm:h-56 sm:w-56 md:h-64 md:w-64" />
        </div>
      </div>
    </section>
  );
}
