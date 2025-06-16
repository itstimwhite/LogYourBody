import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:jsx-a11y/recommended"
  ),
  {
    rules: {
      // Configure jsx-a11y label rule to recognize nested inputs
      "jsx-a11y/label-has-associated-control": ["error", {
        "controlComponents": ["input"],
        "assert": "either",
        "depth": 3
      }]
    }
  }
];

export default eslintConfig;
