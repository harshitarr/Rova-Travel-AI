/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // allow external example images used in sample data
    domains: ["example.com"],
  },
};

export default nextConfig;
