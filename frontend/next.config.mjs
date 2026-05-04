/** @type {import('next').NextConfig} */
const backendOrigin = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig = {
  reactStrictMode: true,
  // Browser calls same-origin `/backend-api/*`; Next proxies to FastAPI (no CORS issues in dev).
  async rewrites() {
    return [{ source: "/backend-api/:path*", destination: `${backendOrigin}/api/:path*` }];
  },
  // Smaller dev graphs + less barrel re-export work for Recharts.
  experimental: {
    optimizePackageImports: ["recharts"],
  },
  webpack: (config, { dev }) => {
    // Avoid huge gzip packfile caches in dev (fixes "Array buffer allocation failed" on low-RAM machines).
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
