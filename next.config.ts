import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostinger's container reports the host machine's full CPU count (63), so
  // Next tries to spawn 63 build workers and hits the container's thread limit
  // ("OS can't spawn worker thread: Resource temporarily unavailable").
  // Pin it to the cores the plan actually provides.
  experimental: {
    cpus: 2,
  },
  images: {
    // Images come from public/homepage and from the CMS media host (any domain
    // set in jmt-admin's HOSTINGER_MEDIA_URL), served as-is — no optimizer, so
    // no remotePatterns allow-list is needed.
    unoptimized: true,
  },
};

export default nextConfig;
