import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Changed to false to ensure build errors are visible
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This is to fix a warning from opentelemetry when building.
    // It's an optional dependency and we're not using Jaeger, so we can ignore it.
    if (isServer) {
        config.externals.push('@opentelemetry/exporter-jaeger');
    }
    return config;
  },
};

export default nextConfig;
