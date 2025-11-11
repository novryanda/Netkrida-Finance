// eslint.config.js
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  // 1) Batasi file yang discan
  {
    files: [
      "app/**/*.{ts,tsx,js,jsx}",
      "pages/**/*.{ts,tsx,js,jsx}",
      "src/**/*.{ts,tsx,js,jsx}",
      "components/**/*.{ts,tsx,js,jsx}",
    ],
    ignores: [
      "**/node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "public/**",
      "**/.git/**",
    ],
    languageOptions: {
      parserOptions: {
        // Kunci resolusi project ke root repo ini
        tsconfigRootDir: import.meta.dirname,
        project: ["./tsconfig.json"],
        // Atau kalau ingin sangat ringan: aktifkan projectService dan hapus "project"
        // projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // 2) Tetap ambil aturan Next, tapi via compat—ini aman karena files/ignores sudah ketat
  ...compat.extends("next/core-web-vitals"),

  // 3) (Opsional) layer tambahan khusus TypeScript type-checked
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
  }
);
