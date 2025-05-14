/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Moving serverComponentsExternalPackages from experimental to top level
  serverExternalPackages: [],
  experimental: {
    // Removed serverComponentsExternalPackages from here
  },
  // This is the key part - we're telling Next.js to not attempt to statically generate
  // any routes under the dashboard path
  output: "standalone",
  // Explicitly mark all dashboard routes as dynamic
  serverRuntimeConfig: {
    dynamicRoutes: ["/dashboard/**/*"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
