const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/*
 * This is a custom ESLint configuration for use with
 * Next.js apps.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: [
    "@vercel/style-guide/eslint/node",
    "@vercel/style-guide/eslint/typescript",
    "@vercel/style-guide/eslint/browser",
    "@vercel/style-guide/eslint/react",
    "@vercel/style-guide/eslint/next",
    "eslint-config-turbo",
  ].map(require.resolve),
  parserOptions: {
    project,
  },
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
      node: {
        extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  ignorePatterns: ["node_modules/", "dist/","**/*"],
  // add rules configurations here
  rules: {
    camelcase: "off",
    'no-console': 'warn', // Warn on console.log statements
    'no-unused-vars': 'warn', // Warn on variables that aren't used
    'no-constant-condition': 'warn', // Warn if there's a constant condition
    'no-debugger': 'warn', // Warn on debugger statements
    'no-empty': 'warn', // Warn on empty blocks
    'eqeqeq': 'warn', // Warn on == or != (recommend === and !==)
    'no-redeclare': 'warn', // Warn on redeclaring a variable
    'no-unreachable': 'warn', // Warn on unreachable code
  },
};
