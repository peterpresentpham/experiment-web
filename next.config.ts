/** @type {import('next').NextConfig} */
const nextConfig = {
  // Automatically Copying Traced Files
  output: 'standalone',
  reactStrictMode: true,
  images: {
    deviceSizes: [520, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async headers() {
    // Cross-origin isolation (SharedArrayBuffer) lets the caro hell engine search on several
    // threads. Site-wide, because a client-side navigation keeps the first page's headers.
    // `credentialless` still loads third-party scripts such as GTM, just without cookies.
    const isolation = {
      source: '/:path*',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
      ],
    };
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      return [
        isolation,
        {
          source: '/_next/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, max-age=0, must-revalidate',
            },
          ],
        },
      ];
    }
    return [isolation];
  },
};

export default nextConfig;
