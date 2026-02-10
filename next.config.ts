import type { NextConfig } from "next";

const FTP_DOMAIN = process.env.FTP_DOMAIN as string;

const nextConfig: NextConfig = {
  // 1. Sua configuração de Imagens
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: FTP_DOMAIN,
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;