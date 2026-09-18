import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_TAGLINE,
  absoluteUrl,
  getSiteUrl,
} from "@/lib/site";
import { getActiveTopic } from "@/lib/topics";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import { SubmissionProvider } from "@/components/submission/submission-provider";
import { VoteStatusProvider } from "@/components/word/vote-status-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME}｜${SITE_TAGLINE}`,
    // 個別ページのタイトルに自動でブランド名を付ける
    template: `%s｜${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    title: `${SITE_NAME}｜${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: getSiteUrl(),
    images: [
      {
        url: absoluteUrl("/api/og"),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}｜${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/api/og")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

/** 検索エンジンにサイトの性質と検索機能を伝える構造化データ */
function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "ディクトピア",
    url: getSiteUrl(),
    description: SITE_DESCRIPTION,
    inLanguage: "ja",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/search?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // お題はアプリ全体で 1 度だけ取得し、投稿モーダルへ配る
  const activeTopic = await getActiveTopic();

  return (
    <html
      lang="ja"
      className={cn("font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body
        className={cn(
          inter.className,
          "flex min-h-screen flex-col bg-background text-foreground antialiased"
        )}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          本文へスキップ
        </a>
        <ToastProvider>
          <SubmissionProvider activeTopic={activeTopic}>
            <VoteStatusProvider>
              <Navbar />
              <main id="main" className="flex-1">
                {children}
              </main>
              <Footer />
            </VoteStatusProvider>
          </SubmissionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
