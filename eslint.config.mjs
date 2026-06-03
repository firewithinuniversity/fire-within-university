import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // React 19's compiler-era rule. The flagged spots (syncing UI to route
      // changes, one-shot init on mount) are intentional and correct here, so
      // surface it as a warning rather than a hard error.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // global-error.tsx replaces the root layout when it renders, so next/link
    // is unavailable there — a plain anchor is the correct escape hatch.
    files: ["app/global-error.tsx"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      ".claude/**",
      "prisma/migrations/**",
      "public/**",
      "*.config.mjs",
      "*.config.ts",
    ],
  },
];

export default eslintConfig;
