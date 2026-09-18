/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // クリックジャッキング対策（iframe への埋め込みを禁止）
          { key: "X-Frame-Options", value: "DENY" },
          // MIME スニッフィングの抑止
          { key: "X-Content-Type-Options", value: "nosniff" },
          // 外部サイトへ送る Referer を最小限にする
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 使用しないブラウザ機能を明示的に無効化する
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // ダミーページだった /coming-soon を実際の使い方ページへ集約する
      { source: "/coming-soon", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
