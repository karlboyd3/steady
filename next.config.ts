import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // This project sits under a home dir that also has a lockfile; pin the
  // tracing root so Next packages the right files.
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
