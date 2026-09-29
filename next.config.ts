import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/*": ["./app/generated/prisma/query_compiler_bg.postgresql.wasm"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // Next 16 enables its subprocess-based TypeScript CLI by default. The
  // compiler API is deterministic in restricted CI/sandbox environments.
  experimental: {
    useTypeScriptCli: false,
  },
};

export default nextConfig;
