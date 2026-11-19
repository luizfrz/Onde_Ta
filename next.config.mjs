const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath = process.env.GITHUB_ACTIONS && repo ? `/${repo}` : "";

const nextConfig = {
  output: "export",
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
