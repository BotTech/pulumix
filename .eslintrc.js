module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:workspaces/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "workspaces"],
  rules: {
    semi: ["error", "always"],
    // Set this to warning to workaround https://github.com/joshuajaco/eslint-plugin-workspaces/issues/11
    "workspaces/no-relative-imports": "warn",
  },
};
