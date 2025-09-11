/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  // Removed explicit env mapping. Next.js automatically exposes variables
  // prefixed with NEXT_PUBLIC_ from your process environment / .env.local.
  // Define them in a local .env.local (not committed) or in Vercel project settings.
};

module.exports = nextConfig;
