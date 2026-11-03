// No GitHub Actions o site é servido em https://<usuario>.github.io/<repositorio>/
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath = process.env.GITHUB_ACTIONS && repo ? `/${repo}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
