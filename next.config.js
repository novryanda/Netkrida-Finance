// next.config.js
import "./src/env.js";
import { chdir } from "process";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try { chdir(__dirname); } catch (err) {
  console.error("Failed to change directory:", err);
}

/** @type {import("next").NextConfig} */
const config = {
  // >>> Tambahkan ini <<<
  eslint: { ignoreDuringBuilds: true },

  images: {
    remotePatterns: [],
    unoptimized: false,
  },

  webpack: (config) => {
    config.cache = false;
    config.context = __dirname;
    return config;
  },
};

export default config;
