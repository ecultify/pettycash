import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project — there are other lockfiles
  // higher up the filesystem that Next.js would otherwise pick up.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
