/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
